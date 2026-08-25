import SwiftUI

public struct SwitchConfigView: View {
    @State private var config: FootswitchConfig
    private let onSave: (FootswitchConfig) -> Void
    private let onDismiss: () -> Void
    
    private let colorPalette = [
        "#38BDF8", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
        "#EC4899", "#EF4444", "#F97316", "#F59E0B", "#10B981",
        "#06B6D4", "#64748B"
    ]
    
    public init(config: FootswitchConfig, onSave: @escaping (FootswitchConfig) -> Void, onDismiss: @escaping () -> Void) {
        _config = State(initialValue: config)
        self.onSave = onSave
        self.onDismiss = onDismiss
    }
    
    public var body: some View {
        NavigationView {
            Form {
                // Section 1: General Info & Visual Identity
                Section(header: Text("BUTTON IDENTITY").font(.caption).bold()) {
                    HStack {
                        Text("Name")
                            .font(.subheadline).bold()
                        TextField("e.g. SOLO", text: $config.name)
                            .multilineTextAlignment(.trailing)
                            .font(.system(.body, design: .rounded).bold())
                    }
                    
                    HStack {
                        Text("Sub-Label")
                            .font(.subheadline)
                        TextField("e.g. NOTE #39 / BOOST", text: $config.subLabel)
                            .multilineTextAlignment(.trailing)
                            .font(.subheadline)
                    }
                    
                    Picker("Switch Mode", selection: $config.mode) {
                        ForEach(SwitchMode.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    // LED Color Selector
                    VStack(alignment: .leading, spacing: 8) {
                        Text("LED Accent Color")
                            .font(.caption)
                            .foregroundColor(.gray)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(colorPalette, id: \.self) { hex in
                                    Circle()
                                        .fill(Color(hex: hex) ?? .blue)
                                        .frame(width: 28, height: 28)
                                        .overlay(
                                            Circle()
                                                .stroke(config.ledColorHex == hex ? Color.white : Color.clear, lineWidth: 3)
                                        )
                                        .onTapGesture {
                                            config.ledColorHex = hex
                                        }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
                
                // Section 2: Tap Action MIDI Mapping
                Section(header: Text("TAP ACTION MIDI MAPPING").font(.caption).bold()) {
                    Picker("MIDI Message Type", selection: $config.tapAction.midiType) {
                        ForEach(MIDIType.allCases) { type in
                            Text(type.rawValue).tag(type)
                        }
                    }
                    
                    Stepper("MIDI Channel: \(config.tapAction.channel)", value: $config.tapAction.channel, in: 1...16)
                    
                    Stepper("\(config.tapAction.midiType == .note ? "Note Number" : (config.tapAction.midiType == .cc ? "CC Number" : "Program Number")): \(config.tapAction.number)", value: $config.tapAction.number, in: 0...127)
                    
                    if config.tapAction.midiType != .programChange {
                        Stepper("ON Value: \(config.tapAction.onValue)", value: $config.tapAction.onValue, in: 0...127)
                        Stepper("OFF Value: \(config.tapAction.offValue)", value: $config.tapAction.offValue, in: 0...127)
                    }
                }
                
                // Section 3: Long Press Action MIDI Mapping
                Section(header: Text("LONG PRESS ACTION (HOLD 0.45s)").font(.caption).bold()) {
                    Toggle("Enable Long Press Action", isOn: $config.longPressAction.isEnabled)
                    
                    if config.longPressAction.isEnabled {
                        Picker("Long Press MIDI Type", selection: $config.longPressAction.midiType) {
                            ForEach(MIDIType.allCases) { type in
                                Text(type.rawValue).tag(type)
                            }
                        }
                        
                        Stepper("MIDI Channel: \(config.longPressAction.channel)", value: $config.longPressAction.channel, in: 1...16)
                        
                        Stepper("\(config.longPressAction.midiType == .note ? "Note Number" : (config.longPressAction.midiType == .cc ? "CC Number" : "Program Number")): \(config.longPressAction.number)", value: $config.longPressAction.number, in: 0...127)
                        
                        if config.longPressAction.midiType != .programChange {
                            Stepper("ON Value: \(config.longPressAction.onValue)", value: $config.longPressAction.onValue, in: 0...127)
                            Stepper("OFF Value: \(config.longPressAction.offValue)", value: $config.longPressAction.offValue, in: 0...127)
                        }
                    }
                }
            }
            .navigationTitle("Switch \(config.index + 1) Configuration")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel", action: onDismiss)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(config)
                    }
                    .bold()
                }
            }
        }
    }
}
