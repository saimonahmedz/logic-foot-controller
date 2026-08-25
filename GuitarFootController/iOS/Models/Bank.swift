import Foundation

public struct Bank: Identifiable, Codable, Equatable, Hashable {
    public var id: UUID
    public var name: String
    public var description: String
    public var switches: [FootswitchConfig]
    public var colorTag: String
    public var createdAt: Date
    public var updatedAt: Date
    
    public init(
        id: UUID = UUID(),
        name: String,
        description: String = "",
        switches: [FootswitchConfig] = FootswitchConfig.defaultEightSwitches(),
        colorTag: String = "#3B82F6",
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.description = description
        // Guarantee exactly 8 switch configs
        if switches.count == 8 {
            self.switches = switches
        } else {
            var adjusted = switches
            while adjusted.count < 8 {
                let idx = adjusted.count
                adjusted.append(FootswitchConfig(
                    index: idx,
                    name: "SW \(idx + 1)",
                    subLabel: "CC #\(20 + idx)",
                    mode: .toggle,
                    tapAction: ActionMIDIConfig(channel: 1, number: UInt8(20 + idx))
                ))
            }
            self.switches = Array(adjusted.prefix(8))
        }
        self.colorTag = colorTag
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    public static func defaultBanks() -> [Bank] {
        return [
            Bank(
                name: "LIVE",
                description: "Primary performance board with clean, crunch, rhythm & leads",
                switches: FootswitchConfig.defaultEightSwitches(),
                colorTag: "#3B82F6"
            ),
            Bank(
                name: "SONG 1",
                description: "Heavy verse / chorus dynamics with delay spillover",
                switches: [
                    FootswitchConfig(index: 0, name: "CLEAN INTRO", subLabel: "PC #04", mode: .toggle, ledColorHex: "#38BDF8", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 4)),
                    FootswitchConfig(index: 1, name: "VERSE CRUNCH", subLabel: "PC #05", mode: .toggle, ledColorHex: "#F59E0B", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 5)),
                    FootswitchConfig(index: 2, name: "CHORUS WALL", subLabel: "PC #06", mode: .toggle, ledColorHex: "#EF4444", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 6)),
                    FootswitchConfig(index: 3, name: "MAIN SOLO", subLabel: "PC #07", mode: .toggle, ledColorHex: "#A855F7", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 7)),
                    FootswitchConfig(index: 4, name: "DOTTED 8TH", subLabel: "CC #24", mode: .toggle, ledColorHex: "#06B6D4", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 24)),
                    FootswitchConfig(index: 5, name: "OCTAVE FUZZ", subLabel: "CC #25", mode: .toggle, ledColorHex: "#EAB308", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 25)),
                    FootswitchConfig(index: 6, name: "SOLO BOOST", subLabel: "CC #26 (Mom)", mode: .momentary, ledColorHex: "#EC4899", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 26)),
                    FootswitchConfig(index: 7, name: "KILL SWITCH", subLabel: "CC #07", mode: .momentary, ledColorHex: "#64748B", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 7, onValue: 0, offValue: 127))
                ],
                colorTag: "#8B5CF6"
            ),
            Bank(
                name: "WORSHIP",
                description: "Ambient swells, shimmer reverbs, dual delays, and transparent drive",
                switches: [
                    FootswitchConfig(index: 0, name: "PAD CLEAN", subLabel: "PC #10", mode: .toggle, ledColorHex: "#67E8F9", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 10)),
                    FootswitchConfig(index: 1, name: "EDGE DRIVE", subLabel: "CC #14", mode: .toggle, ledColorHex: "#FBBF24", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 14)),
                    FootswitchConfig(index: 2, name: "STAGE 2 OD", subLabel: "CC #15", mode: .toggle, ledColorHex: "#F97316", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 15)),
                    FootswitchConfig(index: 3, name: "SWELL LEAD", subLabel: "PC #11", mode: .toggle, ledColorHex: "#C084FC", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 11)),
                    FootswitchConfig(index: 4, name: "DUAL DELAY", subLabel: "CC #16", mode: .toggle, ledColorHex: "#2DD4BF", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 16)),
                    FootswitchConfig(index: 5, name: "SHIMMER CLOUD", subLabel: "CC #17", mode: .toggle, ledColorHex: "#34D399", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 17)),
                    FootswitchConfig(index: 6, name: "FREEZE HOLD", subLabel: "CC #18 (Mom)", mode: .momentary, ledColorHex: "#38BDF8", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 18)),
                    FootswitchConfig(index: 7, name: "ALL MUTE", subLabel: "CC #07", mode: .toggle, ledColorHex: "#94A3B8", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 7, onValue: 0, offValue: 127))
                ],
                colorTag: "#06B6D4"
            ),
            Bank(
                name: "ROCK",
                description: "British high gain, phaser, tape echo, and tube screamer",
                switches: [
                    FootswitchConfig(index: 0, name: "PLEXI CLN", subLabel: "PC #20", mode: .toggle, ledColorHex: "#38BDF8", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 20)),
                    FootswitchConfig(index: 1, name: "JCM CRUNCH", subLabel: "PC #21", mode: .toggle, ledColorHex: "#F59E0B", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 21)),
                    FootswitchConfig(index: 2, name: "HOT ROD JCM", subLabel: "PC #22", mode: .toggle, ledColorHex: "#EF4444", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 22)),
                    FootswitchConfig(index: 3, name: "LEAD BOOST", subLabel: "PC #23", mode: .toggle, ledColorHex: "#EC4899", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 23)),
                    FootswitchConfig(index: 4, name: "PHASER 90", subLabel: "CC #35", mode: .toggle, ledColorHex: "#F97316", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 35)),
                    FootswitchConfig(index: 5, name: "TAPE DELAY", subLabel: "CC #36", mode: .toggle, ledColorHex: "#14B8A6", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 36)),
                    FootswitchConfig(index: 6, name: "CHORUS", subLabel: "CC #37", mode: .toggle, ledColorHex: "#8B5CF6", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 37)),
                    FootswitchConfig(index: 7, name: "TUNER/MUTE", subLabel: "CC #84", mode: .toggle, ledColorHex: "#64748B", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 84, onValue: 127, offValue: 0))
                ],
                colorTag: "#EF4444"
            ),
            Bank(
                name: "ACOUSTIC",
                description: "Body resonance IRs, chorus, compressor, and gentle hall reverb",
                switches: [
                    FootswitchConfig(index: 0, name: "BODY RES IR", subLabel: "PC #30", mode: .toggle, ledColorHex: "#10B981", tapAction: ActionMIDIConfig(midiType: .programChange, channel: 1, number: 30)),
                    FootswitchConfig(index: 1, name: "OPTICAL COMP", subLabel: "CC #40", mode: .toggle, ledColorHex: "#38BDF8", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 40)),
                    FootswitchConfig(index: 2, name: "ANALOG CHORUS", subLabel: "CC #41", mode: .toggle, ledColorHex: "#A855F7", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 41)),
                    FootswitchConfig(index: 3, name: "SOLO SHAPE", subLabel: "CC #42", mode: .toggle, ledColorHex: "#F59E0B", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 42)),
                    FootswitchConfig(index: 4, name: "WARM DELAY", subLabel: "CC #43", mode: .toggle, ledColorHex: "#06B6D4", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 43)),
                    FootswitchConfig(index: 5, name: "HALL REVERB", subLabel: "CC #44", mode: .toggle, ledColorHex: "#10B981", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 44)),
                    FootswitchConfig(index: 6, name: "PIEZO BOOST", subLabel: "CC #45 (Mom)", mode: .momentary, ledColorHex: "#EC4899", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 45)),
                    FootswitchConfig(index: 7, name: "STAGE MUTE", subLabel: "CC #07", mode: .toggle, ledColorHex: "#64748B", tapAction: ActionMIDIConfig(midiType: .cc, channel: 1, number: 7, onValue: 0, offValue: 127))
                ],
                colorTag: "#10B981"
            )
        ]
    }
}
