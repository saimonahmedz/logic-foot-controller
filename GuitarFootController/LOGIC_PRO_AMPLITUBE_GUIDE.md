# 🔌 Logic Pro & AmpliTube 5 MIDI Setup Guide

This guide walks you through connecting your wireless iOS foot controller to **Logic Pro** and **AmpliTube 5** (or Guitar Rig, Neural DSP, Helix Native).

---

## 1. Start the Mac MIDI Bridge
1. Run `./build.sh mac-run` on your Mac.
2. The Mac Bridge automatically registers a virtual CoreMIDI source named **`GuitarFoot Bridge`**.
3. It starts broadcasting Bonjour service `_guitarfoot._udp` on UDP port `50001`.

---

## 2. Connect your iPhone / iPad
1. Connect your iPhone to the **same local Wi-Fi** network as your Mac.
2. Launch the **GuitarFootController** iOS app.
3. The app automatically detects your Mac via Bonjour and displays **`CONNECTED`** with green status and live round-trip latency (< 2 ms).

---

## 3. Configure Logic Pro
1. Open **Logic Pro**.
2. Go to **Logic Pro** > **Settings** (or Preferences) > **MIDI** > **Inputs**.
3. Verify that **`GuitarFoot Bridge`** is enabled with a checkmark.
4. Create an Audio Track with your guitar input and insert **AmpliTube 5** (or your preferred guitar amp plugin).

---

## 4. Map Footswitches in AmpliTube 5
AmpliTube 5 supports both **MIDI Learn** and direct **MIDI Control Table**:

### Method A: MIDI Learn (Fastest)
1. In AmpliTube 5, right-click on any Stompbox switch (e.g. Overdrive, Delay Bypass, Solo Boost).
2. Click **MIDI Learn**.
3. Tap the corresponding footswitch on your iPhone (e.g., Switch 4 "SOLO").
4. AmpliTube will instantly map the MIDI Note/CC to that parameter!

### Method B: Program Change (Preset Switching)
1. In AmpliTube 5, open the **Preset / MIDI Settings** dialog (bottom right gear icon).
2. Select the **Control** > **Program Change** tab.
3. Map PC #1 to "Clean Tone", PC #2 to "Crunch Tone", PC #3 to "Rhythm Tone", PC #4 to "Lead Tone".
4. Stepping on the top row switches on your iPhone will immediately switch presets with zero lag!

---

## 5. Supported MIDI Commands

| Default Switch | Default Name | Mode | Tap MIDI Action | Long Press MIDI Action |
|---|---|---|---|---|
| **Switch 1** | CLEAN | Toggle | Program Change #01 | CC #10 (Drive Off) |
| **Switch 2** | CRUNCH | Toggle | Program Change #02 | CC #11 |
| **Switch 3** | RHYTHM | Toggle | Program Change #03 | CC #12 |
| **Switch 4** | SOLO | Toggle | MIDI Note #39 (Vel 127) | CC #23 (Lead Mode) |
| **Switch 5** | DELAY | Toggle | CC #28 (Val 127/0) | CC #64 (Tap Tempo) |
| **Switch 6** | REVERB | Toggle | CC #29 (Val 127/0) | CC #65 |
| **Switch 7** | BOOST | Momentary | CC #30 (Val 127/0) | CC #31 |
| **Switch 8** | MUTE | Toggle | CC #07 (Val 0/127) | CC #84 (Tuner On) |
