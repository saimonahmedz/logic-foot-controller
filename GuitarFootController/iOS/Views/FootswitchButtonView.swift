import SwiftUI

public struct FootswitchButtonView: View {
    public let config: FootswitchConfig
    public let isOn: Bool
    public let isPressed: Bool
    public let isHighContrast: Bool
    public let showSubLabel: Bool
    public let onPressDown: () -> Void
    public let onPressUp: () -> Void
    public let onConfigure: () -> Void
    
    private var ledColor: Color {
        Color(hex: config.ledColorHex) ?? .emeraldAccent
    }
    
    public var body: some View {
        Button(action: {}) {
            ZStack {
                // Pedal switch enclosure body (Cast aluminum look)
                RoundedRectangle(cornerRadius: 14)
                    .fill(
                        LinearGradient(
                            colors: isPressed
                                ? [Color(hex: "#1E222B")!, Color(hex: "#12151B")!]
                                : (isOn
                                    ? [Color(hex: "#262C38")!, Color(hex: "#181D26")!]
                                    : [Color(hex: "#1F242E")!, Color(hex: "#14171E")!]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(
                                isOn ? ledColor.opacity(0.8) : Color.white.opacity(0.12),
                                lineWidth: isOn ? 2 : 1
                            )
                    )
                    .shadow(color: isOn ? ledColor.opacity(0.35) : Color.black.opacity(0.6), radius: isOn ? 12 : 6, x: 0, y: isPressed ? 2 : 5)
                
                VStack(spacing: 8) {
                    // Top Bar: LED Jewel & Switch Mode Badge
                    HStack {
                        // LED Jewel Light
                        HStack(spacing: 6) {
                            Circle()
                                .fill(isOn ? ledColor : Color.gray.opacity(0.3))
                                .frame(width: 12, height: 12)
                                .overlay(
                                    Circle()
                                        .stroke(Color.white.opacity(0.4), lineWidth: 1)
                                )
                                .shadow(color: isOn ? ledColor : .clear, radius: 8, x: 0, y: 0)
                            
                            Text(isOn ? "ON" : "OFF")
                                .font(.system(size: 11, weight: .black, design: .monospaced))
                                .foregroundColor(isOn ? ledColor : Color.gray.opacity(0.6))
                        }
                        
                        Spacer()
                        
                        // Switch mode indicator & Switch index
                        HStack(spacing: 4) {
                            Text(config.mode == .momentary ? "MOM" : "TOGGLE")
                                .font(.system(size: 9, weight: .bold, design: .monospaced))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.black.opacity(0.4))
                                .foregroundColor(.gray)
                                .cornerRadius(4)
                            
                            Text("SW\(config.index + 1)")
                                .font(.system(size: 10, weight: .bold, design: .monospaced))
                                .foregroundColor(.gray.opacity(0.8))
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.top, 10)
                    
                    Spacer()
                    
                    // Center Switch Actuator Graphic & Large Title
                    VStack(spacing: 4) {
                        // Switch Stomp Cap Visual (Metallic Knurled Bezel)
                        Circle()
                            .fill(
                                RadialGradient(
                                    gradient: Gradient(colors: [
                                        isPressed ? Color.gray.opacity(0.5) : Color.gray.opacity(0.8),
                                        Color(hex: "#0F1218")!
                                    ]),
                                    center: .center,
                                    startRadius: 2,
                                    endRadius: 22
                                )
                            )
                            .frame(width: 44, height: 44)
                            .overlay(
                                Circle()
                                    .stroke(isOn ? ledColor.opacity(0.9) : Color.white.opacity(0.2), lineWidth: 2)
                            )
                            .scaleEffect(isPressed ? 0.92 : 1.0)
                            .animation(.easeOut(duration: 0.08), value: isPressed)
                        
                        Text(config.name)
                            .font(.system(size: 20, weight: .black, design: .rounded))
                            .foregroundColor(isOn ? .white : Color(hex: "#CBD5E1"))
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                        
                        if showSubLabel && !config.subLabel.isEmpty {
                            Text(config.subLabel)
                                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                                .foregroundColor(isOn ? ledColor.opacity(0.9) : Color.gray)
                                .lineLimit(1)
                        }
                    }
                    
                    Spacer()
                    
                    // Bottom: MIDI Action Tag & Config Button
                    HStack {
                        Text("\(config.tapAction.midiType.shortName) #\(config.tapAction.number)")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(.gray.opacity(0.7))
                        
                        Spacer()
                        
                        Button(action: onConfigure) {
                            Image(systemName: "slider.horizontal.3")
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(.gray)
                                .padding(6)
                                .background(Color.black.opacity(0.3))
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.bottom, 8)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.easeInOut(duration: 0.08), value: isPressed)
        ._onButtonGesture(
            pressing: { pressing in
                if pressing {
                    onPressDown()
                } else {
                    onPressUp()
                }
            },
            perform: {}
        )
    }
}

// Color Hex Helper
extension Color {
    static let emeraldAccent = Color(hex: "#10B981")!
    
    init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        
        var rgb: UInt64 = 0
        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }
        
        let length = hexSanitized.count
        let r, g, b, a: Double
        if length == 6 {
            r = Double((rgb & 0xFF0000) >> 16) / 255.0
            g = Double((rgb & 0x00FF00) >> 8) / 255.0
            b = Double(rgb & 0x0000FF) / 255.0
            a = 1.0
        } else if length == 8 {
            r = Double((rgb & 0xFF000000) >> 24) / 255.0
            g = Double((rgb & 0x00FF0000) >> 16) / 255.0
            b = Double((rgb & 0x0000FF00) >> 8) / 255.0
            a = Double(rgb & 0x000000FF) / 255.0
        } else {
            return nil
        }
        self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}
