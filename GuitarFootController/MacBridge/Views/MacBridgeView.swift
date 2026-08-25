import SwiftUI
import CoreMIDI

public struct MacBridgeView: View {
    @StateObject private var midiManager = CoreMIDIManager()
    @StateObject private var udpServer: UDPServerService
    
    public init() {
        let midi = CoreMIDIManager()
        _midiManager = StateObject(wrappedValue: midi)
        _udpServer = StateObject(wrappedValue: UDPServerService(midiManager: midi))
    }
    
    public var body: some View {
        VStack(spacing: 0) {
            // Header Bar
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "guitars.fill")
                        .font(.title2)
                        .foregroundColor(.accentColor)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Mac MIDI Bridge")
                            .font(.headline)
                            .bold()
                        Text("GuitarFoot Controller CoreMIDI Gateway")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Server State Badge
                HStack(spacing: 6) {
                    Circle()
                        .fill(udpServer.isRunning ? Color.green : Color.red)
                        .frame(width: 10, height: 10)
                    
                    Text(udpServer.isRunning ? "RUNNING" : "STOPPED")
                        .font(.system(.caption, design: .monospaced).bold())
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Color(NSColor.controlBackgroundColor))
                .cornerRadius(6)
            }
            .padding()
            .background(Color(NSColor.windowBackgroundColor))
            
            Divider()
            
            // Status & Configuration Cards
            VStack(spacing: 16) {
                // Network Status
                GroupBox(label: Label("NETWORK & BONJOUR", systemImage: "network")) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("UDP Listening Port:")
                                .font(.subheadline)
                            Spacer()
                            Text("\(udpServer.port)")
                                .font(.system(.subheadline, design: .monospaced).bold())
                                .foregroundColor(.accentColor)
                        }
                        
                        HStack {
                            Text("Bonjour Service:")
                                .font(.subheadline)
                            Spacer()
                            Text(NetworkConstants.serviceType)
                                .font(.system(.subheadline, design: .monospaced))
                                .foregroundColor(.secondary)
                        }
                        
                        HStack {
                            Text("Connected iPhone / iPad Clients:")
                                .font(.subheadline)
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: udpServer.connectedClientsCount > 0 ? "iphone.radiowaves.left.and.right" : "iphone.slash")
                                Text("\(udpServer.connectedClientsCount) active")
                                    .bold()
                            }
                            .foregroundColor(udpServer.connectedClientsCount > 0 ? .green : .secondary)
                        }
                    }
                    .padding(8)
                }
                
                // CoreMIDI Destination
                GroupBox(label: Label("COREMIDI DESTINATION", systemImage: "pianokeys")) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Target MIDI Route:")
                                .font(.subheadline)
                            Spacer()
                            Picker("", selection: $midiManager.selectedDestinationId) {
                                ForEach(midiManager.availableDestinations) { dest in
                                    Text(dest.name).tag(dest.id)
                                }
                            }
                            .labelsHidden()
                            .frame(maxWidth: 320)
                        }
                        
                        Text("💡 'GuitarFoot Virtual Source' is automatically discovered in Logic Pro, AmpliTube 5, Guitar Rig, and Neural DSP without any extra drivers.")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    .padding(8)
                }
                
                // Real-time Telemetry
                GroupBox(label: Label("LIVE TELEMETRY & COMMANDS", systemImage: "waveform.path.ecg")) {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Last Received Command:")
                                .font(.subheadline)
                            Spacer()
                            Text(udpServer.lastReceivedCommandDescription)
                                .font(.system(.subheadline, design: .monospaced).bold())
                                .foregroundColor(.primary)
                        }
                        
                        HStack {
                            Text("Last Dispatched MIDI:")
                                .font(.subheadline)
                            Spacer()
                            Text(midiManager.lastSentMIDIMessage?.description ?? "None")
                                .font(.system(.subheadline, design: .monospaced).bold())
                                .foregroundColor(.purple)
                        }
                        
                        HStack {
                            Text("Total Packets / MIDI Messages:")
                                .font(.subheadline)
                            Spacer()
                            Text("\(udpServer.totalPacketsReceived) pkts / \(midiManager.totalMIDIMessagesSent) msgs")
                                .font(.system(.subheadline, design: .monospaced))
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(8)
                }
                
                // Activity Log Console
                GroupBox(label: HStack {
                    Label("ACTIVITY LOG", systemImage: "terminal")
                    Spacer()
                    Button("Clear Log") {
                        udpServer.clearLogs()
                    }
                    .font(.caption)
                }) {
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 4) {
                            if udpServer.logs.isEmpty {
                                Text("Awaiting incoming footswitch events from iPhone...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                    .padding(8)
                            } else {
                                ForEach(udpServer.logs) { log in
                                    HStack(alignment: .top, spacing: 8) {
                                        Text(log.timestamp, style: .time)
                                            .font(.system(size: 10, design: .monospaced))
                                            .foregroundColor(.secondary)
                                        
                                        Text("[\(log.title)]")
                                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                                            .foregroundColor(log.isError ? .red : .accentColor)
                                        
                                        Text(log.details)
                                            .font(.system(size: 10, design: .monospaced))
                                            .foregroundColor(.primary)
                                        
                                        Spacer()
                                    }
                                }
                            }
                        }
                        .padding(6)
                    }
                    .frame(height: 120)
                    .background(Color(NSColor.textBackgroundColor))
                    .cornerRadius(4)
                }
            }
            .padding()
            
            Spacer()
            
            // Footer Controls
            HStack {
                Button(action: {
                    midiManager.refreshDestinations()
                }) {
                    Label("Refresh MIDI Ports", systemImage: "arrow.triangle.2.circlepath")
                }
                
                Spacer()
                
                if udpServer.isRunning {
                    Button(role: .destructive, action: {
                        udpServer.stop()
                    }) {
                        Label("Stop Server", systemImage: "stop.fill")
                    }
                } else {
                    Button(action: {
                        udpServer.start()
                    }) {
                        Label("Start Server", systemImage: "play.fill")
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding()
            .background(Color(NSColor.windowBackgroundColor))
        }
        .frame(minWidth: 620, minHeight: 600)
        .onAppear {
            udpServer.start()
        }
    }
}
