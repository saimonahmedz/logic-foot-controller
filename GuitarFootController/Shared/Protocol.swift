import Foundation

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
    public var switchIndex: UInt8     // 0 to 7 for the 8 switches
    public var switchName: String
    public var isPressed: Bool
    public var isLongPress: Bool
    public var isOn: Bool
    public var midiMessage: MIDIMessage
    
    public init(
        switchIndex: UInt8,
        switchName: String,
        isPressed: Bool,
        isLongPress: Bool,
        isOn: Bool,
        midiMessage: MIDIMessage
    ) {
        self.switchIndex = switchIndex
        self.switchName = switchName
        self.isPressed = isPressed
        self.isLongPress = isLongPress
        self.isOn = isOn
        self.midiMessage = midiMessage
    }
}

public struct BridgeStatusPayload: Codable, Equatable {
    public var bridgeName: String
    public var isMidiDestinationReady: Bool
    public var selectedDestinationName: String
    public var totalPacketsProcessed: UInt64
    public var activeClientsCount: Int
    public var serverTimestamp: TimeInterval
    
    public init(
        bridgeName: String,
        isMidiDestinationReady: Bool,
        selectedDestinationName: String,
        totalPacketsProcessed: UInt64,
        activeClientsCount: Int,
        serverTimestamp: TimeInterval = Date().timeIntervalSince1970
    ) {
        self.bridgeName = bridgeName
        self.isMidiDestinationReady = isMidiDestinationReady
        self.selectedDestinationName = selectedDestinationName
        self.totalPacketsProcessed = totalPacketsProcessed
        self.activeClientsCount = activeClientsCount
        self.serverTimestamp = serverTimestamp
    }
}

public struct NetworkPacket: Codable {
    public var sequence: UInt32
    public var timestamp: TimeInterval
    public var type: PacketType
    public var senderId: String
    
    // Optional payloads based on packet type
    public var midiMessage: MIDIMessage?
    public var switchEvent: SwitchEventPayload?
    public var bridgeStatus: BridgeStatusPayload?
    public var bankName: String?
    
    public init(
        sequence: UInt32,
        type: PacketType,
        senderId: String,
        timestamp: TimeInterval = Date().timeIntervalSince1970,
        midiMessage: MIDIMessage? = nil,
        switchEvent: SwitchEventPayload? = nil,
        bridgeStatus: BridgeStatusPayload? = nil,
        bankName: String? = nil
    ) {
        self.sequence = sequence
        self.type = type
        self.senderId = senderId
        self.timestamp = timestamp
        self.midiMessage = midiMessage
        self.switchEvent = switchEvent
        self.bridgeStatus = bridgeStatus
        self.bankName = bankName
    }
    
    /// Encodes packet to JSON Data (or lightweight binary format)
    public func encode() -> Data? {
        let encoder = JSONEncoder()
        return try? encoder.encode(self)
    }
    
    /// Decodes packet from raw UDP Data
    public static func decode(from data: Data) -> NetworkPacket? {
        let decoder = JSONDecoder()
        return try? decoder.decode(NetworkPacket.self, from: data)
    }
}
