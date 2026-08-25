import SwiftUI

@main
struct MacBridgeApp: App {
    var body: some Scene {
        WindowGroup {
            MacBridgeView()
        }
        .windowStyle(.titleBar)
        .windowToolbarStyle(.unified)
    }
}
