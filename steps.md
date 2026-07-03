# A47 P2P Implementation Steps

## Current Phase

Phase 10 - Reliability, automated coverage, and release hardening after persistent configuration.

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
- Connected the local repository to `https://github.com/jpachec0/a47-p2p.git`.
- Rebased local work onto `origin/develop` and resolved the initial README conflict.
- Implemented persistent `a47 config get` and `a47 config set` commands.
- Updated send, receive, and interactive flows to use saved config defaults.
- Added config tests.

## Pending Tasks

- Add automated tests for signaling and WebRTC transfer flows.
- Add debug mode for raw stack traces when needed.
- Add authentication or stronger room protection for signaling.
- Create GitHub Actions release workflow.
- Generate actual Windows, Linux, and macOS binary assets.

## Known Issues

- The project directory was empty and was not yet a Git repository at startup.
- `npm audit --omit=dev` reports 3 high-severity vulnerabilities from `ip` through `werift`/`werift-ice`; npm reports no fix available.
- Release binaries are documented but not generated in this environment.

## Next Actions

- Add signaling and transfer integration tests.
- Add debug mode for raw stack traces when needed.
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
- Persistent configuration is stored at `.a47/config.json` under the user's home directory.
- The `--server` command option overrides the saved default server for that single command.

## Files Changed in the Latest Step

- `README.md`
- `steps.md`
- `docs/CLI.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`
- `src/cli.ts`
- `src/commands/config.ts`
- `src/commands/help.ts`
- `src/commands/interactive.ts`
- `src/commands/receive.ts`
- `src/commands/send.ts`
- `src/config/config.ts`
- `tests/config.test.ts`
