import XCTest
@testable import GuitarFootShared

final class SharedTests: XCTestCase {
    
    func testMIDIMessageNoteOn() {
        let note = MIDIMessage(type: .note, channel: 1, number: 39, value: 127, isNoteOn: true)
        let bytes = note.toRawMIDIBytes()
        
        XCTAssertEqual(bytes.count, 3)
        XCTAssertEqual(bytes[0], 0x90) // Note On Channel 1
        XCTAssertEqual(bytes[1], 39)   // Note 39
        XCTAssertEqual(bytes[2], 127)  // Velocity 127
        
        let decoded = MIDIMessage.fromRawMIDIBytes(bytes)
        XCTAssertNotNil(decoded)
        XCTAssertEqual(decoded?.type, .note)
        XCTAssertEqual(decoded?.channel, 1)
        XCTAssertEqual(decoded?.number, 39)
        XCTAssertEqual(decoded?.value, 127)
        XCTAssertEqual(decoded?.isNoteOn, true)
    }
    
    func testMIDIMessageCC() {
        let cc = MIDIMessage(type: .cc, channel: 2, number: 23, value: 64)
        let bytes = cc.toRawMIDIBytes()
        
        XCTAssertEqual(bytes.count, 3)
        XCTAssertEqual(bytes[0], 0xB1) // CC Channel 2
        XCTAssertEqual(bytes[1], 23)
        XCTAssertEqual(bytes[2], 64)
        
        let decoded = MIDIMessage.fromRawMIDIBytes(bytes)
        XCTAssertNotNil(decoded)
        XCTAssertEqual(decoded?.type, .cc)
        XCTAssertEqual(decoded?.channel, 2)
        XCTAssertEqual(decoded?.number, 23)
        XCTAssertEqual(decoded?.value, 64)
    }
    
    func testMIDIMessageProgramChange() {
        let pc = MIDIMessage(type: .programChange, channel: 1, number: 5)
        let bytes = pc.toRawMIDIBytes()
        
        XCTAssertEqual(bytes.count, 2)
        XCTAssertEqual(bytes[0], 0xC0) // Program Change Channel 1
        XCTAssertEqual(bytes[1], 5)
        
        let decoded = MIDIMessage.fromRawMIDIBytes(bytes)
        XCTAssertNotNil(decoded)
        XCTAssertEqual(decoded?.type, .programChange)
        XCTAssertEqual(decoded?.channel, 1)
        XCTAssertEqual(decoded?.number, 5)
    }
    
    func testNetworkPacketEncodingDecoding() {
        let midi = MIDIMessage(type: .cc, channel: 1, number: 28, value: 127)
        let switchEvent = SwitchEventPayload(
            switchIndex: 4,
            switchName: "DELAY",
            isPressed: true,
            isLongPress: false,
            isOn: true,
            midiMessage: midi
        )
        
        let packet = NetworkPacket(
            sequence: 42,
            type: .footswitchEvent,
            senderId: "TestPhone",
            midiMessage: midi,
            switchEvent: switchEvent
        )
        
        guard let encodedData = packet.encode() else {
            XCTFail("Failed to encode packet")
            return
        }
        
        guard let decodedPacket = NetworkPacket.decode(from: encodedData) else {
            XCTFail("Failed to decode packet")
            return
        }
        
        XCTAssertEqual(decodedPacket.sequence, 42)
        XCTAssertEqual(decodedPacket.type, .footswitchEvent)
        XCTAssertEqual(decodedPacket.switchEvent?.switchName, "DELAY")
        XCTAssertEqual(decodedPacket.switchEvent?.midiMessage.number, 28)
    }
}
