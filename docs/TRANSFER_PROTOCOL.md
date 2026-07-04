# Transfer Protocol

The transfer protocol runs over a WebRTC DataChannel.

## Goals

- Avoid loading large files entirely into memory.
- Transfer single files in chunks.
- Verify integrity with SHA-256.
- Report readable progress and errors.

## Message Types

- `file-meta`
- `receiver-ready`
- `receiver-accepted`
- `file-chunk`
- `file-complete`
- `file-error`
- `hash-result`
- `sender-complete`

## Metadata

File metadata includes:

- Protocol version
- File name
- File size
- SHA-256 hash
- Optional MIME type in the future

## Chunking

The default chunk size is 256 KiB. File data is read with Node streams and sent as ordered DataChannel binary messages. Control messages are sent as JSON strings.

The sender keeps a larger DataChannel buffer window before waiting for backpressure, so LAN transfers are not intentionally throttled by a tiny application-side buffer. Progress rendering is throttled to avoid terminal output becoming a transfer bottleneck.

## Integrity

The sender calculates a SHA-256 hash before transfer. The receiver calculates a SHA-256 hash while writing the file and compares the result after the final chunk.

If the hash does not match, the receiver removes the failed output file and reports a readable error.

When `file-complete` arrives, the receiver first checks that the received byte count matches the advertised file size. It then enters a finalizing state while the write stream flushes and the SHA-256 result is sent back to the sender. The sender answers a successful `hash-result` with `sender-complete`, which gives both sides an ordered shutdown handshake. A DataChannel close during this finalization window is not treated as an interrupted transfer after all bytes have already arrived.

## Receiver Acceptance

After the DataChannel opens, the receiver registers its message handler and sends `receiver-ready`. The sender waits for this message before sending `file-meta`. This prevents a race where file metadata could arrive before the receiver was listening.

After file metadata arrives, the CLI receiver prompts the user to accept or reject the incoming file before any file bytes are written. The sender waits for `receiver-accepted` before sending chunks.

Sender-side waits for receiver control messages use a readable timeout instead of hanging indefinitely. After a successful `hash-result`, the sender sends `sender-complete`, waits briefly before closing the peer, and then exits. Receiver-side finalization also has a short fallback timeout after successful hash verification so a missing final acknowledgement does not leave a verified file stuck in progress.

## Interrupted Transfers

If the receiver detects that the peer disconnected before the transfer is complete, it rejects the transfer and removes the partial output file.

If the sender detects that the peer disconnected while waiting for receiver acceptance or hash verification, it rejects the transfer with a readable interruption error.

## Test Coverage

The automated integration suite transfers a small file through the real signaling server, `werift` peer layer, and WebRTC DataChannel path. It verifies that the received file content matches the source file.

Failure-path coverage includes:

- A hash mismatch test that confirms the receiver rejects the transfer, sends a failed hash result, and removes the failed output file.
- An interrupted receive test that confirms the receiver rejects the transfer and removes the partial output file when the peer disconnects early.
- An interrupted send test that confirms the sender rejects the transfer when the peer disconnects before receiver acceptance.
