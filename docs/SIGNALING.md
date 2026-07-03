# Signaling

The signaling server is a lightweight WebSocket relay for peer discovery and WebRTC negotiation.

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

## Running Locally

```bash
npm run signaling
```

The default port is `4747`. It can be changed with:

```bash
A47_SIGNALING_PORT=5757 npm run signaling
```

## Test Coverage

The automated test suite starts the signaling server on an ephemeral port, verifies room joins, confirms signaling message relay between two peers, checks that a third peer is rejected from a two-peer MVP room, and verifies room code validation.
