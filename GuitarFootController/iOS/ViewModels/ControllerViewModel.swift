import Foundation
import SwiftUI
import Combine

public final class ControllerViewModel: ObservableObject {
    // Current Active Rig
    @Published public var presets: [Preset] = []
    @Published public var activePreset: Preset
    @Published public var activeBank: Bank
    
    // Switch States (index 0 to 7)
    @Published public var switchOnStates: [Bool] = Array(repeating: false, count: 8)
    @Published public var switchPressedStates: [Bool] = Array(repeating: false, count: 8)
    @Published public var lastTriggeredMidiDescription: String = "Ready"
    @Published public var lastTriggerTime: Date? = nil
    
    // Services
    public let udpClient: UDPClientService
    public let bonjourBrowser: BonjourBrowser
    public let persistence: PersistenceService
    @Published public var appSettings: AppSettings
    
    // UI Sheets
    @Published public var showingSettingsSheet: Bool = false
    @Published public var showingBankPickerSheet: Bool = false
    @Published public var editingSwitchIndex: Int? = nil
    
    private var cancellables = Set<AnyCancellable>()
    private var longPressTimers: [Int: DispatchWorkItem] = [:]
    private var lastSentMidiMessages: [Int: MIDIMessage] = [:]
    
    public init(
        udpClient: UDPClientService = UDPClientService(),
        bonjourBrowser: BonjourBrowser = BonjourBrowser(),
        persistence: PersistenceService = PersistenceService.shared
    ) {
        self.udpClient = udpClient
        self.bonjourBrowser = bonjourBrowser
        self.persistence = persistence
        
        let loadedPresets = persistence.loadPresets()
        self.presets = loadedPresets
        
        let initialPreset = loadedPresets.first ?? Preset.defaultPreset()
        self.activePreset = initialPreset
        self.activeBank = initialPreset.banks.first ?? Bank.defaultBanks()[0]
        self.appSettings = persistence.loadSettings()
        
        setupBindings()
        startNetworkAutoConnect()
    }
    
    private func setupBindings() {
        // Forward changes from UDP client and Bonjour
        udpClient.objectWillChange.sink { [weak self] _ in
            self?.objectWillChange.send()
        }.store(in: &cancellables)
        
        bonjourBrowser.objectWillChange.sink { [weak self] _ in
            self?.objectWillChange.send()
        }.store(in: &cancellables)
    }
    
    public func startNetworkAutoConnect() {
        if appSettings.useManualIP && !appSettings.manualBridgeIP.isEmpty {
            udpClient.connect(host: appSettings.manualBridgeIP, port: appSettings.udpPort)
        } else {
            bonjourBrowser.startDiscovery(serviceType: appSettings.bonjourServiceType)
            // Auto-connect to first discovered bridge if available
            bonjourBrowser.$discoveredBridges
                .filter { !$0.isEmpty && self.udpClient.connectionStatus == .disconnected && self.appSettings.autoReconnect }
                .first()
                .receive(on: DispatchQueue.main)
                .sink { [weak self] bridges in
                    if let first = bridges.first {
                        self?.udpClient.connect(host: first.hostName, port: first.port, bridgeName: first.name)
                    }
                }
                .store(in: &cancellables)
        }
    }
    
    // MARK: - Footswitch Press & Release Handlers
    
    public func handleSwitchPressDown(index: Int) {
        guard index >= 0 && index < 8 && index < activeBank.switches.count else { return }
        switchPressedStates[index] = true
        
        if appSettings.enableHapticFeedback {
            HapticService.shared.triggerSwitchTap()
        }
        
        let config = activeBank.switches[index]
        
        // Schedule long press detector (450ms)
        if config.longPressAction.isEnabled {
            let workItem = DispatchWorkItem { [weak self] in
                guard let self = self, self.switchPressedStates[index] else { return }
                self.handleLongPressTriggered(index: index)
            }
            longPressTimers[index] = workItem
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45, execute: workItem)
        }
        
        // If Momentary Mode: Turn ON immediately on Press Down
        if config.mode == .momentary {
            switchOnStates[index] = true
            dispatchMidiForSwitch(config: config, isTap: true, turnOn: true)
        }
    }
    
    public func handleSwitchPressUp(index: Int) {
        guard index >= 0 && index < 8 && index < activeBank.switches.count else { return }
        switchPressedStates[index] = false
        
        let config = activeBank.switches[index]
        
        // Cancel pending long press if released before 450ms
        if let timer = longPressTimers[index] {
            timer.cancel()
            longPressTimers.removeValue(forKey: index)
            
            // This was a regular TAP (not a long press)
            if config.mode == .toggle {
                let newState = !switchOnStates[index]
                switchOnStates[index] = newState
                dispatchMidiForSwitch(config: config, isTap: true, turnOn: newState)
            }
        }
        
        // If Momentary Mode: Turn OFF immediately on Release
        if config.mode == .momentary {
            switchOnStates[index] = false
            dispatchMidiForSwitch(config: config, isTap: true, turnOn: false)
        }
        
        if appSettings.enableHapticFeedback {
            HapticService.shared.triggerSwitchRelease()
        }
    }
    
    private func handleLongPressTriggered(index: Int) {
        guard index >= 0 && index < activeBank.switches.count else { return }
        longPressTimers.removeValue(forKey: index)
        
        if appSettings.enableHapticFeedback {
            HapticService.shared.triggerLongPress()
        }
        
        let config = activeBank.switches[index]
        dispatchMidiForSwitch(config: config, isTap: false, turnOn: true)
    }
    
    // MARK: - MIDI Message Dispatcher
    
    private func dispatchMidiForSwitch(config: FootswitchConfig, isTap: Bool, turnOn: Bool) {
        let actionConfig = isTap ? config.tapAction : config.longPressAction
        guard actionConfig.isEnabled else { return }
        
        let targetValue = turnOn ? actionConfig.onValue : actionConfig.offValue
        
        let midi = MIDIMessage(
            type: actionConfig.midiType,
            channel: actionConfig.channel,
            number: actionConfig.number,
            value: targetValue,
            isNoteOn: actionConfig.midiType == .note ? turnOn : true
        )
        
        // Prevent duplicate MIDI spam if configured
        if appSettings.preventDuplicateMIDI, let last = lastSentMidiMessages[config.index], last == midi {
            // Duplicate detected; still allow if momentary release
            if config.mode != .momentary { return }
        }
        
        lastSentMidiMessages[config.index] = midi
        lastTriggeredMidiDescription = "\(config.name) → \(midi.description)"
        lastTriggerTime = Date()
        
        let payload = SwitchEventPayload(
            switchIndex: UInt8(config.index),
            switchName: config.name,
            isPressed: switchPressedStates[config.index],
            isLongPress: !isTap,
            isOn: switchOnStates[config.index],
            midiMessage: midi
        )
        
        udpClient.sendSwitchEvent(payload)
    }
    
    // MARK: - Bank & Preset Operations
    
    public func selectBank(_ bank: Bank) {
        self.activeBank = bank
        self.switchOnStates = Array(repeating: false, count: 8)
        self.switchPressedStates = Array(repeating: false, count: 8)
        
        if appSettings.enableHapticFeedback {
            HapticService.shared.triggerBankChange()
        }
        
        udpClient.sendBankChange(bankName: bank.name)
        saveState()
    }
    
    public func selectPreset(_ preset: Preset) {
        self.activePreset = preset
        if let defaultBank = preset.banks.first(where: { $0.id == preset.defaultBankId }) ?? preset.banks.first {
            selectBank(defaultBank)
        }
        saveState()
    }
    
    public func updateSwitchConfig(_ updated: FootswitchConfig) {
        guard let bIndex = activePreset.banks.firstIndex(where: { $0.id == activeBank.id }),
              let sIndex = activeBank.switches.firstIndex(where: { $0.id == updated.id }) else { return }
        
        activeBank.switches[sIndex] = updated
        activePreset.banks[bIndex].switches[sIndex] = updated
        
        if let pIndex = presets.firstIndex(where: { $0.id == activePreset.id }) {
            presets[pIndex] = activePreset
        }
        saveState()
    }
    
    public func saveState() {
        persistence.savePresets(presets)
        persistence.saveActivePresetId(activePreset.id)
        persistence.saveSettings(appSettings)
    }
}
