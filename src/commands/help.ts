export function getHelpText(): string {
  return `A47 P2P

A47 P2P is a command-line peer-to-peer file transfer tool using WebRTC DataChannels.

Usage:
  a47
  a47 help
  a47 version
  a47 send <path> --room <room> [--server <url>]
  a47 receive --room <room> [--output <dir>] [--server <url>]
  a47 config get <key>
  a47 config set <key> <value>

Direct commands:
  a47 help
      Show this help screen.

  a47 version
      Show the current package version.

  a47 send <path> --room <room> --server ws://localhost:4747
      Send one file to a peer in the same room.

  a47 receive --room <room> --output ./downloads --server ws://localhost:4747
      Receive one file from a peer in the same room.

  a47 config get server
      Show the default signaling server URL.

  a47 config set server ws://localhost:4747
      Save the default signaling server URL.

Interactive mode:
  Run a47 without arguments to open a simple terminal menu.

Signaling server:
  The signaling server is only used to exchange connection metadata for peer discovery
  and WebRTC negotiation. Files do not pass through the signaling server.

Configuration:
  Supported keys: server, chunk-size.
`;
}

export function showHelp(): void {
  console.log(getHelpText());
}
