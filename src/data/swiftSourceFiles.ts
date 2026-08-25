export interface SwiftFileEntry {
  path: string;
  category: 'Shared' | 'iOS App' | 'iOS Models' | 'iOS Services' | 'iOS Views' | 'iOS Settings' | 'Mac Bridge' | 'Build & Tests';
  description: string;
  content: string;
}

export const swiftSourceFiles: SwiftFileEntry[] = [
  {
    path: 'Package.swift',
    category: 'Build & Tests',
    description: 'Swift Package Manager manifest defining iOS App, Mac Bridge, and Shared targets (No Xcode needed).',
    content: `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GuitarFootController",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .executable(name: "GuitarFootControllerIOS", targets: ["GuitarFootControllerIOS"]),
        .executable(name: "MacMIDIBridge", targets: ["MacMIDIBridge"]),
        .library(name: "GuitarFootShared", targets: ["GuitarFootShared"])
    ],
    dependencies: [],
    targets: [
        .target(name: "GuitarFootShared", path: "Shared"),
        .executableTarget(
            name: "GuitarFootControllerIOS",
            dependencies: ["GuitarFootShared"],
            path: "iOS",
            exclude: ["App/Info.plist"]
        ),
        .executableTarget(
            name: "MacMIDIBridge",
            dependencies: ["GuitarFootShared"],
            path: "MacBridge",
            exclude: ["App/Info.plist"]
        ),
        .testTarget(name: "GuitarFootSharedTests", dependencies: ["GuitarFootShared"], path: "Tests/SharedTests")
    ]
)`
  },
  {
    path: 'Shared/NetworkConstants.swift',
    category: 'Shared',
    description: 'Bonjour service constants (_guitarfoot._udp) and UDP Port 50001 configuration.',
    content: `import Foundation

public enum NetworkConstants {
    public static let serviceType = "_guitarfoot._udp"
    public static let defaultUDPPort: UInt16 = 50001
    public static let domain = "local."
    public static let protocolVersion: UInt8 = 1
    public static let magicHeader: [UInt8] = [0x47, 0x54, 0x52, 0x46] // "GTRF"
    public static let heartbeatInterval: TimeInterval = 2.0
    public static let timeoutInterval: TimeInterval = 5.0
}`
  },
  {
    path: 'Shared/MIDIMessage.swift',
    category: 'Shared',
    description: 'CoreMIDI byte packing, Note ON/OFF, CC, Program Change message encoder & 0-127 validator.',
    content: `import Foundation

public enum MIDIType: String, Codable, CaseIterable, Identifiable {
    case note = "Note"
    case cc = "Control Change (CC)"
    case programChange = "Program Change (PC)"
    public var id: String { rawValue }
    public var shortName: String {
        switch self {
        case .note: return "NOTE"
        case .cc: return "CC"
        case .programChange: return "PC"
        }
    }
}

public struct MIDIMessage: Codable, Equatable, Hashable, CustomStringConvertible {
    public var type: MIDIType
    public var channel: UInt8     // 1 - 16
    public var number: UInt8      // 0 - 127
    public var value: UInt8       // 0 - 127
    public var isNoteOn: Bool
    public var timestamp: TimeInterval

    public init(
        type: MIDIType,
        channel: UInt8,
        number: UInt8,
        value: UInt8 = 127,
        isNoteOn: Bool = true,
        timestamp: TimeInterval = Date().timeIntervalSince1970
    ) {
        self.type = type
        self.channel = max(1, min(16, channel))
        self.number = max(0, min(127, number))
        self.value = max(0, min(127, value))
        self.isNoteOn = isNoteOn
        self.timestamp = timestamp
    }
    
    public var description: String {
        switch type {
        case .note:
            return "Ch \\(channel) [\\(isNoteOn ? "NOTE ON" : "NOTE OFF")] #\\(number) Vel: \\(value)"
        case .cc:
            return "Ch \\(channel) [CC #\\(number)] Val: \\(value)"
        case .programChange:
            return "Ch \\(channel) [PC #\\(number)]"
        }
    }
    
    public func toRawMIDIBytes() -> [UInt8] {
        let ch = (channel - 1) & 0x0F
        switch type {
        case .note:
            let status: UInt8 = (isNoteOn ? 0x90 : 0x80) | ch
            return [status, number & 0x7F, (isNoteOn ? value : 0) & 0x7F]
        case .cc:
            let status: UInt8 = 0xB0 | ch
            return [status, number & 0x7F, value & 0x7F]
        case .programChange:
            let status: UInt8 = 0xC0 | ch
            return [status, number & 0x7F]
        }
    }
}`
  },
  {
    path: 'Shared/Protocol.swift',
    category: 'Shared',
    description: 'Lightweight binary & JSON network packet serializer for low-latency Wi-Fi UDP streaming.',
    content: `import Foundation

public enum PacketType: UInt8, Codable {
    case ping = 0x01
    case pong = 0x02
    case heartbeat = 0x03
    case midiCommand = 0x10
    case footswitchEvent = 0x20
    case bankChange = 0x30
    case bridgeStatus = 0x40
    case disconnectNotice = 0xFF
}

public struct SwitchEventPayload: Codable, Equatable {
    public var switchIndex: UInt8
    public var switchName: String
    public var isPressed: Bool
    public var isLongPress: Bool
    public var isOn: Bool
    public var midiMessage: MIDIMessage
}

public struct NetworkPacket: Codable {
    public var sequence: UInt32
    public var timestamp: TimeInterval
    public var type: PacketType
    public var senderId: String
    public var midiMessage: MIDIMessage?
    public var switchEvent: SwitchEventPayload?
    public var bankName: String?

    public func encode() -> Data? {
        try? JSONEncoder().encode(self)
    }
    public static func decode(from data: Data) -> NetworkPacket? {
        try? JSONDecoder().decode(NetworkPacket.self, from: data)
    }
}`
  },
  {
    path: 'iOS/App/GuitarFootControllerApp.swift',
    category: 'iOS App',
    description: 'Main SwiftUI iOS Application entry with screen sleep prevention for stage use.',
    content: `import SwiftUI

@main
struct GuitarFootControllerApp: App {
    init() {
        #if canImport(UIKit)
        UIApplication.shared.isIdleTimerDisabled = true
        #endif
    }
    
    var body: some Scene {
        WindowGroup {
            MainControllerView()
                .preferredColorScheme(.dark)
        }
    }
}`
  },
  {
    path: 'iOS/Models/FootswitchConfig.swift',
    category: 'iOS Models',
    description: 'Footswitch Model with Tap Action, Long Press Action, Momentary vs Toggle mode, and LED colors.',
    content: `import Foundation
import SwiftUI

public enum SwitchMode: String, Codable, CaseIterable, Identifiable {
    case toggle = "Toggle"
    case momentary = "Momentary"
    public var id: String { rawValue }
}

public struct ActionMIDIConfig: Codable, Equatable, Hashable {
    public var isEnabled: Bool
    public var midiType: MIDIType
    public var channel: UInt8
    public var number: UInt8
    public var onValue: UInt8
    public var offValue: UInt8

    public init(
        isEnabled: Bool = true,
        midiType: MIDIType = .cc,
        channel: UInt8 = 1,
        number: UInt8 = 0,
        onValue: UInt8 = 127,
        offValue: UInt8 = 0
    ) {
        self.isEnabled = isEnabled
        self.midiType = midiType
        self.channel = channel
        self.number = number
        self.onValue = onValue
        self.offValue = offValue
    }
}

public struct FootswitchConfig: Identifiable, Codable, Equatable, Hashable {
    public var id: UUID
    public var index: Int
    public var name: String
    public var subLabel: String
    public var mode: SwitchMode
    public var ledColorHex: String
    public var tapAction: ActionMIDIConfig
    public var longPressAction: ActionMIDIConfig

    public init(
        id: UUID = UUID(),
        index: Int,
        name: String,
        subLabel: String,
        mode: SwitchMode = .toggle,
        ledColorHex: String = "#38BDF8",
        tapAction: ActionMIDIConfig,
        longPressAction: ActionMIDIConfig
    ) {
        self.id = id
        self.index = index
        self.name = name
        self.subLabel = subLabel
        self.mode = mode
        self.ledColorHex = ledColorHex
        self.tapAction = tapAction
        self.longPressAction = longPressAction
    }
}`
  },
  {
    path: 'iOS/Models/Bank.swift',
    category: 'iOS Models',
    description: 'Bank model representing an 8-switch bank setup with color tag, metadata, and Codable conformance.',
    content: `import Foundation

public struct Bank: Identifiable, Codable, Equatable {
    public var id: UUID
    public var name: String
    public var description: String
    public var colorTag: String
    public var switches: [FootswitchConfig]

    public init(
        id: UUID = UUID(),
        name: String,
        description: String = "",
        colorTag: String = "#3B82F6",
        switches: [FootswitchConfig]
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.colorTag = colorTag
        self.switches = switches
    }

    public static func defaultSwitches() -> [FootswitchConfig] {
        return (0..<8).map { index in
            FootswitchConfig(
                index: index,
                name: "SW \\(index + 1)",
                subLabel: "CC #\\(20 + index)",
                mode: .toggle,
                ledColorHex: "#38BDF8",
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: UInt8(20 + index), onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: false, midiType: .cc, channel: 1, number: UInt8(30 + index), onValue: 127, offValue: 0)
            )
        }
    }
}`
  },
  {
    path: 'iOS/Services/BankManager.swift',
    category: 'iOS Services',
    description: 'Codable Bank management & local Footswitch ON/OFF state persistence engine.',
    content: `import Foundation
import Combine

/// Stores the ON/OFF state of each footswitch button persistently using Codable.
public struct FootswitchStateStore: Codable {
    /// Maps Bank UUID string -> Array of 8 Bool values representing button ON/OFF state.
    public var switchStates: [String: [Bool]]
    public var activeBankId: String
    public var lastModified: Date

    public init(switchStates: [String: [Bool]] = [:], activeBankId: String = "", lastModified: Date = Date()) {
        self.switchStates = switchStates
        self.activeBankId = activeBankId
        self.lastModified = lastModified
    }
}

public final class BankManager: ObservableObject {
    public static let shared = BankManager()
    
    private let banksStorageKey = "com.guitarfoot.saved_banks.v2"
    private let stateStorageKey = "com.guitarfoot.switch_states.v2"
    
    @Published public var banks: [Bank] = []
    @Published public var activeBankId: UUID = UUID()
    @Published public var currentSwitchStates: [Bool] = Array(repeating: false, count: 8)

    private var allSwitchStates: [String: [Bool]] = [:]

    public var activeBank: Bank {
        banks.first(where: { $0.id == activeBankId }) ?? banks.first ?? createDefaultBank()
    }

    public init() {
        loadBanks()
        loadSwitchStates()
    }

    // MARK: - Codable State Persistence (Button ON/OFF)

    /// Loads the saved ON/OFF states for all buttons from UserDefaults using Codable.
    public func loadSwitchStates() {
        guard let data = UserDefaults.standard.data(forKey: stateStorageKey),
              let store = try? JSONDecoder().decode(FootswitchStateStore.self, from: data) else {
            self.currentSwitchStates = Array(repeating: false, count: 8)
            return
        }

        self.allSwitchStates = store.switchStates
        let bankKey = activeBankId.uuidString
        if let savedForBank = allSwitchStates[bankKey], savedForBank.count == 8 {
            self.currentSwitchStates = savedForBank
        } else {
            self.currentSwitchStates = Array(repeating: false, count: 8)
        }
    }

    /// Saves the current ON/OFF state of each footswitch button locally via Codable.
    public func saveSwitchStates() {
        allSwitchStates[activeBankId.uuidString] = currentSwitchStates
        let store = FootswitchStateStore(
            switchStates: allSwitchStates,
            activeBankId: activeBankId.uuidString,
            lastModified: Date()
        )
        if let data = try? JSONEncoder().encode(store) {
            UserDefaults.standard.set(data, forKey: stateStorageKey)
        }
    }

    /// Updates the state of an individual button and immediately persists it.
    public func setSwitchState(index: Int, isOn: Bool) {
        guard index >= 0 && index < currentSwitchStates.count else { return }
        currentSwitchStates[index] = isOn
        saveSwitchStates()
    }

    /// Resets all switches for the active bank to OFF.
    public func resetAllSwitches() {
        currentSwitchStates = Array(repeating: false, count: 8)
        saveSwitchStates()
    }

    // MARK: - Bank CRUD & Switching

    public func selectBank(id: UUID) {
        guard banks.contains(where: { $0.id == id }) else { return }
        // Save current bank state before switching
        saveSwitchStates()
        
        self.activeBankId = id
        // Load state for the newly selected bank
        if let states = allSwitchStates[id.uuidString], states.count == 8 {
            self.currentSwitchStates = states
        } else {
            self.currentSwitchStates = Array(repeating: false, count: 8)
        }
        saveBanks()
    }

    public func createBank(name: String, description: String = "", colorTag: String = "#38BDF8") -> Bank {
        let newBank = Bank(
            id: UUID(),
            name: name.uppercased(),
            description: description,
            colorTag: colorTag,
            switches: Bank.defaultSwitches()
        )
        banks.append(newBank)
        saveBanks()
        selectBank(id: newBank.id)
        return newBank
    }

    public func duplicateBank(_ bank: Bank) -> Bank {
        var clonedSwitches = bank.switches
        for i in 0..<clonedSwitches.count {
            clonedSwitches[i].id = UUID()
        }
        let copy = Bank(
            id: UUID(),
            name: "\\(bank.name) (COPY)",
            description: bank.description,
            colorTag: bank.colorTag,
            switches: clonedSwitches
        )
        banks.append(copy)
        saveBanks()
        return copy
    }

    public func renameBank(id: UUID, newName: String, newDescription: String? = nil) {
        guard let index = banks.firstIndex(where: { $0.id == id }) else { return }
        banks[index].name = newName.uppercased()
        if let newDesc = newDescription {
            banks[index].description = newDesc
        }
        saveBanks()
    }

    public func deleteBank(id: UUID) {
        guard banks.count > 1 else { return }
        banks.removeAll(where: { $0.id == id })
        allSwitchStates.removeValue(forKey: id.uuidString)
        if activeBankId == id {
            if let first = banks.first {
                selectBank(id: first.id)
            }
        }
        saveBanks()
        saveSwitchStates()
    }

    // MARK: - Bank File Storage

    private func saveBanks() {
        if let data = try? JSONEncoder().encode(banks) {
            UserDefaults.standard.set(data, forKey: banksStorageKey)
        }
    }

    private func loadBanks() {
        if let data = UserDefaults.standard.data(forKey: banksStorageKey),
           let saved = try? JSONDecoder().decode([Bank].self, from: data), !saved.isEmpty {
            self.banks = saved
            self.activeBankId = saved.first!.id
        } else {
            let defaultBank = createDefaultBank()
            self.banks = [defaultBank]
            self.activeBankId = defaultBank.id
            saveBanks()
        }
    }

    private func createDefaultBank() -> Bank {
        Bank(
            name: "LIVE",
            description: "Main Stage Performance Rig",
            colorTag: "#3B82F6",
            switches: Bank.defaultSwitches()
        )
    }
}`
  },
  {
    path: 'iOS/Views/BankManagementView.swift',
    category: 'iOS Views',
    description: 'SwiftUI Bank Management interface for switching, creating, renaming, deleting, and duplicating banks.',
    content: `import SwiftUI

public struct BankManagementView: View {
    @ObservedObject var bankManager: BankManager
    @Environment(\\.dismiss) private var dismiss
    
    @State private var newBankName: String = ""
    @State private var newBankDesc: String = ""
    @State private var selectedColorHex: String = "#38BDF8"
    @State private var editingBankId: UUID? = nil
    @State private var editedName: String = ""
    @State private var bankToDelete: Bank? = nil

    private let colors = ["#38BDF8", "#F59E0B", "#EF4444", "#A855F7", "#10B981", "#06B6D4", "#EC4899", "#64748B"]

    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#06080D").ignoresSafeArea()
                
                VStack(spacing: 16) {
                    // Create Bank Section
                    VStack(alignment: .leading, spacing: 10) {
                        Text("CREATE NEW BANK")
                            .font(.system(size: 11, weight: .black, design: .monospaced))
                            .foregroundColor(Color.blue)
                        
                        HStack {
                            TextField("Bank Name (e.g. AMBIENT)", text: $newBankName)
                                .textFieldStyle(.plain)
                                .padding(8)
                                .background(Color(hex: "#121620"))
                                .cornerRadius(8)
                                .foregroundColor(.white)
                            
                            Button(action: createBank) {
                                Label("Add", systemImage: "plus")
                                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                            }
                            .disabled(newBankName.trimmingCharacters(in: .whitespaces).isEmpty)
                        }
                    }
                    .padding(14)
                    .background(Color(hex: "#0A0D14"))
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.1), lineWidth: 1))

                    // Banks List
                    List {
                        ForEach(bankManager.banks) { bank in
                            bankRow(for: bank)
                                .listRowBackground(Color(hex: "#0E121A"))
                        }
                    }
                    .listStyle(.plain)
                }
                .padding()
            }
            .navigationTitle("Bank Manager")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(.blue)
                }
            }
        }
    }

    @ViewBuilder
    private func bankRow(for bank: Bank) -> some View {
        let isActive = bank.id == bankManager.activeBankId
        
        HStack(spacing: 12) {
            Circle()
                .fill(Color(hex: bank.colorTag))
                .frame(width: 10, height: 10)
            
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(bank.name)
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                    
                    if isActive {
                        Text("ACTIVE")
                            .font(.system(size: 9, weight: .heavy, design: .monospaced))
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.blue.opacity(0.3))
                            .foregroundColor(Color.blue)
                            .cornerRadius(4)
                    }
                }
                if !bank.description.isEmpty {
                    Text(bank.description)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            // Actions
            Button(action: { bankManager.selectBank(id: bank.id) }) {
                Image(systemName: isActive ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isActive ? .green : .gray)
            }
            .buttonStyle(.plain)

            Button(action: { _ = bankManager.duplicateBank(bank) }) {
                Image(systemName: "doc.on.doc")
                    .foregroundColor(.blue)
            }
            .buttonStyle(.plain)

            if bankManager.banks.count > 1 {
                Button(action: { bankManager.deleteBank(id: bank.id) }) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 4)
    }

    private func createBank() {
        guard !newBankName.isEmpty else { return }
        _ = bankManager.createBank(name: newBankName, description: newBankDesc, colorTag: selectedColorHex)
        newBankName = ""
        newBankDesc = ""
    }
}`
  },
  {
    path: 'iOS/Views/MainControllerView.swift',
    category: 'iOS Views',
    description: '4x2 landscape performance grid featuring 8 responsive high-contrast footswitch stomp buttons.',
    content: `import SwiftUI

public struct MainControllerView: View {
    @StateObject private var bankManager = BankManager.shared
    @State private var isBankManagerPresented: Bool = false
    
    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    public var body: some View {
        ZStack {
            Color(hex: "#06080D").ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Stage Bar
                HStack {
                    Text("GUITARFOOT")
                        .font(.system(size: 13, weight: .heavy, design: .monospaced))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { isBankManagerPresented = true }) {
                        Label("BANKS (\\(bankManager.banks.count))", systemImage: "folder.fill")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color(hex: "#121620"))
                            .foregroundColor(.blue)
                            .cornerRadius(6)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                
                // 8-Footswitch Grid
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(0..<8, id: \\.self) { index in
                        let config = bankManager.activeBank.switches[index]
                        let isOn = bankManager.currentSwitchStates[index]
                        
                        Button(action: {
                            if config.mode == .toggle {
                                bankManager.setSwitchState(index: index, isOn: !isOn)
                            }
                        }) {
                            VStack(spacing: 6) {
                                Circle()
                                    .fill(isOn ? Color(hex: config.ledColorHex) : Color.zinc(700))
                                    .frame(width: 14, height: 14)
                                    .shadow(color: isOn ? Color(hex: config.ledColorHex).opacity(0.8) : .clear, radius: 6)
                                
                                Text(config.name)
                                    .font(.system(size: 14, weight: .heavy, design: .monospaced))
                                    .foregroundColor(.white)
                                
                                Text(config.subLabel)
                                    .font(.system(size: 10, design: .monospaced))
                                    .foregroundColor(.gray)
                            }
                            .frame(maxWidth: .infinity, minHeight: 90)
                            .background(isOn ? Color(hex: "#101626") : Color(hex: "#0E121A"))
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(isOn ? Color.blue.opacity(0.6) : Color.white.opacity(0.1), lineWidth: 1.5))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(14)
            }
        }
        .sheet(isPresented: $isBankManagerPresented) {
            BankManagementView(bankManager: bankManager)
        }
    }
}`
  },
  {
    path: 'MacBridge/MIDI/CoreMIDIManager.swift',
    category: 'Mac Bridge',
    description: 'Apple CoreMIDI Manager: discovers CoreMIDI output endpoints, persists selection in UserDefaults, routes to Logic Pro / DAWs.',
    content: `import Foundation
import CoreMIDI

public struct MIDIDestinationItem: Identifiable, Hashable {
    public var id: Int32
    public var name: String
    public var endpointRef: MIDIEndpointRef
    public var isVirtualSource: Bool

    public init(id: Int32, name: String, endpointRef: MIDIEndpointRef = 0, isVirtualSource: Bool = false) {
        self.id = id
        self.name = name
        self.endpointRef = endpointRef
        self.isVirtualSource = isVirtualSource
    }
}

public final class CoreMIDIManager: ObservableObject {
    public static let savedDestinationKey = "com.guitarfoot.macbridge.selected_destination_id"

    @Published public private(set) var availableDestinations: [MIDIDestinationItem] = []
    @Published public var selectedDestinationId: Int32 = -1 {
        didSet {
            // Persist the user's selected CoreMIDI destination between restarts
            UserDefaults.standard.set(selectedDestinationId, forKey: Self.savedDestinationKey)
        }
    }

    private var midiClient: MIDIClientRef = 0
    private var outputPort: MIDIPortRef = 0
    private var virtualSourceEndpoint: MIDIEndpointRef = 0

    public init() {
        setupCoreMIDI()
        scanDestinations()
        loadSavedDestination()
    }

    private func setupCoreMIDI() {
        let clientName = "GuitarFoot Bridge Client" as CFString
        MIDIClientCreateWithBlock(clientName, &midiClient) { [weak self] _ in
            DispatchQueue.main.async {
                self?.scanDestinations()
            }
        }
        
        let portName = "GuitarFoot Output Port" as CFString
        MIDIOutputPortCreate(midiClient, portName, &outputPort)
        
        let virtualSourceName = "GuitarFoot Bridge" as CFString
        MIDISourceCreate(midiClient, virtualSourceName, &virtualSourceEndpoint)
    }

    /// Queries CoreMIDI for all registered hardware and software output endpoints.
    public func scanDestinations() {
        var items: [MIDIDestinationItem] = [
            MIDIDestinationItem(id: -1, name: "GuitarFoot Virtual Source (DAW / Logic Pro)", endpointRef: 0, isVirtualSource: true)
        ]

        let numDestinations = MIDIGetNumberOfDestinations()
        for i in 0..<numDestinations {
            let endpoint = MIDIGetDestination(i)
            if endpoint != 0 {
                var uniqueId: Int32 = 0
                MIDIObjectGetIntegerProperty(endpoint, kMIDIPropertyUniqueID, &uniqueId)
                if uniqueId == 0 { uniqueId = Int32(i + 1) }

                var nameUnmanaged: Unmanaged<CFString>?
                var displayName: String = "CoreMIDI Destination \\(i + 1)"
                if MIDIObjectGetStringProperty(endpoint, kMIDIPropertyDisplayName, &nameUnmanaged) == noErr,
                   let unmanaged = nameUnmanaged {
                    displayName = unmanaged.takeRetainedValue() as String
                } else if MIDIObjectGetStringProperty(endpoint, kMIDIPropertyName, &nameUnmanaged) == noErr,
                          let unmanaged = nameUnmanaged {
                    displayName = unmanaged.takeRetainedValue() as String
                }

                items.append(MIDIDestinationItem(id: uniqueId, name: displayName, endpointRef: endpoint, isVirtualSource: false))
            }
        }

        self.availableDestinations = items
    }

    /// Restores the user's destination selection from UserDefaults.
    private func loadSavedDestination() {
        if UserDefaults.standard.object(forKey: Self.savedDestinationKey) != nil {
            let savedId = Int32(UserDefaults.standard.integer(forKey: Self.savedDestinationKey))
            if availableDestinations.contains(where: { $0.id == savedId }) {
                self.selectedDestinationId = savedId
                return
            }
        }
        self.selectedDestinationId = -1
    }

    /// Sends MIDI message to both the virtual source and the selected CoreMIDI destination endpoint.
    public func send(message: MIDIMessage) {
        let bytes = message.toRawMIDIBytes()
        guard !bytes.isEmpty else { return }

        var packetList = MIDIPacketList()
        var curPacket = MIDIPacketListInit(&packetList)
        curPacket = MIDIPacketListAdd(&packetList, 1024, curPacket, 0, bytes.count, bytes)

        // 1. Broadcast on Virtual Source for Logic Pro & plugins
        if virtualSourceEndpoint != 0 {
            MIDIReceived(virtualSourceEndpoint, &packetList)
        }

        // 2. Direct route to selected CoreMIDI destination if applicable
        if selectedDestinationId != -1, outputPort != 0 {
            if let target = availableDestinations.first(where: { $0.id == selectedDestinationId && !$0.isVirtualSource }) {
                MIDISend(outputPort, target.endpointRef, &packetList)
            }
        }
    }
}`
  },
  {
    path: 'MacBridge/Network/UDPServerService.swift',
    category: 'Mac Bridge',
    description: 'NWListener UDP Server listening on port 50001, decoding commands and forwarding to CoreMIDI.',
    content: `import Foundation
import Network

public final class UDPServerService: ObservableObject {
    @Published public private(set) var isRunning: Bool = false
    private var listener: NWListener?
    private let midiManager: CoreMIDIManager

    public init(midiManager: CoreMIDIManager) {
        self.midiManager = midiManager
    }

    public func start(port: UInt16 = 50001) {
        let parameters = NWParameters.udp
        parameters.allowFastOpen = true
        listener = try? NWListener(using: parameters, on: NWEndpoint.Port(rawValue: port)!)
        listener?.newConnectionHandler = { [weak self] connection in
            connection.start(queue: .main)
            connection.receiveMessage { content, _, _, _ in
                if let data = content, let packet = NetworkPacket.decode(from: data) {
                    if let sw = packet.switchEvent {
                        self?.midiManager.send(message: sw.midiMessage)
                    }
                }
            }
        }
        listener?.start(queue: .main)
        isRunning = true
    }
}`
  },
  {
    path: 'MacBridge/Views/MacBridgeView.swift',
    category: 'Mac Bridge',
    description: 'macOS Status Window with live connection indicator, CoreMIDI destination picker, and persistent UserDefaults storage.',
    content: `import SwiftUI

public struct MacBridgeView: View {
    @StateObject private var midiManager = CoreMIDIManager()
    @StateObject private var udpServer: UDPServerService
    
    public init() {
        let midi = CoreMIDIManager()
        _midiManager = StateObject(wrappedValue: midi)
        _udpServer = StateObject(wrappedValue: UDPServerService(midiManager: midi))
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Text("GuitarFoot Mac MIDI Bridge")
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
                Text("UDP 50001")
                    .font(.caption.monospaced())
                    .padding(4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(4)
            }
            
            Divider()

            // CoreMIDI Device Selector
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("CoreMIDI Target Output:")
                        .font(.subheadline.bold())
                    Spacer()
                    Button("Rescan") {
                        midiManager.scanDestinations()
                    }
                    .font(.caption)
                }

                Picker("Destination", selection: $midiManager.selectedDestinationId) {
                    ForEach(midiManager.availableDestinations) { dest in
                        Text(dest.name).tag(dest.id)
                    }
                }
                .pickerStyle(.menu)

                Text("Selection is automatically persisted in UserDefaults across restarts.")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color.black.opacity(0.3))
            .cornerRadius(8)
            
            Spacer()
        }
        .padding()
        .frame(minWidth: 480, minHeight: 320)
        .onAppear {
            udpServer.start()
        }
    }
}`
  },
  {
    path: 'build.sh',
    category: 'Build & Tests',
    description: 'Non-Xcode build and launch script using swift build, swift run, and SPM.',
    content: `#!/bin/bash
# GuitarFootController Non-Xcode Build System
set -e
swift build --target MacMIDIBridge -c release
echo "✅ Build complete: .build/release/MacMIDIBridge"
swift run MacMIDIBridge`
  }
];
