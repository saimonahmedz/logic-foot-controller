import Foundation

public enum ConnectionStatus: String, Codable, CaseIterable {
    case disconnected = "DISCONNECTED"
    case connecting = "CONNECTING"
    case connected = "CONNECTED"
    
    public var statusColorHex: String {
        switch self {
        case .disconnected: return "#EF4444" // Red
        case .connecting:   return "#F59E0B" // Amber
        case .connected:    return "#10B981" // Green
        }
    }
}

public struct DiscoveredBridge: Identifiable, Equatable {
    public var id: String
    public var name: String
    public var hostName: String
    public var port: UInt16
    public var isManual: Bool
    public var lastSeen: Date
    
    public init(id: String, name: String, hostName: String, port: UInt16, isManual: Bool = false) {
        self.id = id
        self.name = name
        self.hostName = hostName
        self.port = port
        self.isManual = isManual
        self.lastSeen = Date()
    }
}

public struct AppSettings: Codable, Equatable {
    // Network Settings
    public var udpPort: UInt16
    public var bonjourServiceType: String
    public var autoReconnect: Bool
    public var manualBridgeIP: String
    public var useManualIP: Bool
    
    // MIDI Defaults
    public var defaultMidiChannel: UInt8
    public var preventDuplicateMIDI: Bool
    public var sendNoteOffOnRelease: Bool
    
    // Appearance & Stage UX
    public var darkMode: Bool
    public var buttonSizeScale: Double // 0.8 to 1.2
    public var textSizeScale: Double   // 0.8 to 1.3
    public var enableHapticFeedback: Bool
    public var showSubLabels: Bool
    public var highContrastMode: Bool
    public var stageLockEnabled: Bool
    
    public init(
        udpPort: UInt16 = NetworkConstants.defaultUDPPort,
        bonjourServiceType: String = NetworkConstants.serviceType,
        autoReconnect: Bool = true,
        manualBridgeIP: String = "192.168.1.100",
        useManualIP: Bool = false,
        defaultMidiChannel: UInt8 = 1,
        preventDuplicateMIDI: Bool = true,
        sendNoteOffOnRelease: Bool = true,
        darkMode: Bool = true,
        buttonSizeScale: Double = 1.0,
        textSizeScale: Double = 1.0,
        enableHapticFeedback: Bool = true,
        showSubLabels: Bool = true,
        highContrastMode: Bool = true,
        stageLockEnabled: Bool = false
    ) {
        self.udpPort = udpPort
        self.bonjourServiceType = bonjourServiceType
        self.autoReconnect = autoReconnect
        self.manualBridgeIP = manualBridgeIP
        self.useManualIP = useManualIP
        self.defaultMidiChannel = max(1, min(16, defaultMidiChannel))
        self.preventDuplicateMIDI = preventDuplicateMIDI
        self.sendNoteOffOnRelease = sendNoteOffOnRelease
        self.darkMode = darkMode
        self.buttonSizeScale = buttonSizeScale
        self.textSizeScale = textSizeScale
        self.enableHapticFeedback = enableHapticFeedback
        self.showSubLabels = showSubLabels
        self.highContrastMode = highContrastMode
        self.stageLockEnabled = stageLockEnabled
    }
}
