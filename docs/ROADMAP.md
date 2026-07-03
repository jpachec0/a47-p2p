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

Phases 1 through 14 have an MVP implementation path. The first release tag, `v0.1.0`, has been published with Windows, Linux, macOS, and installer assets through GitHub Actions.

The next patch release is `v0.1.1`. It exposes the signaling server through the installed `a47 signaling` command and documents how to use a reachable server URL instead of `localhost` when sender and receiver run on different computers.
