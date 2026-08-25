import Foundation
import Network
import Combine

public final class UDPServerService: ObservableObject {
    @Published public private(set) var isRunning: Bool = false
    @Published public private(set) var port: UInt16 = NetworkConstants.defaultUDPPort
    @Published public private(set) var connectedClientsCount: Int = 0
    @Published public private(set) var lastReceivedCommandDescription: String = "No commands yet"
    @Published public private(set) var lastReceivedSwitchEvent: SwitchEventPayload? = nil
    @Published public private(set) var lastPacketTime: Date? = nil
    @Published public private(set) var totalPacketsReceived: UInt64 = 0
    @Published public private(set) var logs: [BridgeLogItem] = []
    @Published public private(set) var errorMessage: String? = nil
    
    private var listener: NWListener?
    private let queue = DispatchQueue(label: "com.guitarfoot.mac.udp.server", qos: .userInteractive)
    private var activeConnections: [NWConnection] = []
    private let midiManager: CoreMIDIManager
    private let bonjourAdvertiser = BonjourAdvertiser()
    
    public init(midiManager: CoreMIDIManager) {
        self.midiManager = midiManager
    }
    
    public func start(port: UInt16 = NetworkConstants.defaultUDPPort) {
        stop()
        self.port = port
        
        do {
            let parameters = NWParameters.udp
            parameters.allowFastOpen = true
            parameters.includePeerToPeer = true
            
            guard let nwPort = NWEndpoint.Port(rawValue: port) else {
                errorMessage = "Invalid port \(port)"
                return
            }
            
            listener = try NWListener(using: parameters, on: nwPort)
            
            // Bonjour publication
            let bridgeName = Host.current().localizedName ?? "Mac GuitarFoot Bridge"
            listener?.service = NWListener.Service(
                name: bridgeName,
                type: NetworkConstants.serviceType,
                domain: NetworkConstants.domain
            )
            
            listener?.stateUpdateHandler = { [weak self] state in
                DispatchQueue.main.async {
                    switch state {
                    case .ready:
                        self?.isRunning = true
                        self?.errorMessage = nil
                        self?.addLog("Server Ready", details: "Listening on UDP port \(port) & Bonjour published.")
                    case .failed(let error):
                        self?.isRunning = false
                        self?.errorMessage = "Server failed: \(error.localizedDescription)"
                        self?.addLog("Server Error", details: error.localizedDescription, isError: true)
                    case .cancelled:
                        self?.isRunning = false
                    default:
                        break
                    }
                }
            }
            
            listener?.newConnectionHandler = { [weak self] newConnection in
                self?.handleIncomingConnection(newConnection)
            }
            
            listener?.start(queue: queue)
        } catch {
            errorMessage = "Failed to start UDP Listener: \(error.localizedDescription)"
            addLog("Listener Error", details: error.localizedDescription, isError: true)
        }
    }
    
    private func handleIncomingConnection(_ connection: NWConnection) {
        activeConnections.append(connection)
        
        connection.stateUpdateHandler = { [weak self] state in
            guard let self = self else { return }
            switch state {
            case .ready:
                self.receive(on: connection)
                DispatchQueue.main.async {
                    self.connectedClientsCount = self.activeConnections.count
                }
            case .failed, .cancelled:
                self.activeConnections.removeAll(where: { $0 === connection })
                DispatchQueue.main.async {
                    self.connectedClientsCount = self.activeConnections.count
                }
            default:
                break
            }
        }
        
        connection.start(queue: queue)
    }
    
    private func receive(on connection: NWConnection) {
        connection.receiveMessage { [weak self] (content, context, isComplete, error) in
            guard let self = self else { return }
            
            if let data = content, let packet = NetworkPacket.decode(from: data) {
                self.processPacket(packet, from: connection)
            }
            
            if connection.state == .ready {
                self.receive(on: connection)
            }
        }
    }
    
    private func processPacket(_ packet: NetworkPacket, from connection: NWConnection) {
        DispatchQueue.main.async {
            self.totalPacketsReceived += 1
            self.lastPacketTime = Date()
        }
        
        switch packet.type {
        case .ping:
            // Immediate Pong echo for roundtrip latency calculation
            let pongPacket = NetworkPacket(
                sequence: packet.sequence,
                type: .pong,
                senderId: "MacBridge",
                timestamp: packet.timestamp
            )
            if let data = pongPacket.encode() {
                connection.send(content: data, completion: .contentProcessed({ _ in }))
            }
            
        case .footswitchEvent:
            if let sw = packet.switchEvent {
                DispatchQueue.main.async {
                    self.lastReceivedSwitchEvent = sw
                    self.lastReceivedCommandDescription = "\(sw.switchName) (\(sw.isLongPress ? "LONG" : "TAP")) → \(sw.midiMessage.description)"
                    self.addLog("Foot Event", details: "\(sw.switchName) [\(sw.isOn ? "ON" : "OFF")] - \(sw.midiMessage.description)")
                }
                midiManager.send(message: sw.midiMessage)
            }
            
        case .midiCommand:
            if let midi = packet.midiMessage {
                DispatchQueue.main.async {
                    self.lastReceivedCommandDescription = "Direct MIDI: \(midi.description)"
                    self.addLog("Direct MIDI", details: midi.description)
                }
                midiManager.send(message: midi)
            }
            
        case .bankChange:
            if let bank = packet.bankName {
                DispatchQueue.main.async {
                    self.lastReceivedCommandDescription = "Bank Switched: \(bank)"
                    self.addLog("Bank Changed", details: "Active Bank is now '\(bank)'")
                }
            }
            
        default:
            break
        }
        
        // Broadcast Bridge Status reply
        sendBridgeStatus(to: connection)
    }
    
    private func sendBridgeStatus(to connection: NWConnection) {
        let destName = midiManager.availableDestinations.first(where: { $0.id == midiManager.selectedDestinationId })?.name ?? "GuitarFoot Virtual Source"
        let status = BridgeStatusPayload(
            bridgeName: Host.current().localizedName ?? "Mac GuitarFoot Bridge",
            isMidiDestinationReady: true,
            selectedDestinationName: destName,
            totalPacketsProcessed: totalPacketsReceived,
            activeClientsCount: activeConnections.count
        )
        let statusPacket = NetworkPacket(
            sequence: 0,
            type: .bridgeStatus,
            senderId: "MacBridge",
            bridgeStatus: status
        )
        if let data = statusPacket.encode() {
            connection.send(content: data, completion: .contentProcessed({ _ in }))
        }
    }
    
    private func addLog(_ title: String, details: String, isError: Bool = false) {
        DispatchQueue.main.async {
            self.logs.insert(BridgeLogItem(title: title, details: details, isError: isError), at: 0)
            if self.logs.count > 100 {
                self.logs.removeLast()
            }
        }
    }
    
    public func clearLogs() {
        logs.removeAll()
    }
    
    public func stop() {
        for conn in activeConnections {
            conn.cancel()
        }
        activeConnections.removeAll()
        listener?.cancel()
        listener = nil
        DispatchQueue.main.async {
            self.isRunning = false
            self.connectedClientsCount = 0
        }
    }
    
    deinit {
        stop()
    }
}
