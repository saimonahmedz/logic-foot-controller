import Foundation

public enum NetworkConstants {
    /// Bonjour service type for discovering the Mac MIDI Bridge on local Wi-Fi
    public static let serviceType = "_guitarfoot._udp"
    
    /// Default UDP communication port
    public static let defaultUDPPort: UInt16 = 50001
    
    /// Domain for local network discovery
    public static let domain = "local."
    
    /// Protocol version header for packet integrity check
    public static let protocolVersion: UInt8 = 1
    
    /// Magic 4-byte header: "GTRF" in ASCII
    public static let magicHeader: [UInt8] = [0x47, 0x54, 0x52, 0x46]
    
    /// Heartbeat interval in seconds
    public static let heartbeatInterval: TimeInterval = 2.0
    
    /// Connection timeout threshold in seconds
    public static let timeoutInterval: TimeInterval = 5.0
}
