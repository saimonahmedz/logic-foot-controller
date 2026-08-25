import Foundation
import Network
import Combine

public final class BonjourBrowser: ObservableObject {
    @Published public private(set) var discoveredBridges: [DiscoveredBridge] = []
    @Published public private(set) var isSearching: Bool = false
    @Published public private(set) var errorMessage: String? = nil
    
    private var browser: NWBrowser?
    private let queue = DispatchQueue(label: "com.guitarfoot.bonjour.browser", qos: .userInitiated)
    
    public init() {}
    
    public func startDiscovery(serviceType: String = NetworkConstants.serviceType) {
        stopDiscovery()
        
        let descriptor = NWBrowser.Descriptor.bonjour(type: serviceType, domain: NetworkConstants.domain)
        let parameters = NWParameters.udp
        parameters.includePeerToPeer = true
        
        browser = NWBrowser(for: descriptor, using: parameters)
        
        browser?.stateUpdateHandler = { [weak self] state in
            DispatchQueue.main.async {
                switch state {
                case .ready:
                    self?.isSearching = true
                    self?.errorMessage = nil
                case .failed(let error):
                    self?.isSearching = false
                    self?.errorMessage = "Bonjour discovery failed: \(error.localizedDescription)"
                case .cancelled:
                    self?.isSearching = false
                default:
                    break
                }
            }
        }
        
        browser?.browseResultsChangedHandler = { [weak self] results, changes in
            guard let self = self else { return }
            var updatedBridges: [DiscoveredBridge] = []
            
            for result in results {
                if case .service(let name, let type, let domain, _) = result.endpoint {
                    let id = "\(name).\(type).\(domain)"
                    let bridge = DiscoveredBridge(
                        id: id,
                        name: name,
                        hostName: "\(name).\(domain)",
                        port: NetworkConstants.defaultUDPPort
                    )
                    updatedBridges.append(bridge)
                }
            }
            
            DispatchQueue.main.async {
                self.discoveredBridges = updatedBridges
            }
        }
        
        browser?.start(queue: queue)
    }
    
    public func stopDiscovery() {
        browser?.cancel()
        browser = nil
        DispatchQueue.main.async {
            self.isSearching = false
        }
    }
    
    deinit {
        stopDiscovery()
    }
}
