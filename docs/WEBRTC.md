# WebRTC

A47 uses `werift` to create WebRTC peer connections from Node.js.

## Sender Flow

1. Connect to the signaling server.
2. Join a room.
3. Create a peer connection.
4. Create a DataChannel.
5. Create an offer.
6. Send the offer through signaling.
7. Receive the answer through signaling.
8. Wait for the DataChannel to open.
9. Send file transfer protocol messages.

## Receiver Flow

1. Connect to the signaling server.
2. Join a room.
3. Create a peer connection.
4. Receive an offer through signaling.
5. Set the remote offer.
6. Create and send an answer.
7. Wait for the sender DataChannel.
8. Receive file transfer protocol messages.

The transfer layer should use a small wrapper API instead of depending directly on `werift` internals.

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
peer.onData(callback)
peer.onClose(callback)
peer.send(payload)
peer.waitUntilOpen()
peer.close()
```

The wrapper relays ICE candidates through the signaling client and keeps `werift` internals isolated from command and transfer modules. The transfer receiver uses `peer.onClose(callback)` to detect interrupted transfers and clean up partial output files.
