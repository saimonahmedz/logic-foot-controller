# 🎸 GuitarFootController (Wireless iOS Footswitch & Mac CoreMIDI Bridge)

A high-performance, low-latency wireless 8-button guitar MIDI foot controller for **iPhone / iPad** and **macOS**, built purely with native Swift, SwiftUI, Apple **Network.framework** (UDP + Bonjour), and **CoreMIDI**.

> **NO Xcode project files (`.xcodeproj` / `.xcworkspace`) are required.**  
> The system is 100% standalone and structured using standard **Swift Package Manager (SPM)**.

---

## 📐 Signal Chain Architecture

```
┌───────────────────────────────┐
│     iPhone / iPad App         │  (SwiftUI 8-Footswitch Landscape Stage Rig)
│   (Tap, Hold, Banks, Presets) │
└──────────────┬────────────────┘
               │  UDP Port 50001 (Zero-latency binary protocol)
               │  Bonjour: _guitarfoot._udp
               ▼
┌───────────────────────────────┐
│       Mac MIDI Bridge         │  (Lightweight macOS CoreMIDI Gateway)
│   (NWListener + Bonjour)      │
└──────────────┬────────────────┘
               │  Apple CoreMIDI (Virtual Source: "GuitarFoot Bridge")
               ▼
┌───────────────────────────────┐
│      Logic Pro / DAW          │  (Auto-discovers virtual MIDI source)
└──────────────┬────────────────┘
               │  MIDI Note / CC / PC Automation & Bypass
               ▼
┌───────────────────────────────┐
│   AmpliTube 5 / Guitar Rig    │  (Lead Boost, Delay Bypass, Presets, Mute)
│   Neural DSP / Helix Native   │
└───────────────────────────────┘
```

---

## 📂 Source Code Structure

```
GuitarFootController/
├── Package.swift                    # Swift Package Manager manifest (iOS & macOS targets)
├── build.sh                         # Non-Xcode build and packaging utility
├── README.md                        # Project documentation
├── LOGIC_PRO_AMPLITUBE_GUIDE.md     # Step-by-step DAW & plugin mapping manual
│
├── Shared/                          # Pure Swift protocol & CoreMIDI types
│   ├── NetworkConstants.swift       # Bonjour service name (_guitarfoot._udp), UDP port 50001
│   ├── MIDIMessage.swift            # Note ON/OFF, CC, PC byte-packing & validation (0-127)
│   └── Protocol.swift               # Lightweight NetworkPacket encoding & decoding
│
├── iOS/                             # iOS / iPadOS SwiftUI Application
│   ├── App/
│   │   ├── GuitarFootControllerApp.swift
│   │   └── Info.plist               # NSLocalNetworkUsageDescription & NSBonjourServices
│   ├── Models/
│   │   ├── FootswitchConfig.swift   # Switch settings (Tap, Hold, Momentary/Toggle, Colors)
│   │   ├── Bank.swift               # Multi-bank engine (LIVE, SONG 1, WORSHIP, ROCK, ACOUSTIC)
│   │   ├── Preset.swift             # Complete controller preset sets
│   │   └── AppSettings.swift        # Stage dark mode, haptics, port config
│   ├── Services/
│   │   ├── BonjourBrowser.swift     # NWBrowser discovery for Mac Bridge on Wi-Fi
│   │   ├── UDPClientService.swift   # High-speed NWConnection UDP client & latency meter
│   │   ├── PersistenceService.swift # Codable local file persistence (JSON)
│   │   └── HapticService.swift      # Stage tactile feedback triggers
│   ├── ViewModels/
│   │   ├── ControllerViewModel.swift# 8-switch state manager, hold timers, MIDI dispatcher
│   │   └── BankManagerViewModel.swift
│   ├── Views/
│   │   ├── MainControllerView.swift # 4x2 landscape performance layout
│   │   ├── FootswitchButtonView.swift # Metallic stomp actuator & active LED jewels
│   │   ├── TopStatusBar.swift       # Live connection state, RTT latency, MIDI monitor
│   │   └── BankSelectorBar.swift    # Fast bank switching
│   └── Settings/
│       ├── SettingsView.swift       # Connection, MIDI channels, Appearance
│       ├── SwitchConfigView.swift   # Per-button MIDI Note/CC/PC customization
│       ├── BankManagerView.swift    # Create, Duplicate, Delete, Rename banks
│       └── NetworkDiagnosticsView.swift
│
├── MacBridge/                       # macOS MIDI Bridge Application
│   ├── App/
│   │   ├── MacBridgeApp.swift
│   │   └── Info.plist
│   ├── Models/
│   │   └── BridgeState.swift
│   ├── Network/
│   │   ├── BonjourAdvertiser.swift  # NWListener publishing _guitarfoot._udp
│   │   └── UDPServerService.swift   # UDP receiver, telemetry & client manager
│   ├── MIDI/
│   │   └── CoreMIDIManager.swift    # Virtual CoreMIDI Source & Destination router
│   └── Views/
│       └── MacBridgeView.swift      # Mac status window, MIDI monitor & packet logs
│
└── Tests/
    └── SharedTests/
        └── SharedTests.swift        # CoreMIDI & UDP serialization test suite
```

---

## 🚀 How to Build and Run (Without Xcode)

### 1. Build and Run the Mac MIDI Bridge

Ensure your Mac has the Swift toolchain installed (included with Xcode Command Line Tools `xcode-select --install`).

```bash
cd GuitarFootController

# Build and run the macOS MIDI Bridge directly in one command:
./build.sh mac-run

# Or run standard Swift Package Manager command:
swift run MacMIDIBridge
```

### 2. Package into a standalone macOS Application

```bash
./build.sh mac-app
# Produces: dist/MacMIDIBridge.app
```

### 3. Run Unit Tests

```bash
./build.sh test
# Or:
swift test
```

### 4. Running the iOS App (Command-line / Swift Playgrounds / Swift Driver)

The iOS target is structured with pure SwiftUI and can be built via SPM or imported into any compatible Swift environment. Both `Info.plist` and entitlements are preconfigured for local network discovery.
