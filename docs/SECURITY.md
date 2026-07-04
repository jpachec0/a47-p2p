# Security

A47 is designed so transferred files do not pass through distributed discovery peers or the signaling server.

## Current Protections

- WebRTC DataChannels use encrypted transport.
- Default distributed discovery exchanges only WebRTC connection metadata.
- The signaling server only relays metadata needed for peer negotiation.
- The signaling server rejects weak or unsafe room codes.
- SHA-256 hashes verify file integrity after transfer.
- The CLI avoids printing raw stack traces during normal errors.
- Raw stack traces require `--debug` or `A47_DEBUG=1`.

## Current Limitations

- The MVP signaling server has no authentication.
- Distributed discovery room codes are convenience join secrets, not full authentication.
- Public DHT discovery depends on external network availability.
- Room names should be treated as shared secrets only for convenience, not strong security.
- Additional application-level encryption is not implemented yet.
- Public TURN relay usage needs a short-lived credential distribution service before it is user-ready.
- `npm audit --omit=dev` reports a high-severity transitive vulnerability in `ip` through `werift`/`werift-ice`. npm currently reports no fix available, and `werift` is a required project dependency.

## Sensitive Data

Do not commit credentials, tokens, private keys, `.env` files, or personal sensitive data.

Do not commit real TURN credentials or embed them in release binaries. See [TURN_CREDENTIALS.md](TURN_CREDENTIALS.md) for the planned credential strategy.
