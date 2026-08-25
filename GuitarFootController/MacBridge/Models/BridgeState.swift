import Foundation
import CoreMIDI

public struct MIDIDestinationItem: Identifiable, Hashable {
    public var id: Int32
    public var name: String
    public var isVirtualOutput: Bool
    public var endpointRef: MIDIEndpointRef?
    
    public init(id: Int32, name: String, isVirtualOutput: Bool = false, endpointRef: MIDIEndpointRef? = nil) {
        self.id = id
        self.name = name
        self.isVirtualOutput = isVirtualOutput
        self.endpointRef = endpointRef
    }
}

public struct BridgeLogItem: Identifiable {
    public var id = UUID()
    public var timestamp = Date()
    public var title: String
    public var details: String
    public var isError: Bool
    
    public init(title: String, details: String, isError: Bool = false) {
        self.title = title
        self.details = details
        self.isError = isError
    }
}
