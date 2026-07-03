# CLI

The CLI command is `a47`.

## Direct Commands

```bash
a47 help
a47 version
a47 send ./file.zip --room my-room
a47 receive --room my-room
a47 send ./file.zip --room my-room --server ws://localhost:4747
a47 receive --room my-room --output ./downloads
a47 config get server
a47 config set server ws://localhost:4747
a47 --debug send ./file.zip --room my-room
```

## Interactive Mode

Running `a47` without arguments opens a terminal-only interactive menu. The interface clears the terminal before rendering each page and includes:

- Send file
- Receive file
- Help
- Settings/configuration
- Exit

## Signaling Server

The signaling server helps peers find each other and exchange WebRTC negotiation metadata. Files do not pass through the signaling server.

## Defaults

- Default signaling server: `ws://localhost:4747`
- Default output directory: current working directory
- Default chunk size: 64 KiB

## Configuration

Persistent configuration is stored in the user's home directory at `.a47/config.json`.

Supported keys:

- `server`: default signaling server URL. Values must start with `ws://` or `wss://`.
- `chunk-size`: default transfer chunk size in bytes.

Examples:

```bash
a47 config get server
a47 config set server ws://localhost:4747
a47 config get chunk-size
a47 config set chunk-size 65536
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
