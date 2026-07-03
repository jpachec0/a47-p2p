# Deployment

This document describes the deployment path for making A47 usable without manual IP exchange.

## Public Signaling Server

Users on different networks need a public WebSocket signaling URL that both peers can reach.

The signaling server still only exchanges room and WebRTC negotiation metadata. It does not receive, store, inspect, or proxy files.

## Docker Image

Build the local signaling image:

```bash
npm run docker:signaling
```

Run it locally:

```bash
docker run --rm -p 4747:4747 a47-signaling:local
```

Deploy the image behind HTTPS-capable infrastructure and expose it as `wss://`.

Runtime environment:

```txt
A47_SIGNALING_HOST=0.0.0.0
A47_SIGNALING_PORT=4747
```

## Hosting Requirements

The public signaling host must support:

- WebSocket upgrade requests.
- TLS termination for `wss://`.
- A stable public DNS name.
- Long-lived connections.
- Horizontal scaling only after room state is shared or made sticky.

For the current in-memory MVP, use one signaling instance or sticky sessions.

## Client Configuration

Configure clients to use the public signaling URL:

```bash
a47 config set server wss://signal.example.com
```

## TURN Relay

STUN works for many home networks, but restrictive NAT and firewall setups need TURN.

A47 supports authenticated TURN configuration through JSON:

```bash
a47 config set ice-servers '[{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

Multiple ICE servers can be configured:

```bash
a47 config set ice-servers '[{"urls":"stun:stun.l.google.com:19302"},{"urls":"turn:turn.example.com:3478","username":"a47","credential":"replace-this-secret"}]'
```

Do not commit real TURN credentials. Use provider-managed secrets, short-lived credentials, or deployment-time configuration.

## Release-Ready Plan

Before making public cross-network transfer the default, complete these tasks:

- Deploy a public `wss://` signaling server.
- Choose and deploy a TURN server or managed TURN provider.
- Define how normal users receive TURN credentials without exposing long-lived secrets in the repository.
- Validate transfers between two different residential networks.
- Measure large-file throughput through direct WebRTC and TURN-relayed paths.
