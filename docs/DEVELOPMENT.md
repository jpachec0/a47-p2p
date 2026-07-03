# Development

## Requirements

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
npm run build
```

## Run the CLI

```bash
node dist/cli.js help
```

## Configuration

Use a temporary home directory when testing config commands without touching your real user configuration:

```bash
HOME=/tmp/a47-config-validation node dist/cli.js config set server ws://localhost:5757
HOME=/tmp/a47-config-validation node dist/cli.js config get server
HOME=/tmp/a47-config-validation node dist/cli.js config set ice-servers stun:stun.l.google.com:19302,turn:turn.example.com:3478
HOME=/tmp/a47-config-validation node dist/cli.js config get ice-servers
HOME=/tmp/a47-config-validation node dist/cli.js config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

## Run the Signaling Server

```bash
npm run signaling
```

The compiled CLI can also run the server:

```bash
node dist/cli.js signaling --port 4747
```

For LAN testing, bind all interfaces and use the host machine's network address from the peers:

```bash
node dist/cli.js signaling --host 0.0.0.0 --port 4747
```

## Quality Checks

```bash
npm run check
npm run build
npm test
```

The test suite includes unit tests for config, path handling, error output, room code validation, and transfer protocol helpers, plus integration tests for the signaling relay, room protection rules, hash mismatch cleanup, interrupted receive cleanup, interrupted sender handling, and a small WebRTC DataChannel file transfer.

Performance-sensitive transfer behavior is covered by code review and local smoke tests. When validating throughput, use large files, avoid measuring the initial SHA-256 preflight as network transfer time, and compare against the available WebRTC path. The application default is a 256 KiB chunk size with a larger DataChannel buffer window.

For cross-network validation, use a public `wss://` signaling URL and a configured ICE server list. STUN may work for many home networks, but reliable validation across restrictive networks requires TURN credentials.

Build the local signaling Docker image:

```bash
npm run docker:signaling
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for public signaling and TURN deployment notes.

## Debugging

The CLI hides raw stack traces during normal use. Enable debug output when investigating failures:

```bash
node dist/cli.js --debug config get unknown
A47_DEBUG=1 node dist/cli.js config get unknown
```

Use normal output in user-facing examples and debug output only for development or issue reports.

## Local MVP Validation

Manual signaling, no server:

Terminal 1:

```bash
node dist/cli.js receive --manual --output ./downloads
```

Terminal 2:

```bash
node dist/cli.js send ./example.txt --manual
```

Copy the `A47-OFFER-...` code from Terminal 1 into Terminal 2, then copy the `A47-ANSWER-...` code from Terminal 2 back into Terminal 1.

WebSocket signaling:

Terminal 1:

```bash
node dist/cli.js signaling --port 4747
```

Terminal 2:

```bash
node dist/cli.js receive --output ./downloads --server ws://localhost:4747
```

Terminal 3:

```bash
node dist/cli.js send ./example.txt --room <generated-room> --server ws://localhost:4747
```

## Packaging Plan

Binary packaging uses `@yao-pkg/pkg` through npm scripts and GitHub Actions.

Build all release assets locally:

```bash
npm run package:binaries
```

Run the full local release preparation path:

```bash
npm run release:prepare
```

Expected release assets:

```txt
a47-windows-x64.exe
a47-linux-x64
a47-macos-x64
a47-macos-arm64
install.sh
install.ps1
```

The GitHub Actions workflow in `.github/workflows/release.yml` runs checks, tests, binary packaging, Linux binary smoke validation, artifact upload, and GitHub Release publication for `v*` tags.

## Binary Commands

The package scripts generate binaries with these targets:

```bash
npm run package:windows
npm run package:linux
npm run package:macos:x64
npm run package:macos:arm64
```

Create an official GitHub release by pushing a version tag:

```bash
git tag v0.1.1
git push origin v0.1.1
```

Linux/macOS uninstall:

```bash
rm -f ~/.local/bin/a47
```

Windows uninstall:

```powershell
Remove-Item "$env:LOCALAPPDATA\A47\a47.exe"
```
