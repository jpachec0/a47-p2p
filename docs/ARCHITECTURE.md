# Architecture

A47 P2P is a Node.js command-line application for direct peer-to-peer file transfer.

## Components

- CLI: parses direct commands and starts the interactive terminal interface.
- Interactive UI: provides a terminal-only menu for common actions.
- Signaling client: connects to a WebSocket signaling server and exchanges session metadata.
- Signaling server: relays room and WebRTC negotiation messages between two peers and can be started with `a47 signaling`.
- WebRTC peer layer: wraps `werift` so transfer code does not depend directly on low-level WebRTC details.
- Transfer layer: streams files into 256 KiB chunks, sends them over a DataChannel with backpressure, and verifies SHA-256 hashes.
- Configuration layer: stores and resolves defaults such as the signaling server URL.

## Current Implementation

- `src/cli.ts` defines the `a47` command and direct subcommands.
- `src/commands/interactive.ts` provides the terminal-only menu.
- `src/signaling/server.ts` runs the local WebSocket signaling server for development scripts and the installed `a47 signaling` command.
- `src/webrtc/peer.ts` wraps `werift` peer connection and DataChannel behavior.
- `src/transfer/sender.ts` and `src/transfer/receiver.ts` implement chunked transfer and hash verification.

## Data Flow

1. The receiver joins a room, generating an `A47-XXXXXX` code when no room is provided.
2. The signaling server relays WebRTC offer, answer, and ICE candidate messages.
3. Peers establish a WebRTC DataChannel.
4. File metadata is sent directly through the DataChannel.
5. The receiver accepts or rejects the incoming file.
6. File chunks are sent directly through the DataChannel.
7. The receiver verifies the final SHA-256 hash.

The signaling server is only used to exchange connection metadata. Files are transferred through WebRTC DataChannels and are not uploaded to the signaling server.
