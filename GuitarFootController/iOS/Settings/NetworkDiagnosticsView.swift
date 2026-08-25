import SwiftUI

public struct NetworkDiagnosticsView: View {
    @ObservedObject var viewModel: ControllerViewModel
    
    public var body: some View {
        List {
            Section(header: Text("SOCKET & INTERFACE").font(.caption).bold()) {
                HStack {
                    Text("Protocol")
                    Spacer()
                    Text("UDP (Network.framework)")
                        .font(.system(.subheadline, design: .monospaced))
                }
                
                HStack {
                    Text("Active Port")
                    Spacer()
                    Text("\(viewModel.appSettings.udpPort)")
                        .font(.system(.subheadline, design: .monospaced))
                }
                
                HStack {
                    Text("Packets Sent")
                    Spacer()
                    Text("\(viewModel.udpClient.packetsSentCount)")
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundColor(.blue)
                }
                
                HStack {
                    Text("Packets Received")
                    Spacer()
                    Text("\(viewModel.udpClient.packetsReceivedCount)")
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundColor(.green)
                }
            }
            
            Section(header: Text("BRIDGE TELEMETRY").font(.caption).bold()) {
                if let status = viewModel.udpClient.lastReceivedBridgeStatus {
                    HStack {
                        Text("Bridge Host")
                        Spacer()
                        Text(status.bridgeName)
                    }
                    
                    HStack {
                        Text("CoreMIDI Target")
                        Spacer()
                        Text(status.selectedDestinationName)
                            .foregroundColor(.purple)
                    }
                    
                    HStack {
                        Text("Server Processed")
                        Spacer()
                        Text("\(status.totalPacketsProcessed) pkts")
                    }
                } else {
                    Text("No Bridge status received yet. Ensure Mac Bridge app is running.")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            if let error = viewModel.udpClient.errorMessage {
                Section(header: Text("LAST ERROR").font(.caption).bold().foregroundColor(.red)) {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
        }
        .navigationTitle("Network Diagnostics")
        .navigationBarTitleDisplayMode(.inline)
    }
}
