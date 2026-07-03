# A47 P2P Implementation Steps

## Current Phase

Phase 14 - User-ready installation and binary release preparation, with MVP transfer validation completed.

## Completed Tasks

- Created the initial project plan.
- Created required documentation files.
- Created the initial TypeScript project configuration.
- Created the initial package metadata with the `a47` CLI bin mapping.
- Installed project dependencies.
- Implemented the `commander` CLI foundation.
- Implemented the custom `a47 help` screen.
- Implemented `a47 version`.
- Implemented direct `send` and `receive` commands.
- Implemented terminal-only interactive mode with screen clearing.
- Implemented the WebSocket signaling server.
- Implemented signaling message types.
- Implemented a `werift` peer wrapper for sender and receiver flows.
- Implemented chunked DataChannel file transfer.
- Implemented SHA-256 integrity verification.
- Implemented safe output file naming to avoid overwrites.
- Added basic tests for transfer protocol and path utilities.
- Added installer script templates for future release assets.
- Validated small and larger local file transfers through the signaling server.

## Pending Tasks

- Add persistent `a47 config get` and `a47 config set` commands.
- Add automated tests for signaling and WebRTC transfer flows.
- Add debug mode for raw stack traces when needed.
- Add authentication or stronger room protection for signaling.
- Create GitHub Actions release workflow.
- Generate actual Windows, Linux, and macOS binary assets.

## Known Issues

- The project directory was empty and was not yet a Git repository at startup.
- `npm audit --omit=dev` reports 3 high-severity vulnerabilities from `ip` through `werift`/`werift-ice`; npm reports no fix available.
- Persistent configuration is documented but not implemented yet.
- Release binaries are documented but not generated in this environment.

## Next Actions

- Initialize Git and commit the completed MVP bootstrap if appropriate.
- Add signaling and transfer integration tests.
- Choose a binary packaging tool and add CI release automation.

## Decisions Already Made

- The package name is `a47-p2p`.
- The CLI command name is `a47`.
- The project uses Node.js, TypeScript, `commander`, `@inquirer/prompts`, `ws`, and `werift`.
- The default development signaling server URL is `ws://localhost:4747`.
- The signaling server must not receive, store, inspect, or proxy file contents.
- All project text, code comments, CLI messages, and documentation must be in English.
- Single-file transfer is supported first; folder transfer remains planned.
- DataChannel control messages are JSON strings and file chunks are binary messages.
- The default chunk size is 64 KiB.
- Future user release assets should use the names documented in README and `docs/DEVELOPMENT.md`.

## Files Changed in the Latest Step

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `.gitignore`
- `README.md`
- `steps.md`
- `install.sh`
- `install.ps1`
- `docs/ARCHITECTURE.md`
- `docs/CLI.md`
- `docs/SIGNALING.md`
- `docs/WEBRTC.md`
- `docs/TRANSFER_PROTOCOL.md`
- `docs/SECURITY.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`
- `src/cli.ts`
- `src/commands/help.ts`
- `src/commands/interactive.ts`
- `src/commands/receive.ts`
- `src/commands/send.ts`
- `src/commands/version.ts`
- `src/config/config.ts`
- `src/signaling/client.ts`
- `src/signaling/messages.ts`
- `src/signaling/server.ts`
- `src/transfer/chunks.ts`
- `src/transfer/hash.ts`
- `src/transfer/protocol.ts`
- `src/transfer/receiver.ts`
- `src/transfer/sender.ts`
- `src/ui/clear.ts`
- `src/ui/header.ts`
- `src/ui/menu.ts`
- `src/ui/messages.ts`
- `src/utils/errors.ts`
- `src/utils/logger.ts`
- `src/utils/paths.ts`
- `src/webrtc/data-channel.ts`
- `src/webrtc/peer.ts`
- `tests/paths.test.ts`
- `tests/protocol.test.ts`
