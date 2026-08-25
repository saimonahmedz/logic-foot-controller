// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "GuitarFootController",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        // iOS Footswitch Controller Application
        .executable(
            name: "GuitarFootControllerIOS",
            targets: ["GuitarFootControllerIOS"]
        ),
        // macOS MIDI Bridge Daemon & GUI Application
        .executable(
            name: "MacMIDIBridge",
            targets: ["MacMIDIBridge"]
        ),
        // Shared Protocol & MIDI Message Library
        .library(
            name: "GuitarFootShared",
            targets: ["GuitarFootShared"]
        )
    ],
    dependencies: [],
    targets: [
        // 1. Shared Models & Network Protocol
        .target(
            name: "GuitarFootShared",
            dependencies: [],
            path: "Shared"
        ),
        
        // 2. iOS 8-Switch Foot Controller App
        .executableTarget(
            name: "GuitarFootControllerIOS",
            dependencies: ["GuitarFootShared"],
            path: "iOS",
            exclude: ["App/Info.plist"]
        ),
        
        // 3. macOS CoreMIDI Bridge App
        .executableTarget(
            name: "MacMIDIBridge",
            dependencies: ["GuitarFootShared"],
            path: "MacBridge",
            exclude: ["App/Info.plist"]
        ),
        
        // Tests
        .testTarget(
            name: "GuitarFootSharedTests",
            dependencies: ["GuitarFootShared"],
            path: "Tests/SharedTests"
        )
    ]
)
