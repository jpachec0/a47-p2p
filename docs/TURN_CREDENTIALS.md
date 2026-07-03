# TURN Credentials

TURN relays are required when STUN cannot establish a direct WebRTC path through restrictive NAT or firewall setups.

## Goal

A47 must support cross-network transfers without committing long-lived TURN secrets to the repository or embedding them in release binaries.

## Supported Client Configuration

The CLI already accepts authenticated ICE server entries through JSON:

```bash
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

This is suitable for development, private deployments, and managed environments where the user or operator provides credentials.

## Production Strategy

For public releases, use short-lived TURN credentials generated outside the CLI binary.

Recommended approach:

- Deploy or choose a TURN provider that supports time-limited credentials.
- Keep the TURN shared secret only on trusted server infrastructure.
- Add a future credential endpoint on the public signaling infrastructure.
- Have the CLI request temporary TURN credentials before WebRTC negotiation.
- Return only short-lived ICE server entries to the CLI.
- Rotate credentials frequently and expire them quickly.

The credential endpoint must not receive, inspect, store, or proxy transferred files.

## Why Not Bundle Credentials

Do not hardcode TURN credentials in:

- Source code.
- Documentation examples.
- GitHub Actions secrets exposed into artifacts.
- Release binaries.
- Installer scripts.

Bundled credentials can be extracted and abused, which can create relay cost, availability, and abuse risks for the project.

## Future CLI Shape

The future user-ready flow should keep the visible commands simple:

```bash
a47 receive
a47 ./file.zip
```

The CLI should resolve signaling and temporary TURN credentials from defaults or a public bootstrap endpoint instead of asking normal users to understand ICE configuration.

## Open Implementation Tasks

- Define the public signaling URL for official releases.
- Choose a TURN provider or deploy coturn.
- Add a temporary TURN credential endpoint.
- Add a CLI bootstrap step that fetches temporary ICE servers.
- Add tests for credential response parsing and failure handling.
- Validate direct and TURN-relayed transfers across separate residential networks.
