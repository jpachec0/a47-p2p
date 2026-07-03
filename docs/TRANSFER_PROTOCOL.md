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

## Metadata

File metadata includes:

- Protocol version
- File name
- File size
- SHA-256 hash
- Optional MIME type in the future

## Chunking

The initial chunk size is 64 KiB. File data is read with Node streams and sent as ordered DataChannel binary messages. Control messages are sent as JSON strings.

## Integrity

The sender calculates a SHA-256 hash before transfer. The receiver calculates a SHA-256 hash while writing the file and compares the result after the final chunk.

If the hash does not match, the receiver removes the failed output file and reports a readable error.

## Test Coverage

The automated integration suite transfers a small file through the real signaling server, `werift` peer layer, and WebRTC DataChannel path. It verifies that the received file content matches the source file.
