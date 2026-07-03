# A47 P2P

A47 P2P is a command-line peer-to-peer file transfer tool using WebRTC DataChannels.

This project is in an early MVP stage. It provides a cross-platform CLI named `a47` for direct file transfer between computers, using a lightweight WebSocket signaling server only for peer discovery and WebRTC negotiation.

The signaling server is only used to exchange connection metadata. Files are transferred through WebRTC DataChannels and are not uploaded to the signaling server.

## Development

Install dependencies:

```bash
npm install
```

Build the CLI:

```bash
npm run build
```

Run the compiled CLI:

```bash
node dist/cli.js help
```

Run the local signaling server:

```bash
npm run signaling
```

Run the signaling server through the compiled CLI:

```bash
node dist/cli.js signaling --port 4747
```

Run checks:

```bash
npm run check
npm test
```

Build release binaries:

```bash
npm run package:binaries
```

## CLI Examples

```bash
a47
a47 help
a47 version
a47 signaling --port 4747
a47 signaling --host 0.0.0.0 --port 4747
a47 receive
a47 receive --manual
a47 send ./file.zip --room my-room
a47 send ./file.zip --manual
a47 receive --room my-room
a47 ./file.zip
a47 send ./file.zip --room my-room --server ws://localhost:4747
a47 receive --room my-room --output ./downloads
a47 config get server
a47 config set server ws://localhost:4747
a47 config get ice-servers
a47 config set ice-servers stun:stun.l.google.com:19302,turn:turn.example.com:3478
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
a47 --debug send ./file.zip --room my-room
```

For a local three-terminal test, start the signaling server first:

```bash
a47 signaling --port 4747
```

Then run the receiver and sender with the same room:

```bash
a47 receive --room test-room --server ws://localhost:4747
a47 send ./example.txt --room test-room --server ws://localhost:4747
```

For the user-oriented receive flow, the receiver can generate the room code automatically:

```bash
a47 receive
```

The receiver prints a code such as `A47-SK2S29`. The sender can drag a file onto the executable or pass the file path directly:

```bash
a47 ./example.txt
```

The sender is prompted for the room code, and the receiver is prompted to accept or reject the incoming file.

For two different computers, `localhost` points to each individual computer. Start the server on one machine with:

```bash
a47 signaling --host 0.0.0.0 --port 4747
```

Then use that machine's network address from both peers:

```bash
a47 receive --room test-room --server ws://<server-ip>:4747
a47 send ./example.txt --room test-room --server ws://<server-ip>:4747
```

If you see `Unable to connect to signaling server` or `connection refused`, the signaling server is not running at that URL, the wrong host was used, or a firewall is blocking the port.

For zero-server transfers, use manual signaling:

```bash
a47 receive --manual
a47 send ./example.txt --manual
```

Manual signaling uses copy-paste offer and answer codes instead of a WebSocket signaling server. Files still transfer directly over WebRTC DataChannels. STUN may connect peers across some networks, while restrictive networks can still require TURN.

The WebSocket signaling server is optional for convenience, local testing, LAN/self-hosted usage, or future discovery modes. It is not required by the manual signaling flow.

## Architecture Summary

A47 uses a Node.js CLI, optional signaling modes, and WebRTC DataChannels through `werift`.

In WebSocket signaling mode, the sender and receiver join the same signaling room. In manual signaling mode, users copy and paste offer and answer codes. Once WebRTC connects, file metadata, file chunks, completion messages, and hash verification messages move directly over the DataChannel.

## Security Notes

Files do not pass through the signaling server. WebRTC provides encrypted transport for the DataChannel. A47 also calculates SHA-256 hashes to verify file integrity after transfer.

Normal errors are printed without raw stack traces. Use `--debug` or `A47_DEBUG=1` only when troubleshooting.

## Limitations

- Single-file transfer is the initial target.
- Folder transfer is planned for a future version.
- The signaling server is intentionally simple and does not provide authentication yet.
- Configuration currently supports `server`, `chunk-size`, and `ice-servers`.
- The default transfer chunk size is 256 KiB. Throughput is intended to be limited by the users' network and WebRTC path, not by artificial CLI throttling.
- Release binaries are generated with `@yao-pkg/pkg` and published by the GitHub Actions release workflow when a `v*` tag is pushed.
- `npm audit --omit=dev` currently reports a high-severity transitive vulnerability in `ip` through `werift`/`werift-ice`; npm reports no fix available.

## Roadmap

- Cut the first tagged release.
- Expand production hardening around signaling authentication.
- Add more transfer failure and platform smoke tests.

## Install for Users

Current published release: `v0.1.1`.

The `develop` branch is preparing `v0.1.2` with zero-server manual signaling. User-ready binary releases are built by GitHub Actions when a version tag such as `v0.1.2` is pushed.

Expected release assets:

```txt
a47-windows-x64.exe
a47-linux-x64
a47-macos-x64
a47-macos-arm64
install.sh
install.ps1
```

Linux/macOS users can install a published release with:

```bash
curl -fsSL https://github.com/jpachec0/a47-p2p/releases/latest/download/install.sh | sh
```

Windows users can install a published release with:

```powershell
iwr https://github.com/jpachec0/a47-p2p/releases/latest/download/install.ps1 -OutFile install.ps1
.\install.ps1
```

Uninstall by deleting the installed `a47` or `a47.exe` file from the chosen install directory.

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for the packaging plan.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for public signaling and TURN deployment notes.

See [docs/TURN_CREDENTIALS.md](docs/TURN_CREDENTIALS.md) for the planned short-lived TURN credential strategy.
