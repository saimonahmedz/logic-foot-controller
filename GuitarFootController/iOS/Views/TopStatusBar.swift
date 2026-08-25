import SwiftUI

public struct TopStatusBar: View {
    @ObservedObject var viewModel: ControllerViewModel
    
    public var body: some View {
        HStack(spacing: 12) {
            // App Title & Preset Name
            HStack(spacing: 8) {
                Image(systemName: "guitars.fill")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                
                VStack(alignment: .leading, spacing: 1) {
                    Text("GTR FOOT")
                        .font(.system(size: 12, weight: .black, design: .monospaced))
                        .foregroundColor(.white)
                    
                    Text(viewModel.activePreset.name)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            // Real-time MIDI Activity Monitor
            HStack(spacing: 6) {
                Image(systemName: "waveform.path")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(viewModel.lastTriggerTime != nil ? .green : .gray)
                
                Text(viewModel.lastTriggeredMidiDescription)
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .lineLimit(1)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color.black.opacity(0.4))
            .cornerRadius(6)
            
            Spacer()
            
            // Connection Status & Latency Badge
            HStack(spacing: 8) {
                // Connection LED Indicator
                HStack(spacing: 5) {
                    Circle()
                        .fill(viewModel.udpClient.connectionStatus == .connected ? Color.green : (viewModel.udpClient.connectionStatus == .connecting ? Color.orange : Color.red))
                        .frame(width: 8, height: 8)
                    
                    Text(viewModel.udpClient.connectionStatus.rawValue)
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                        .foregroundColor(.white)
                }
                
                if viewModel.udpClient.connectionStatus == .connected {
                    Text(String(format: "%.1f ms", viewModel.udpClient.latencyMs))
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(.green)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.green.opacity(0.15))
                        .cornerRadius(4)
                }
                
                // Settings Cog Button
                Button(action: {
                    viewModel.showingSettingsSheet = true
                }) {
                    Image(systemName: "gearshape.fill")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                        .padding(7)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color(hex: "#0F1218"))
    }
}
