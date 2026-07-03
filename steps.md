# A47 P2P Implementation Steps

## Current Phase

Phase 14 - Patch release for user-run signaling server.

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
- Added signaling integration tests for relay behavior and two-peer room limits.
- Added a WebRTC transfer integration test using a real signaling server and DataChannel.
- Hardened `receiveFile` so it creates the output directory when needed.
- Added opt-in debug mode through `--debug` and `A47_DEBUG=1`.
- Added error utility tests for readable and debug error output.
- Added hash mismatch failure-path coverage that verifies failed receiver output cleanup.
- Removed stale known-issue text about the project directory being empty.
- Added receiver interruption handling through the peer close hook.
- Added interrupted receive failure-path coverage that verifies partial output cleanup.
- Added sender interruption handling while waiting for receiver transfer responses.
- Added sender-side interruption coverage.
- Added signaling room code validation and tests.
- Documented room code rules and signaling room protection.
- Added `@yao-pkg/pkg` binary packaging scripts for Windows, Linux, macOS x64, and macOS ARM64.
- Added a GitHub Actions release workflow for `v*` tags.
- Generated and locally validated the Linux release binary.
- Updated installer scripts to use the project GitHub Releases URL by default.
- Prepared the first release tag: `v0.1.0`.
- Pushed the `v0.1.0` tag to GitHub.
- Verified that the GitHub Actions release workflow completed successfully.
- Verified that all expected release assets are attached to the GitHub Release.
- Added the `a47 signaling` command so installed users can run the WebSocket signaling server without cloning the repository.
- Added `--host` and `--port` options for local and LAN signaling server usage.
- Improved the signaling connection error to explain how to start the server or use `ws://<server-ip>:4747`.
- Updated user and developer documentation for local, LAN, and connection-refused signaling scenarios.
- Bumped the package version to `0.1.1` for the patch release.
- Ran TypeScript checks, automated tests, build, and compiled CLI smoke validation for the `v0.1.1` patch.

## Pending Tasks

- Commit and push the signaling command fix to `develop`.
- Tag and publish `v0.1.1` release assets.

## Known Issues

- `npm audit --omit=dev` reports 3 high-severity vulnerabilities from `ip` through `werift`/`werift-ice`; npm reports no fix available.
- The published `v0.1.0` binaries do not expose a user-facing signaling server command; this is fixed on `develop` and will be released as `v0.1.1`.

## Next Actions

- Push the patch commit and publish the `v0.1.1` tag.
- Verify the GitHub Actions release assets.

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
- Raw stack traces are hidden by default and require `--debug` or `A47_DEBUG=1`.
- Receiver-side interrupted transfers remove partial output files.
- Sender-side interrupted transfers fail with a readable peer disconnected error.
- Room codes must be 4 to 64 characters and may only contain letters, numbers, dots, underscores, and hyphens.
- Release binaries are generated with `@yao-pkg/pkg`.
- Pushing a `v*` tag runs the GitHub Actions release workflow and publishes release assets.
- The first release tag is `v0.1.0`.
- The `v0.1.0` release assets are published at `https://github.com/jpachec0/a47-p2p/releases/tag/v0.1.0`.
- Installed users can run the signaling server with `a47 signaling --port 4747`.
- LAN users should run `a47 signaling --host 0.0.0.0 --port 4747` on one machine and use `ws://<server-ip>:4747` from both peers.
- The next patch release tag is `v0.1.1`.

## Files Changed in the Latest Step

- `steps.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/CLI.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`
- `docs/SIGNALING.md`
- `package.json`
- `package-lock.json`
- `src/cli.ts`
- `src/commands/help.ts`
- `src/commands/signaling.ts`
- `src/signaling/client.ts`
- `src/signaling/server.ts`
- `tests/signaling-command.test.ts`
