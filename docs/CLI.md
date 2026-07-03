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

Persistent `a47 config get` and `a47 config set` commands are planned but are not implemented yet.
