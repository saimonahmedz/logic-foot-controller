import Foundation
import SwiftUI

public enum SwitchMode: String, Codable, CaseIterable, Identifiable {
    case toggle = "Toggle"
    case momentary = "Momentary"
    
    public var id: String { rawValue }
}

public struct ActionMIDIConfig: Codable, Equatable, Hashable {
    public var isEnabled: Bool
    public var midiType: MIDIType
    public var channel: UInt8     // 1 - 16
    public var number: UInt8      // 0 - 127
    public var onValue: UInt8     // 0 - 127
    public var offValue: UInt8    // 0 - 127
    
    public init(
        isEnabled: Bool = true,
        midiType: MIDIType = .cc,
        channel: UInt8 = 1,
        number: UInt8 = 20,
        onValue: UInt8 = 127,
        offValue: UInt8 = 0
    ) {
        self.isEnabled = isEnabled
        self.midiType = midiType
        self.channel = max(1, min(16, channel))
        self.number = max(0, min(127, number))
        self.onValue = max(0, min(127, onValue))
        self.offValue = max(0, min(127, offValue))
    }
}

public struct FootswitchConfig: Identifiable, Codable, Equatable, Hashable {
    public var id: UUID
    public var index: Int         // 0 to 7
    public var name: String
    public var subLabel: String
    public var mode: SwitchMode
    public var ledColorHex: String
    
    // Tap Action Configuration
    public var tapAction: ActionMIDIConfig
    
    // Long Press Action Configuration
    public var longPressAction: ActionMIDIConfig
    
    public init(
        id: UUID = UUID(),
        index: Int,
        name: String,
        subLabel: String = "",
        mode: SwitchMode = .toggle,
        ledColorHex: String = "#10B981",
        tapAction: ActionMIDIConfig,
        longPressAction: ActionMIDIConfig = ActionMIDIConfig(isEnabled: false)
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
    
    /// Generates default 8-switch layout for standard guitar pedalboard
    public static func defaultEightSwitches() -> [FootswitchConfig] {
        return [
            // Switch 1: Clean
            FootswitchConfig(
                index: 0,
                name: "CLEAN",
                subLabel: "PC #01",
                mode: .toggle,
                ledColorHex: "#38BDF8", // Cyan
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .programChange, channel: 1, number: 1, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 10, onValue: 127, offValue: 0)
            ),
            // Switch 2: Crunch
            FootswitchConfig(
                index: 1,
                name: "CRUNCH",
                subLabel: "PC #02",
                mode: .toggle,
                ledColorHex: "#F59E0B", // Amber
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .programChange, channel: 1, number: 2, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: false, midiType: .cc, channel: 1, number: 11, onValue: 127, offValue: 0)
            ),
            // Switch 3: Rhythm
            FootswitchConfig(
                index: 2,
                name: "RHYTHM",
                subLabel: "PC #03",
                mode: .toggle,
                ledColorHex: "#EF4444", // Red
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .programChange, channel: 1, number: 3, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: false, midiType: .cc, channel: 1, number: 12, onValue: 127, offValue: 0)
            ),
            // Switch 4: Solo
            FootswitchConfig(
                index: 3,
                name: "SOLO",
                subLabel: "NOTE #39",
                mode: .toggle,
                ledColorHex: "#8B5CF6", // Purple
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .note, channel: 1, number: 39, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 23, onValue: 127, offValue: 0)
            ),
            // Switch 5: Delay
            FootswitchConfig(
                index: 4,
                name: "DELAY",
                subLabel: "CC #28",
                mode: .toggle,
                ledColorHex: "#06B6D4", // Teal
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 28, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 64, onValue: 127, offValue: 0) // Tap tempo
            ),
            // Switch 6: Reverb
            FootswitchConfig(
                index: 5,
                name: "REVERB",
                subLabel: "CC #29",
                mode: .toggle,
                ledColorHex: "#10B981", // Emerald
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 29, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: false, midiType: .cc, channel: 1, number: 65, onValue: 127, offValue: 0)
            ),
            // Switch 7: Boost
            FootswitchConfig(
                index: 6,
                name: "BOOST",
                subLabel: "CC #30 (Mom)",
                mode: .momentary,
                ledColorHex: "#EC4899", // Pink
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 30, onValue: 127, offValue: 0),
                longPressAction: ActionMIDIConfig(isEnabled: false, midiType: .cc, channel: 1, number: 31, onValue: 127, offValue: 0)
            ),
            // Switch 8: Mute
            FootswitchConfig(
                index: 7,
                name: "MUTE",
                subLabel: "CC #07",
                mode: .toggle,
                ledColorHex: "#64748B", // Slate
                tapAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 7, onValue: 0, offValue: 127),
                longPressAction: ActionMIDIConfig(isEnabled: true, midiType: .cc, channel: 1, number: 84, onValue: 127, offValue: 0) // Tuner trigger
            )
        ]
    }
}
