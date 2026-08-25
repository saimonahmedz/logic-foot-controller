import SwiftUI

public struct SettingsView: View {
    @ObservedObject var viewModel: ControllerViewModel
    @Environment(\.presentationMode) var presentationMode
    
    public var body: some View {
        NavigationView {
            Form {
                // Section 1: Connection
                Section(header: Text("CONNECTION").font(.caption).bold()) {
                    HStack {
                        Text("Status")
                        Spacer()
                        HStack(spacing: 6) {
                            Circle()
                                .fill(viewModel.udpClient.connectionStatus == .connected ? Color.green : (viewModel.udpClient.connectionStatus == .connecting ? Color.orange : Color.red))
                                .frame(width: 8, height: 8)
                            Text(viewModel.udpClient.connectionStatus.rawValue)
                                .font(.system(.body, design: .monospaced).bold())
                        }
                    }
                    
                    if !viewModel.udpClient.connectedBridgeName.isEmpty {
                        HStack {
                            Text("Connected Bridge")
                            Spacer()
                            Text(viewModel.udpClient.connectedBridgeName)
                                .foregroundColor(.gray)
                        }
                    }
                    
                    if viewModel.udpClient.connectionStatus == .connected {
                        HStack {
                            Text("Roundtrip Latency")
                            Spacer()
                            Text(String(format: "%.2f ms", viewModel.udpClient.latencyMs))
                                .font(.system(.body, design: .monospaced).bold())
                                .foregroundColor(.green)
                        }
                    }
                    
                    // Discovered Bonjour Bridges List
                    if !viewModel.bonjourBrowser.discoveredBridges.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Discovered Bridges (Bonjour):")
                                .font(.caption)
                                .foregroundColor(.gray)
                            
                            ForEach(viewModel.bonjourBrowser.discoveredBridges) { bridge in
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(bridge.name).font(.subheadline).bold()
                                        Text("\(bridge.hostName):\(bridge.port)").font(.caption).foregroundColor(.gray)
                                    }
                                    Spacer()
                                    Button("Connect") {
                                        viewModel.udpClient.connect(host: bridge.hostName, port: bridge.port, bridgeName: bridge.name)
                                    }
                                    .buttonStyle(.borderedProminent)
                                    .controlSize(.small)
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }
                    
                    // Connection Action Buttons
                    HStack {
                        Button(action: {
                            viewModel.bonjourBrowser.startDiscovery(serviceType: viewModel.appSettings.bonjourServiceType)
                        }) {
                            HStack {
                                Image(systemName: "arrow.clockwise")
                                Text("Rescan")
                            }
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            viewModel.startNetworkAutoConnect()
                        }) {
                            HStack {
                                Image(systemName: "bolt.fill")
                                Text("Reconnect")
                            }
                        }
                        
                        Spacer()
                        
                        Button(role: .destructive, action: {
                            viewModel.udpClient.disconnect()
                        }) {
                            HStack {
                                Image(systemName: "xmark.circle")
                                Text("Disconnect")
                            }
                        }
                    }
                }
                
                // Section 2: MIDI Global Defaults
                Section(header: Text("MIDI CONFIGURATION").font(.caption).bold()) {
                    Stepper("Default Global MIDI Channel: \(viewModel.appSettings.defaultMidiChannel)", value: $viewModel.appSettings.defaultMidiChannel, in: 1...16)
                    
                    Toggle("Prevent Duplicate MIDI Messages", isOn: $viewModel.appSettings.preventDuplicateMIDI)
                    
                    Toggle("Send Note-Off On Switch Release", isOn: $viewModel.appSettings.sendNoteOffOnRelease)
                }
                
                // Section 3: Controller Banks & Presets
                Section(header: Text("CONTROLLER & PRESETS").font(.caption).bold()) {
                    NavigationLink(destination: BankManagerView(
                        banks: viewModel.activePreset.banks,
                        activeBankId: viewModel.activeBank.id,
                        onSelectBank: { b in viewModel.selectBank(b) },
                        onBanksChanged: { banks in
                            viewModel.activePreset.banks = banks
                            viewModel.saveState()
                        }
                    )) {
                        HStack {
                            Text("Manage Banks")
                            Spacer()
                            Text("\(viewModel.activePreset.banks.count) Banks")
                                .foregroundColor(.gray)
                        }
                    }
                    
                    HStack {
                        Text("Active Preset")
                        Spacer()
                        Text(viewModel.activePreset.name)
                            .foregroundColor(.gray)
                    }
                }
                
                // Section 4: Appearance & Stage UX
                Section(header: Text("APPEARANCE & STAGE CONTROLS").font(.caption).bold()) {
                    Toggle("Stage Dark Mode", isOn: $viewModel.appSettings.darkMode)
                    Toggle("High Contrast Active Border", isOn: $viewModel.appSettings.highContrastMode)
                    Toggle("Show Sub-Labels (MIDI CC/Note)", isOn: $viewModel.appSettings.showSubLabels)
                    Toggle("Haptic Switch Click", isOn: $viewModel.appSettings.enableHapticFeedback)
                }
                
                // Section 5: Advanced & Diagnostics
                Section(header: Text("ADVANCED & DIAGNOSTICS").font(.caption).bold()) {
                    HStack {
                        Text("UDP Port")
                        Spacer()
                        Text("\(viewModel.appSettings.udpPort)")
                            .font(.system(.body, design: .monospaced))
                            .foregroundColor(.gray)
                    }
                    
                    HStack {
                        Text("Bonjour Service")
                        Spacer()
                        Text(viewModel.appSettings.bonjourServiceType)
                            .font(.system(.body, design: .monospaced))
                            .foregroundColor(.gray)
                    }
                    
                    NavigationLink(destination: NetworkDiagnosticsView(viewModel: viewModel)) {
                        Text("Network Diagnostics & Live Log")
                    }
                }
            }
            .navigationTitle("Controller Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        viewModel.saveState()
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}
