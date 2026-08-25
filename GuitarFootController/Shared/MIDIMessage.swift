import Foundation

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
    public var number: UInt8      // 0 - 127 (Note number or CC number or Program number)
    public var value: UInt8       // 0 - 127 (Velocity for Note, Value for CC, 0 for PC)
    public var isNoteOn: Bool     // Relevant when type == .note (true = Note On, false = Note Off)
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
            return "Ch \(channel) [\(isNoteOn ? "NOTE ON" : "NOTE OFF")] #\(number) Vel: \(value)"
        case .cc:
            return "Ch \(channel) [CC #\(number)] Val: \(value)"
        case .programChange:
            return "Ch \(channel) [PC #\(number)]"
        }
    }
    
    /// Converts message into standard raw 3-byte CoreMIDI status and data bytes
    public func toRawMIDIBytes() -> [UInt8] {
        let zeroIndexedChannel = (channel - 1) & 0x0F
        
        switch type {
        case .note:
            let status: UInt8 = (isNoteOn ? 0x90 : 0x80) | zeroIndexedChannel
            return [status, number & 0x7F, (isNoteOn ? value : 0) & 0x7F]
            
        case .cc:
            let status: UInt8 = 0xB0 | zeroIndexedChannel
            return [status, number & 0x7F, value & 0x7F]
            
        case .programChange:
            let status: UInt8 = 0xC0 | zeroIndexedChannel
            return [status, number & 0x7F]
        }
    }
    
    /// Reconstructs a MIDIMessage from raw CoreMIDI status and data bytes
    public static func fromRawMIDIBytes(_ bytes: [UInt8]) -> MIDIMessage? {
        guard !bytes.isEmpty else { return nil }
        let status = bytes[0]
        let messageTypeNibble = status & 0xF0
        let channel = (status & 0x0F) + 1
        
        switch messageTypeNibble {
        case 0x90: // Note On
            guard bytes.count >= 3 else { return nil }
            let velocity = bytes[2]
            return MIDIMessage(
                type: .note,
                channel: channel,
                number: bytes[1],
                value: velocity,
                isNoteOn: velocity > 0
            )
        case 0x80: // Note Off
            guard bytes.count >= 2 else { return nil }
            return MIDIMessage(
                type: .note,
                channel: channel,
                number: bytes[1],
                value: 0,
                isNoteOn: false
            )
        case 0xB0: // CC
            guard bytes.count >= 3 else { return nil }
            return MIDIMessage(
                type: .cc,
                channel: channel,
                number: bytes[1],
                value: bytes[2]
            )
        case 0xC0: // PC
            guard bytes.count >= 2 else { return nil }
            return MIDIMessage(
                type: .programChange,
                channel: channel,
                number: bytes[1],
                value: 0
            )
        default:
            return nil
        }
    }
}
