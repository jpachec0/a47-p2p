# WebRTC

A47 uses `werift` to create WebRTC peer connections from Node.js.

## Sender Flow

1. Find the receiver through distributed discovery or connect to an explicit signaling server.
2. Join a room.
3. Create a peer connection.
4. Create a DataChannel.
5. Create an offer.
6. Send the offer through distributed discovery or signaling.
7. Receive the answer through distributed discovery or signaling.
8. Wait for the DataChannel to open.
9. Wait for the receiver's `receiver-ready` protocol message.
10. Send file transfer protocol messages.

## Receiver Flow

1. Start distributed discovery or connect to an explicit signaling server.
2. Join a room.
3. Create a peer connection.
4. Receive an offer through signaling.
5. Set the remote offer.
6. Create and send an answer.
7. Wait for the sender DataChannel.
8. Register the transfer message handler.
9. Send `receiver-ready`.
10. Receive file transfer protocol messages.

The transfer layer should use a small wrapper API instead of depending directly on `werift` internals.

## Distributed Discovery Flow

Distributed discovery automates the offer and answer exchange while keeping files out of any server or proxy.

1. The receiver runs `a47 receive`.
2. A47 generates a room code such as `A47-SK2S29`.
3. A47 derives a DHT topic from the normalized room code.
4. The sender runs `a47 send <path> --room A47-SK2S29` or drags a file onto the executable and enters the room code.
5. Receiver and sender connect through `hyperswarm` and exchange WebRTC offer and answer metadata.
6. A47 closes discovery after negotiation metadata is exchanged.
7. Peers establish the DataChannel directly when ICE connectivity succeeds.
8. File transfer uses the same chunked transfer protocol as every other signaling mode.

Distributed discovery removes IP entry and avoids A47-hosted public signaling infrastructure. It still depends on DHT reachability and WebRTC ICE connectivity.

## Manual Signaling Flow

Manual signaling removes the WebSocket signaling server from connection setup.

1. The receiver runs `a47 receive --manual`.
2. The receiver creates a WebRTC peer connection and DataChannel.
3. The receiver creates an offer, gathers ICE candidates, and prints an `A47-OFFER-...` code.
4. The sender runs `a47 send <path> --manual`.
5. The sender pastes the receiver offer code.
6. The sender creates an answer, gathers ICE candidates, and prints an `A47-ANSWER-...` code.
7. The receiver pastes the sender answer code.
8. Peers establish the DataChannel directly when ICE connectivity succeeds.
9. File transfer uses the same chunked transfer protocol as WebSocket signaling mode.

Manual signaling is fully serverless, but it requires users to copy and paste codes. It can still fail on restrictive networks unless the configured ICE servers provide a usable path.

## NAT Traversal

A47 configures public STUN servers by default so peers can discover usable WebRTC candidates outside a single LAN in many home-network cases.

The default ICE server list is configurable:

```bash
a47 config get ice-servers
a47 config set ice-servers stun:stun.l.google.com:19302,turn:turn.example.com:3478
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

STUN does not guarantee connectivity for every NAT or firewall. Restrictive networks may require a TURN relay. The CLI accepts authenticated TURN entries as JSON, but release-ready public usage still needs a safe credential distribution strategy.

## Current Wrapper API

The current wrapper exposes:

```ts
createSenderPeer(options)
createReceiverPeer(options)
createDistributedSenderPeer(room, iceServers)
createDistributedReceiverPeer(room, iceServers)
createManualReceiverOffer(options)
createManualSenderAnswer(options)
peer.onData(callback)
peer.onClose(callback)
peer.send(payload)
peer.waitUntilOpen()
peer.close()
```

The wrapper relays ICE candidates through the signaling client and keeps `werift` internals isolated from command and transfer modules. The transfer receiver uses `peer.onClose(callback)` to detect interrupted transfers and clean up partial output files.
