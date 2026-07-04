# Roadmap

## Phase 1

Initialize the TypeScript project, source structure, documentation, and package metadata.

## Phase 2

Implement the direct CLI command structure with `commander`.

## Phase 3

Implement the terminal-only interactive menu.

## Phase 4

Implement the WebSocket signaling server.

## Phase 5

Implement the WebRTC peer layer with `werift`.

## Phase 6

Implement the chunked transfer protocol and SHA-256 verification.

## Phase 7

Implement the send command.

## Phase 8

Implement the receive command.

## Phase 9

Implement local configuration basics.

## Phase 10

Improve reliability and error handling.

## Phase 11

Complete README and project documentation.

## Phase 12

Document packaging for future binary releases.

## Phase 13

Validate the local end-to-end MVP.

## Phase 14

Prepare normal-user installation and binary release documentation.

## Current Status

Phases 1 through 14 have an MVP implementation path. Release tags `v0.1.0`, `v0.1.1`, and `v0.1.2` have been published with Windows, Linux, macOS, and installer assets through GitHub Actions.

The `v0.1.1` release exposes the signaling server through the installed `a47 signaling` command and documents how to use a reachable server URL instead of `localhost` when sender and receiver run on different computers.

The current development focus is higher transfer throughput and a normal-user flow:

- Distributed room discovery as the default no-IP, no-A47-server setup.
- Manual signaling for zero-server P2P setup.
- Receiver-generated room codes.
- File launch and drag-and-drop send flow for packaged executables.
- Receiver acceptance before writing file bytes.
- Larger chunks, larger DataChannel buffering, and throttled terminal progress output.
- Configurable ICE servers for STUN/TURN URL rollout.
- Authenticated TURN entries in local config.
- Docker-based public signaling deployment notes.
- Optional self-hosted signaling remains available for controlled environments.

## Release Status

The `v0.1.1` release includes:

- Installed `a47 signaling` command.
- Receiver-generated room codes.
- File launch and drag-and-drop send flow.
- Receiver accept/reject prompt.
- Transfer throughput improvements.
- Configurable STUN/TURN ICE servers.
- Public signaling Docker deployment notes.
- TURN credential distribution plan.

The `v0.1.2` release includes manual signaling so A47 can connect peers without any signaling server. The current `develop` branch adds distributed room discovery so users can share a short room code without typing IP addresses, running a WebSocket server, or depending on official A47 infrastructure.
