import Foundation
import CoreMIDI
import Combine

public final class CoreMIDIManager: ObservableObject {
    @Published public private(set) var availableDestinations: [MIDIDestinationItem] = []
    @Published public var selectedDestinationId: Int32 = -1 // -1 means Virtual Source (broadcast to all DAWs)
    @Published public private(set) var lastSentMIDIMessage: MIDIMessage? = nil
    @Published public private(set) var totalMIDIMessagesSent: UInt64 = 0
    @Published public private(set) var errorMessage: String? = nil
    
    private var midiClient: MIDIClientRef = 0
    private var outputPort: MIDIPortRef = 0
    private var virtualSourceEndpoint: MIDIEndpointRef = 0
    
    public init() {
        setupCoreMIDI()
        refreshDestinations()
    }
    
    private func setupCoreMIDI() {
        // 1. Create CoreMIDI Client
        let clientName = "GuitarFoot Bridge Client" as CFString
        let status = MIDIClientCreateWithBlock(clientName, &midiClient) { [weak self] notificationPtr in
            let notification = notificationPtr.pointee
            if notification.messageID == .msgSetupChanged {
                DispatchQueue.main.async {
                    self?.refreshDestinations()
                }
            }
        }
        
        guard status == noErr else {
            errorMessage = "Failed to create MIDIClient (Error \(status))"
            return
        }
        
        // 2. Create standard Output Port
        let portName = "GuitarFoot Output Port" as CFString
        let portStatus = MIDIOutputPortCreate(midiClient, portName, &outputPort)
        if portStatus != noErr {
            errorMessage = "Failed to create MIDI output port (Error \(portStatus))"
        }
        
        // 3. Create Virtual Source Endpoint for DAW auto-discovery (Logic Pro / AmpliTube 5)
        let virtualSourceName = "GuitarFoot Bridge" as CFString
        let sourceStatus = MIDISourceCreate(midiClient, virtualSourceName, &virtualSourceEndpoint)
        if sourceStatus != noErr {
            errorMessage = "Failed to create Virtual MIDI Source (Error \(sourceStatus))"
        }
    }
    
    public func refreshDestinations() {
        var list: [MIDIDestinationItem] = [
            MIDIDestinationItem(id: -1, name: "GuitarFoot Virtual Source (DAW / Logic / AmpliTube)", isVirtualOutput: true)
        ]
        
        let count = MIDIGetNumberOfDestinations()
        for i in 0..<count {
            let endpoint = MIDIGetDestination(i)
            if endpoint != 0 {
                let name = getEndpointName(endpoint)
                list.append(MIDIDestinationItem(id: Int32(i), name: name, isVirtualOutput: false, endpointRef: endpoint))
            }
        }
        
        DispatchQueue.main.async {
            self.availableDestinations = list
        }
    }
    
    private func getEndpointName(_ endpoint: MIDIEndpointRef) -> String {
        var property: Unmanaged<CFString>?
        let status = MIDIObjectGetStringProperty(endpoint, kMIDIPropertyDisplayName, &property)
        if status == noErr, let name = property?.takeRetainedValue() as String? {
            return name
        }
        
        let status2 = MIDIObjectGetStringProperty(endpoint, kMIDIPropertyName, &property)
        if status2 == noErr, let name = property?.takeRetainedValue() as String? {
            return name
        }
        return "MIDI Destination \(endpoint)"
    }
    
    /// Sends a MIDIMessage to CoreMIDI virtual source and selected destination
    public func send(message: MIDIMessage) {
        let bytes = message.toRawMIDIBytes()
        guard !bytes.isEmpty else { return }
        
        var packetList = MIDIPacketList()
        var curPacket = MIDIPacketListInit(&packetList)
        
        let timestamp: MIDITimeStamp = 0 // 0 = send immediately
        curPacket = MIDIPacketListAdd(&packetList, 1024, curPacket, timestamp, bytes.count, bytes)
        
        // 1. Emit on Virtual Source (for Logic Pro / AmpliTube 5 to receive)
        if virtualSourceEndpoint != 0 {
            MIDIReceived(virtualSourceEndpoint, &packetList)
        }
        
        // 2. If a specific physical/hardware destination is selected, route to it
        if selectedDestinationId >= 0, let destItem = availableDestinations.first(where: { $0.id == selectedDestinationId }), let destRef = destItem.endpointRef {
            MIDISend(outputPort, destRef, &packetList)
        }
        
        DispatchQueue.main.async {
            self.lastSentMIDIMessage = message
            self.totalMIDIMessagesSent += 1
        }
    }
    
    deinit {
        if virtualSourceEndpoint != 0 {
            MIDIEndpointDispose(virtualSourceEndpoint)
        }
        if outputPort != 0 {
            MIDIPortDispose(outputPort)
        }
        if midiClient != 0 {
            MIDIClientDispose(midiClient)
        }
    }
}
