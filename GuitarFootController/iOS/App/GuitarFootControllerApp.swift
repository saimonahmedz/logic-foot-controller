import SwiftUI

@main
struct GuitarFootControllerApp: App {
    init() {
        // Enforce stage display staying awake during live performance
        #if canImport(UIKit)
        UIApplication.shared.isIdleTimerDisabled = true
        #endif
    }
    
    var body: some Scene {
        WindowGroup {
            MainControllerView()
                .preferredColorScheme(.dark)
        }
    }
}
