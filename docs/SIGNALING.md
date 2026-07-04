# Signaling

A47 supports three signaling modes:

- Distributed discovery: the default room-code flow. It uses a DHT-backed swarm to find the receiver and exchange WebRTC offer and answer metadata.
- Manual signaling: users copy and paste offer and answer codes. This uses no signaling server.
- WebSocket signaling: an optional lightweight WebSocket relay handles peer discovery and WebRTC negotiation for self-hosted or development usage.

The WebSocket signaling server is optional convenience infrastructure. It is not used by default `a47 send --room`, default `a47 receive`, or manual signaling.

## Distributed Discovery

Distributed discovery is the default normal-user flow.

Receiver:

```bash
a47 receive
```

Sender:

```bash
a47 send ./example.txt --room A47-SK2S29
```

A47 derives a 32-byte discovery topic from the normalized room code. Peers use that topic to find each other through `hyperswarm`, then exchange only WebRTC offer and answer metadata. After that exchange, discovery is closed and file transfer uses the WebRTC DataChannel.

Distributed discovery does not receive, store, inspect, or proxy files. It also does not require users to type an IP address or run an A47 public server. It depends on the public DHT and the users' networks allowing peer discovery traffic.

## Manual Signaling

Manual signaling is the zero-server option.

```bash
a47 receive --manual
a47 send ./example.txt --manual
```

The receiver prints an `A47-OFFER-...` code. The sender pastes it and prints an `A47-ANSWER-...` code. The receiver pastes the answer. After that, file transfer runs through the WebRTC DataChannel.

Manual signaling does not receive, store, inspect, or proxy files. It also does not send connection metadata through A47 infrastructure.

## WebSocket Signaling

The WebSocket signaling server is a lightweight optional relay for peer discovery and WebRTC negotiation. It is selected only when users pass `--server <url>`.

## Responsibilities

- Accept WebSocket connections.
- Allow clients to join a room.
- Relay signaling messages between peers in the same room.
- Notify peers when another peer joins or leaves.
- Reject rooms with more than two peers for the MVP.
- Reject weak or unsafe room codes.

## Non-Responsibilities

- It does not receive files.
- It does not store files.
- It does not inspect file contents.
- It does not proxy file downloads.

## Message Types

- `join`
- `joined`
- `peer-joined`
- `peer-left`
- `offer`
- `answer`
- `ice-candidate`
- `error`

Message payloads are JSON objects. The full TypeScript shape is defined in `src/signaling/messages.ts`.

## Room Code Rules

Room codes are normalized by trimming surrounding whitespace. The signaling server rejects room codes that do not meet these rules:

- 4 to 64 characters.
- Letters, numbers, dots, underscores, and hyphens only.
- No spaces or shell-sensitive symbols.

Room codes are still convenience shared secrets, not full authentication. Use unguessable room codes for real transfers.

The receiver can generate a user-friendly room code automatically. Generated codes use the `A47-XXXXXX` format.

## Running Locally

Installed CLI:

```bash
a47 signaling --port 4747
```

Installed CLI for LAN access:

```bash
a47 signaling --host 0.0.0.0 --port 4747
```

When peers run on different computers, both peers must use the address of the computer running the signaling server:

```bash
a47 receive --room test-room --server ws://<server-ip>:4747
a47 send ./example.txt --room test-room --server ws://<server-ip>:4747
```

`localhost` only works when the CLI command and the signaling server run on the same computer.

Development script:

```bash
npm run signaling
```

The default port is `4747`. It can be changed with:

```bash
A47_SIGNALING_PORT=5757 npm run signaling
```

The development server can bind a specific host with:

```bash
A47_SIGNALING_HOST=0.0.0.0 npm run signaling
```

Connection refused errors mean no signaling server is reachable at the configured URL, the wrong host was used, or the port is blocked.

For users who want room-code convenience across different networks, they can use any WebSocket signaling server URL that both peers can reach. The signaling server still only relays WebRTC metadata and never receives file contents.

The signaling URL and ICE server list are separate settings:

```bash
a47 config set server wss://signal.example.com
a47 config set ice-servers stun:stun.l.google.com:19302,turn:turn.example.com:3478
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

The signaling server solves discovery and room negotiation. STUN/TURN servers solve WebRTC NAT traversal.

See `docs/DEPLOYMENT.md` for the public signaling and TURN deployment plan.

## Test Coverage

The automated test suite starts the signaling server on an ephemeral port, verifies room joins, confirms signaling message relay between two peers, checks that a third peer is rejected from a two-peer MVP room, and verifies room code validation.
