import Foundation
import Network
import Combine

public final class UDPClientService: ObservableObject {
    @Published public private(set) var connectionStatus: ConnectionStatus = .disconnected
    @Published public private(set) var connectedBridgeName: String = ""
    @Published public private(set) var latencyMs: Double = 0.0
    @Published public private(set) var lastReceivedBridgeStatus: BridgeStatusPayload? = nil
    @Published public private(set) var packetsSentCount: UInt64 = 0
    @Published public private(set) var packetsReceivedCount: UInt64 = 0
    @Published public private(set) var errorMessage: String? = nil
    
    private var connection: NWConnection?
    private let queue = DispatchQueue(label: "com.guitarfoot.udp.client", qos: .userInteractive)
    private var sequenceNumber: UInt32 = 0
    private var pingTimer: Timer?
    private var reconnectTimer: Timer?
    private var lastPingSentTime: TimeInterval = 0
    private var currentHost: String = ""
    private var currentPort: UInt16 = NetworkConstants.defaultUDPPort
    private let clientUUID = UUID().uuidString
    
    public init() {}
    
    /// Connect to Mac MIDI Bridge via Host and Port
    public func connect(host: String, port: UInt16, bridgeName: String = "Mac MIDI Bridge") {
        disconnect()
        
        self.currentHost = host
        self.currentPort = port
        self.connectedBridgeName = bridgeName
        self.connectionStatus = .connecting
        self.errorMessage = nil
        
        let nwHost = NWEndpoint.Host(host)
        let nwPort = NWEndpoint.Port(rawValue: port) ?? NWEndpoint.Port(rawValue: NetworkConstants.defaultUDPPort)!
        
        let parameters = NWParameters.udp
        parameters.allowFastOpen = true
        parameters.includePeerToPeer = true
        
        connection = NWConnection(host: nwHost, port: nwPort, using: parameters)
        
        connection?.stateUpdateHandler = { [weak self] state in
            DispatchQueue.main.async {
                guard let self = self else { return }
                switch state {
                case .ready:
                    self.connectionStatus = .connected
                    self.errorMessage = nil
                    self.startListening()
                    self.startHeartbeat()
                    self.sendPing()
                case .waiting(let error):
                    self.connectionStatus = .connecting
                    self.errorMessage = "Connecting: \(error.localizedDescription)"
                case .failed(let error):
                    self.connectionStatus = .disconnected
                    self.errorMessage = "Connection failed: \(error.localizedDescription)"
                    self.scheduleAutoReconnect()
                case .cancelled:
                    self.connectionStatus = .disconnected
                default:
                    break
                }
            }
        }
        
        connection?.start(queue: queue)
    }
    
    /// Sends a footswitch switch event immediately
    public func sendSwitchEvent(_ event: SwitchEventPayload) {
        sequenceNumber += 1
        let packet = NetworkPacket(
            sequence: sequenceNumber,
            type: .footswitchEvent,
            senderId: clientUUID,
            midiMessage: event.midiMessage,
            switchEvent: event
        )
        sendPacket(packet)
    }
    
    /// Sends direct raw MIDI message
    public func sendMIDIMessage(_ midi: MIDIMessage) {
        sequenceNumber += 1
        let packet = NetworkPacket(
            sequence: sequenceNumber,
            type: .midiCommand,
            senderId: clientUUID,
            midiMessage: midi
        )
        sendPacket(packet)
    }
    
    /// Sends Bank switch notice to Mac
    public func sendBankChange(bankName: String) {
        sequenceNumber += 1
        let packet = NetworkPacket(
            sequence: sequenceNumber,
            type: .bankChange,
            senderId: clientUUID,
            bankName: bankName
        )
        sendPacket(packet)
    }
    
    /// Sends latency check ping
    public func sendPing() {
        lastPingSentTime = Date().timeIntervalSince1970
        sequenceNumber += 1
        let packet = NetworkPacket(
            sequence: sequenceNumber,
            type: .ping,
            senderId: clientUUID,
            timestamp: lastPingSentTime
        )
        sendPacket(packet)
    }
    
    private func sendPacket(_ packet: NetworkPacket) {
        guard let data = packet.encode() else { return }
        
        connection?.send(content: data, completion: .contentProcessed({ [weak self] error in
            if let error = error {
                DispatchQueue.main.async {
                    self?.errorMessage = "UDP Send Error: \(error.localizedDescription)"
                }
            } else {
                DispatchQueue.main.async {
                    self?.packetsSentCount += 1
                }
            }
        }))
    }
    
    private func startListening() {
        connection?.receiveMessage { [weak self] (content, context, isComplete, error) in
            guard let self = self else { return }
            
            if let data = content, let packet = NetworkPacket.decode(from: data) {
                DispatchQueue.main.async {
                    self.packetsReceivedCount += 1
                    self.handleIncomingPacket(packet)
                }
            }
            
            if self.connectionStatus == .connected {
                self.startListening()
            }
        }
    }
    
    private func handleIncomingPacket(_ packet: NetworkPacket) {
        switch packet.type {
        case .pong:
            let now = Date().timeIntervalSince1970
            let rtt = (now - packet.timestamp) * 1000.0
            self.latencyMs = max(0.5, rtt)
            
        case .bridgeStatus:
            if let status = packet.bridgeStatus {
                self.lastReceivedBridgeStatus = status
                self.connectedBridgeName = status.bridgeName
            }
            
        case .disconnectNotice:
            self.connectionStatus = .disconnected
            self.errorMessage = "Mac MIDI Bridge closed connection"
            
        default:
            break
        }
    }
    
    private func startHeartbeat() {
        pingTimer?.invalidate()
        pingTimer = Timer.scheduledTimer(withTimeInterval: NetworkConstants.heartbeatInterval, repeats: true) { [weak self] _ in
            self?.sendPing()
        }
    }
    
    private func scheduleAutoReconnect() {
        reconnectTimer?.invalidate()
        reconnectTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { [weak self] _ in
            guard let self = self, !self.currentHost.isEmpty else { return }
            if self.connectionStatus != .connected {
                self.connect(host: self.currentHost, port: self.currentPort, bridgeName: self.connectedBridgeName)
            }
        }
    }
    
    public func disconnect() {
        pingTimer?.invalidate()
        pingTimer = nil
        reconnectTimer?.invalidate()
        reconnectTimer = nil
        
        connection?.cancel()
        connection = nil
        
        DispatchQueue.main.async {
            self.connectionStatus = .disconnected
            self.latencyMs = 0
        }
    }
    
    deinit {
        disconnect()
    }
}
