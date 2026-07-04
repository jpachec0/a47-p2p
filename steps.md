# A47 P2P Implementation Steps

## Current Phase

Phase 14 - Distributed room discovery and normal-user transfer flow.

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
- Started the next development focus after user testing showed poor LAN throughput and too much manual IP configuration.
- Increased the default chunk size from 64 KiB to 256 KiB.
- Increased the sender DataChannel buffer window and throttled terminal progress rendering to avoid artificial CLI-side transfer bottlenecks.
- Added receiver-generated room codes using the `A47-XXXXXX` format.
- Added a file launch flow so opening the executable with a file path, including drag-and-drop on packaged executables, starts the send flow.
- Added receiver-side accept/reject prompting after file metadata arrives and before bytes are written.
- Added default public STUN servers for WebRTC candidate discovery.
- Updated documentation for the new room, file launch, acceptance, throughput, STUN, and public signaling requirements.
- Validated the throughput and normal-user flow changes with TypeScript checks, automated tests, build, CLI help/version/error smoke tests, and a compiled signaling server smoke test.
- Committed and pushed the throughput and normal-user flow changes to `develop`.
- Added configurable ICE server support through `a47 config get ice-servers` and `a47 config set ice-servers`.
- Updated sender and receiver peer creation to use configured STUN/TURN URLs instead of only hardcoded defaults.
- Documented the separation between public signaling for discovery and ICE/STUN/TURN for NAT traversal.
- Validated configurable ICE server support with TypeScript checks, automated tests, build, config smoke tests, invalid ICE URL smoke tests, and help output checks.
- Committed and pushed configurable ICE server support to `develop`.
- Added authenticated TURN JSON support to the `ice-servers` config value.
- Added a Dockerfile and npm script for deploying the signaling server container.
- Added `docs/DEPLOYMENT.md` with public signaling and TURN deployment requirements.
- Validated authenticated TURN config and signaling deployment assets with TypeScript checks, automated tests, build, CLI config smoke tests, invalid JSON smoke tests, help output checks, and Docker image build.
- Committed and pushed authenticated TURN config and signaling deployment documentation to `develop`.
- Added `docs/TURN_CREDENTIALS.md` with the short-lived TURN credential distribution strategy.
- Re-evaluated the next release version and selected `v0.1.1` for the user-flow, throughput, signaling command, configurable ICE, and deployment-preparation work.
- Validated the final documentation and release state with TypeScript checks, automated tests, and build.
- Committed and pushed the TURN credential strategy to `develop`.
- Tagged and published `v0.1.1`.
- Verified that the GitHub Actions release workflow completed successfully for `v0.1.1`.
- Verified that all expected `v0.1.1` release assets are attached to the GitHub Release.
- Added zero-server manual signaling with copy-paste `A47-OFFER-...` and `A47-ANSWER-...` codes.
- Added `a47 receive --manual` and `a47 send <path> --manual`.
- Added manual signaling unit coverage and manual WebRTC transfer integration coverage.
- Updated documentation to make the WebSocket signaling server optional rather than required infrastructure.
- Bumped the package version to `0.1.2` for the manual signaling patch release.
- Validated manual signaling with TypeScript checks, the full automated test suite, build, CLI help smoke checks, and a missing-file manual send smoke check.
- Committed and pushed zero-server manual signaling to `develop`.
- Tagged and published `v0.1.2`.
- Verified that the GitHub Actions release workflow completed successfully for `v0.1.2`.
- Verified that all expected `v0.1.2` release assets are attached to the GitHub Release.
- Added `hyperswarm` distributed discovery for room-code peer lookup without A47-hosted infrastructure.
- Added a DHT-backed distributed signaling layer that exchanges only WebRTC offer and answer metadata.
- Made distributed room discovery the default for `a47 receive` and `a47 send <path> --room <room>` when `--server` is not used.
- Kept WebSocket signaling available as an explicit advanced/self-hosted mode through `--server`.
- Kept manual offer/answer signaling available as the zero-discovery fallback through `--manual`.
- Simplified the file launch and interactive send flows so normal users enter only the room code, not a signaling server URL.
- Simplified the interactive receive flow so choosing Receive file immediately generates a room code and waits for the sender.
- Added deterministic tests for distributed discovery topic generation and JSON-line metadata parsing.
- Bumped the package version to `0.1.3` for the distributed discovery release candidate.
- Updated README and documentation for distributed discovery, the no-IP normal-user flow, optional WebSocket signaling, and remaining NAT/TURN limitations.
- Validated TypeScript checks, automated tests, build, compiled CLI smoke tests, Windows/Linux/macOS binary packaging, and a short Linux binary distributed receive startup smoke test.
- Committed and pushed distributed room discovery to `develop`.
- Tagged and published `v0.1.3`.
- Verified that the GitHub Actions release workflow completed successfully for `v0.1.3`.
- Verified that all expected `v0.1.3` release assets are attached to the GitHub Release.
- Fixed a transfer-start race where the sender could send file metadata before the receiver registered its DataChannel message handler.
- Updated the sender to wait for `receiver-ready` before sending `file-meta`.
- Added readable sender-side timeouts while waiting for receiver control messages.
- Added regression coverage for sender metadata waiting on receiver readiness.
- Updated transfer protocol and WebRTC documentation for the receiver readiness handshake.
- Bumped the package version to `0.1.4` for the transfer-start race patch.
- Validated the patch with TypeScript checks, automated tests, build, full binary packaging, CLI version smoke tests, and a short Linux binary distributed receive startup smoke test.
- Committed and pushed the receiver readiness race fix to `develop`.
- Tagged and published `v0.1.4`.
- Verified that the GitHub Actions release workflow completed successfully for `v0.1.4`.
- Verified that all expected `v0.1.4` release assets are attached to the GitHub Release.
- Fixed a receiver finalization race where a peer close after all bytes arrived could still be reported as an interrupted transfer.
- Added received-size validation before SHA-256 finalization.
- Added regression coverage for keeping a verified file when the peer closes during final receiver cleanup.
- Updated transfer protocol and WebRTC documentation for finalization close handling.
- Bumped the package version to `0.1.5` for the receiver finalization patch.
- Validated the finalization patch with TypeScript checks, automated tests, build, full binary packaging, CLI version smoke tests, and a short Linux binary distributed receive startup smoke test.

## Pending Tasks

- Validate distributed discovery between two real machines on the same LAN.
- Validate distributed discovery between two real machines on different residential networks.
- Run a real large-file benchmark with the default distributed discovery flow.
- Improve user-facing troubleshooting for DHT discovery timeouts after real-world testing.
- Publish `v0.1.5` for receiver finalization close handling.

## Known Issues

- `npm audit --omit=dev` reports 3 high-severity vulnerabilities from `ip` through `werift`/`werift-ice`; npm reports no fix available.
- Distributed discovery depends on public DHT reachability from both users' networks.
- Manual signaling is still available as a fallback, but it requires copy-paste offer and answer codes.
- Some restrictive NAT/firewall combinations require TURN relay support; STUN alone is not guaranteed.
- Binary packaging may need additional validation because `hyperswarm` brings native networking dependencies.

## Next Actions

- Test `v0.1.4` on two real machines with the normal receive/send room flow.
- Benchmark a larger file through the `v0.1.4` distributed discovery flow.
- Validate the receiver readiness and receiver finalization fixes with the packaged CLI on two machines.

## Decisions Already Made

- The package name is `a47-p2p`.
- The CLI command name is `a47`.
- The project uses Node.js, TypeScript, `commander`, `@inquirer/prompts`, `ws`, and `werift`.
- The default development signaling server URL is `ws://localhost:4747`.
- The signaling server must not receive, store, inspect, or proxy file contents.
- All project text, code comments, CLI messages, and documentation must be in English.
- Single-file transfer is supported first; folder transfer remains planned.
- DataChannel control messages are JSON strings and file chunks are binary messages.
- The default chunk size is 256 KiB.
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
- The `v0.1.1` release assets are published at `https://github.com/jpachec0/a47-p2p/releases/tag/v0.1.1`.
- The `v0.1.2` release assets are published at `https://github.com/jpachec0/a47-p2p/releases/tag/v0.1.2`.
- The `v0.1.3` release assets are published at `https://github.com/jpachec0/a47-p2p/releases/tag/v0.1.3`.
- The `v0.1.4` release assets are published at `https://github.com/jpachec0/a47-p2p/releases/tag/v0.1.4`.
- Installed users can run the signaling server with `a47 signaling --port 4747`.
- LAN users should run `a47 signaling --host 0.0.0.0 --port 4747` on one machine and use `ws://<server-ip>:4747` from both peers.
- Users can avoid the signaling server entirely with `a47 receive --manual` and `a47 send <path> --manual`.
- Default `a47 receive` and `a47 send <path> --room <room>` use distributed room discovery unless `--server` or `--manual` is provided.
- Receiver commands may omit `--room`; A47 generates a room code in the `A47-XXXXXX` format.
- Typed room codes are normalized to uppercase.
- Opening the CLI with a file path starts the send flow for that file.
- The default chunk size is 256 KiB.
- Public STUN servers are enabled by default, but TURN relay support is still needed for reliable cross-network connectivity.
- ICE server URLs are configurable through the `ice-servers` config key.
- Authenticated TURN entries use JSON ICE server objects and must not be committed with real credentials.
- Public release TURN credentials should be short-lived and fetched from trusted infrastructure, not bundled into the CLI or installers.
- The latest release version is `v0.1.4`.
- The current development version is `0.1.5`.

## Files Changed in the Latest Step

- `steps.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/CLI.md`
- `docs/DEPLOYMENT.md`
- `docs/DEVELOPMENT.md`
- `docs/ROADMAP.md`
- `docs/SECURITY.md`
- `docs/SIGNALING.md`
- `docs/WEBRTC.md`
- `docs/TRANSFER_PROTOCOL.md`
- `package.json`
- `package-lock.json`
- `src/commands/help.ts`
- `src/commands/interactive.ts`
- `src/commands/launch-file.ts`
- `src/commands/receive.ts`
- `src/commands/send.ts`
- `src/discovery/distributed-signaling.ts`
- `src/transfer/sender.ts`
- `src/transfer/receiver.ts`
- `src/types/hyperswarm.d.ts`
- `tests/distributed-signaling.test.ts`
- `tests/transfer-failure.test.ts`
