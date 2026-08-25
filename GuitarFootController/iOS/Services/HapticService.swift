import Foundation
#if canImport(UIKit)
import UIKit

public final class HapticService {
    public static let shared = HapticService()
    
    private let impactLight = UIImpactFeedbackGenerator(style: .light)
    private let impactMedium = UIImpactFeedbackGenerator(style: .medium)
    private let impactHeavy = UIImpactFeedbackGenerator(style: .heavy)
    private let impactRigid = UIImpactFeedbackGenerator(style: .rigid)
    private let notificationGenerator = UINotificationFeedbackGenerator()
    
    private init() {
        prepare()
    }
    
    public func prepare() {
        impactLight.prepare()
        impactMedium.prepare()
        impactHeavy.prepare()
        impactRigid.prepare()
        notificationGenerator.prepare()
    }
    
    public func triggerSwitchTap() {
        impactHeavy.impactOccurred(intensity: 0.9)
    }
    
    public func triggerSwitchRelease() {
        impactLight.impactOccurred(intensity: 0.5)
    }
    
    public func triggerLongPress() {
        impactRigid.impactOccurred(intensity: 1.0)
    }
    
    public func triggerBankChange() {
        impactMedium.impactOccurred()
    }
    
    public func triggerSuccess() {
        notificationGenerator.notificationOccurred(.success)
    }
    
    public func triggerError() {
        notificationGenerator.notificationOccurred(.error)
    }
}
#else
public final class HapticService {
    public static let shared = HapticService()
    private init() {}
    public func prepare() {}
    public func triggerSwitchTap() {}
    public func triggerSwitchRelease() {}
    public func triggerLongPress() {}
    public func triggerBankChange() {}
    public func triggerSuccess() {}
    public func triggerError() {}
}
#endif
