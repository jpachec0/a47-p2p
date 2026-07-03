# Security

A47 is designed so transferred files do not pass through the signaling server.

## Current Protections

- WebRTC DataChannels use encrypted transport.
- The signaling server only relays metadata needed for peer negotiation.
- SHA-256 hashes verify file integrity after transfer.
- The CLI avoids printing raw stack traces during normal errors.

## Current Limitations

- The MVP signaling server has no authentication.
- Room names should be treated as shared secrets only for convenience, not strong security.
- Additional application-level encryption is not implemented yet.
- `npm audit --omit=dev` reports a high-severity transitive vulnerability in `ip` through `werift`/`werift-ice`. npm currently reports no fix available, and `werift` is a required project dependency.

## Sensitive Data

Do not commit credentials, tokens, private keys, `.env` files, or personal sensitive data.
