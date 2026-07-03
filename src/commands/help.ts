export function getHelpText(): string {
  return `A47 P2P

A47 P2P is a command-line peer-to-peer file transfer tool using WebRTC DataChannels.

Usage:
  a47
  a47 help
  a47 version
  a47 send <path> --room <room> [--server <url>]
  a47 receive [--room <room>] [--output <dir>] [--server <url>]
  a47 <file-path>
  a47 signaling [--host <host>] [--port <port>]
  a47 config get <key>
  a47 config set <key> <value>
  a47 --debug send <path> --room <room>

Direct commands:
  a47 help
      Show this help screen.

  a47 version
      Show the current package version.

  a47 send <path> --room <room> --server ws://localhost:4747
      Send one file to a peer in the same room.

  a47 receive --room <room> --output ./downloads --server ws://localhost:4747
      Receive one file from a peer in the same room.

  a47 receive
      Generate a room code automatically and wait for a sender.

  a47 ./file.zip
      Start the send flow for a file path or a file dragged onto the executable.

  a47 signaling --port 4747
      Run a local signaling server for peer discovery and WebRTC negotiation.

  a47 signaling --host 0.0.0.0 --port 4747
      Run a signaling server reachable by other computers on your network.

  a47 config get server
      Show the default signaling server URL.

  a47 config set server ws://localhost:4747
      Save the default signaling server URL.

Interactive mode:
  Run a47 without arguments to open a simple terminal menu.
  The receive flow generates a room code automatically.

Signaling server:
  The signaling server is only used to exchange connection metadata for peer discovery
  and WebRTC negotiation. Files do not pass through the signaling server.
  Run a47 signaling before using local ws://localhost:4747 transfers.
  For different computers, run the server on one machine and use ws://<server-ip>:4747.

Configuration:
  Supported keys: server, chunk-size, ice-servers.

Debugging:
  Use --debug or A47_DEBUG=1 to print raw stack traces for troubleshooting.
`;
}

export function showHelp(): void {
  console.log(getHelpText());
}
