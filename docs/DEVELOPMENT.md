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
```

## Run the Signaling Server

```bash
npm run signaling
```

## Quality Checks

```bash
npm run check
npm run build
npm test
```

The test suite includes unit tests for config, path handling, error output, and transfer protocol helpers, plus integration tests for the signaling relay, hash mismatch cleanup, interrupted receive cleanup, and a small WebRTC DataChannel file transfer.

## Debugging

The CLI hides raw stack traces during normal use. Enable debug output when investigating failures:

```bash
node dist/cli.js --debug config get unknown
A47_DEBUG=1 node dist/cli.js config get unknown
```

Use normal output in user-facing examples and debug output only for development or issue reports.

## Local MVP Validation

Terminal 1:

```bash
npm run signaling
```

Terminal 2:

```bash
node dist/cli.js receive --room test-room --output ./downloads --server ws://localhost:4747
```

Terminal 3:

```bash
node dist/cli.js send ./example.txt --room test-room --server ws://localhost:4747
```

## Packaging Plan

Binary packaging is planned as release automation. This environment does not generate the final cross-platform binaries.

Possible tools:

- `pkg`
- `nexe`
- Node SEA
- GitHub Releases
- GitHub Actions matrix builds

Future release assets:

```txt
a47-windows-x64.exe
a47-linux-x64
a47-macos-x64
a47-macos-arm64
install.sh
install.ps1
```

The exact binary generation command will be finalized after validating the MVP and choosing the packaging tool.

## Candidate Binary Commands

If using `pkg`, the future commands would be similar to:

```bash
pkg dist/cli.js --targets node20-win-x64 --output a47-windows-x64.exe
pkg dist/cli.js --targets node20-linux-x64 --output a47-linux-x64
pkg dist/cli.js --targets node20-macos-x64 --output a47-macos-x64
pkg dist/cli.js --targets node20-macos-arm64 --output a47-macos-arm64
```

Release automation should upload:

```txt
a47-windows-x64.exe
a47-linux-x64
a47-macos-x64
a47-macos-arm64
install.sh
install.ps1
```

Linux/macOS uninstall:

```bash
rm -f ~/.local/bin/a47
```

Windows uninstall:

```powershell
Remove-Item "$env:LOCALAPPDATA\A47\a47.exe"
```
