# CLI

The CLI command is `a47`.

## Direct Commands

```bash
a47 help
a47 version
a47 receive
a47 send ./file.zip --room my-room
a47 ./file.zip
a47 receive --manual
a47 send ./file.zip --manual
a47 signaling --port 4747
a47 signaling --host 0.0.0.0 --port 4747
a47 send ./file.zip --room my-room --server ws://localhost:4747
a47 receive --room my-room --output ./downloads --server ws://localhost:4747
a47 config get server
a47 config set server ws://localhost:4747
a47 config get ice-servers
a47 config set ice-servers stun:stun.l.google.com:19302,turn:turn.example.com:3478
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
a47 --debug send ./file.zip --room my-room
```

## Interactive Mode

Running `a47` without arguments opens a terminal-only interactive menu. The interface clears the terminal before rendering each page and includes:

- Send file
- Receive file
- Help
- Settings/configuration
- Exit

The receive flow immediately generates a room code and waits for a sender through distributed discovery, saving to the current directory by default. The send flow asks for a file path and the room code shown by the receiver. It does not ask normal users for IP addresses or signaling server URLs.

## File Launch Flow

When the executable is opened with a file path, such as by dragging a file onto `a47.exe`, A47 starts the send flow for that file and prompts only for the room code.

Examples:

```bash
a47 ./file.zip
a47 C:/Users/Ada/Downloads/file.zip
a47 /file.zip
```

If `/file.zip` does not exist as an absolute path, A47 also checks for `file.zip` relative to the current directory and the executable directory.

## Distributed Discovery

Default transfers use distributed room discovery:

```bash
a47 receive
a47 send ./file.zip --room A47-SK2S29
```

The receiver prints the room code. The sender enters that code. A47 uses the room to find the receiver and exchange WebRTC metadata, then sends the file through the DataChannel. Files do not pass through discovery peers.

## Signaling Server

The signaling server is optional. It helps peers find each other and exchange WebRTC negotiation metadata when users explicitly pass `--server`. Files do not pass through the signaling server.

Installed users can run a local signaling server directly from the CLI:

```bash
a47 signaling --port 4747
```

For two computers on the same network, run the server on one computer with:

```bash
a47 signaling --host 0.0.0.0 --port 4747
```

Then use that computer's network address from both sender and receiver:

```bash
a47 receive --room test-room --server ws://<server-ip>:4747
a47 send ./example.txt --room test-room --server ws://<server-ip>:4747
```

Do not use `localhost` for both peers when they are on different computers. `localhost` always means the current computer.

Room codes must be 4 to 64 characters and may only contain letters, numbers, dots, underscores, and hyphens. Typed room codes are normalized to uppercase. Automatically generated room codes use the `A47-XXXXXX` format.

If a command prints `Unable to connect to signaling server`, start `a47 signaling` first, confirm the URL points to the correct machine, and check whether a firewall is blocking the port. This applies to `--server` mode only.

## Manual Signaling

Manual signaling avoids the WebSocket signaling server entirely. Users copy and paste an offer code from the receiver into the sender, then copy and paste an answer code from the sender back into the receiver.

Receiver:

```bash
a47 receive --manual
```

Sender:

```bash
a47 send ./file.zip --manual
```

Manual signaling is useful when users want no signaling server at all. It still uses WebRTC DataChannels for file transfer. NAT traversal still depends on available ICE candidates, so restrictive networks may require TURN.

## Defaults

- Default discovery mode: distributed room discovery
- Default signaling server for `--server` mode: `ws://localhost:4747`
- Default output directory: current working directory
- Default chunk size: 256 KiB
- Default ICE servers: `stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302`

## Configuration

Persistent configuration is stored in the user's home directory at `.a47/config.json`.

Supported keys:

- `server`: default signaling server URL. Values must start with `ws://` or `wss://`.
- `chunk-size`: default transfer chunk size in bytes.
- `ice-servers`: comma-separated STUN, TURN, or TURNS URLs, or a JSON ICE server object/list with TURN credentials.

Examples:

```bash
a47 config get server
a47 config set server ws://localhost:4747
a47 config get chunk-size
a47 config set chunk-size 262144
a47 config get ice-servers
a47 config set ice-servers stun:stun.l.google.com:19302,turn:turn.example.com:3478
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

Command-line options such as `--server` override saved defaults for a single command.

## Debug Mode

Normal CLI errors are human-readable and do not print raw stack traces.

Use debug mode only when troubleshooting:

```bash
a47 --debug send ./file.zip --room my-room
A47_DEBUG=1 a47 receive --room my-room
```

The `--debug` option must be passed before the subcommand. The `A47_DEBUG=1` environment variable works with any command form.
