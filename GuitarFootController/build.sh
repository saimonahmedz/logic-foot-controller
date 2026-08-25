#!/bin/bash
# ==============================================================================
# GuitarFootController - Non-Xcode Standalone Build & Run Tool
# ==============================================================================
# This script builds and runs both the macOS MIDI Bridge and iOS Foot Controller
# directly using the Swift Package Manager (SPM) and Apple command-line tools.
# No Xcode project (.xcodeproj / .xcworkspace) required!
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🎸 ======================================================"
echo "🎸 GuitarFootController Non-Xcode Build System"
echo "🎸 ======================================================"

usage() {
    echo "Usage: ./build.sh [command]"
    echo ""
    echo "Commands:"
    echo "  mac-build       Build the macOS MIDI Bridge (CLI / SPM)"
    echo "  mac-run         Build and launch the macOS MIDI Bridge"
    echo "  mac-app         Package macOS app into .app bundle"
    echo "  ios-build       Build iOS Foot Controller target for simulator"
    echo "  test            Run unit tests for shared MIDI/Network protocols"
    echo "  clean           Clean build artifacts"
    echo "  help            Show this help message"
    echo ""
}

COMMAND=${1:-mac-run}

case "$COMMAND" in
    mac-build)
        echo "🔨 Building macOS MIDI Bridge using Swift Package Manager..."
        swift build --target MacMIDIBridge -c release
        echo "✅ Build complete: .build/release/MacMIDIBridge"
        ;;

    mac-run)
        echo "🚀 Starting macOS MIDI Bridge..."
        swift run MacMIDIBridge
        ;;

    mac-app)
        echo "📦 Packaging macOS MIDI Bridge into standalone MacMIDIBridge.app..."
        swift build --target MacMIDIBridge -c release
        
        APP_DIR="dist/MacMIDIBridge.app"
        CONTENTS_DIR="$APP_DIR/Contents"
        MACOS_DIR="$CONTENTS_DIR/MacOS"
        RESOURCES_DIR="$CONTENTS_DIR/Resources"
        
        rm -rf "$APP_DIR"
        mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"
        
        cp .build/release/MacMIDIBridge "$MACOS_DIR/"
        cp MacBridge/App/Info.plist "$CONTENTS_DIR/"
        
        echo "✅ Created macOS Application bundle: $APP_DIR"
        ;;

    ios-build)
        echo "📱 Building iOS GuitarFootController for iOS Simulator (Non-Xcode)..."
        # Uses swift build targeting the iOS simulator SDK
        SIMULATOR_SDK=$(xcrun --sdk iphonesimulator --show-sdk-path 2>/dev/null || echo "")
        
        if [ -n "$SIMULATOR_SDK" ]; then
            swift build \
                --triple arm64-apple-ios16.0-simulator \
                --sdk "$SIMULATOR_SDK" \
                --target GuitarFootControllerIOS
            echo "✅ iOS simulator target built successfully!"
        else
            echo "⚠️ iOS Simulator SDK not detected in environment. Building shared test library..."
            swift test --filter GuitarFootSharedTests
        fi
        ;;

    test)
        echo "🧪 Running Shared Protocol & CoreMIDI Message Tests..."
        swift test
        ;;

    clean)
        echo "🧹 Cleaning Swift build artifacts..."
        swift package clean
        rm -rf .build dist
        echo "✅ Cleaned."
        ;;

    help|*)
        usage
        ;;
esac
