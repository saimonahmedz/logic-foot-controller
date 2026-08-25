import Foundation
import Network
import Combine

public final class BonjourAdvertiser: ObservableObject {
    @Published public private(set) var isAdvertising: Bool = false
    @Published public private(set) var serviceName: String = ""
    @Published public private(set) var errorMessage: String? = nil
    
    private var listener: NWListener?
    private let queue = DispatchQueue(label: "com.guitarfoot.mac.bonjour", qos: .userInitiated)
    
    public init() {}
    
    public func startAdvertising(
        serviceName: String = Host.current().localizedName ?? "Mac Studio MIDI Bridge",
        port: UInt16 = NetworkConstants.defaultUDPPort,
        serviceType: String = NetworkConstants.serviceType
    ) {
        stopAdvertising()
        self.serviceName = serviceName
        
        do {
            let parameters = NWParameters.udp
            parameters.allowFastOpen = true
            parameters.includePeerToPeer = true
            
            guard let nwPort = NWEndpoint.Port(rawValue: port) else {
                errorMessage = "Invalid Port \(port)"
                return
            }
            
            listener = try NWListener(using: parameters, on: nwPort)
            
            // Set Bonjour Service Advertisement
            listener?.service = NWListener.Service(
                name: serviceName,
                type: serviceType,
                domain: NetworkConstants.domain
            )
            
            listener?.stateUpdateHandler = { [weak self] state in
                DispatchQueue.main.async {
                    switch state {
                    case .ready:
                        self?.isAdvertising = true
                        self?.errorMessage = nil
                    case .failed(let error):
                        self?.isAdvertising = false
                        self?.errorMessage = "Bonjour failed: \(error.localizedDescription)"
                    case .cancelled:
                        self?.isAdvertising = false
                    default:
                        break
                    }
                }
            }
            
            listener?.start(queue: queue)
        } catch {
            errorMessage = "Failed to start Bonjour listener: \(error.localizedDescription)"
        }
    }
    
    public func stopAdvertising() {
        listener?.cancel()
        listener = nil
        DispatchQueue.main.async {
            self.isAdvertising = false
        }
    }
    
    deinit {
        stopAdvertising()
    }
}
