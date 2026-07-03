import WebSocket from "ws";

import {
  decodeSignalingMessage,
  encodeSignalingMessage,
  type SignalingMessage
} from "./messages.js";
import { A47Error } from "../utils/errors.js";

type MessageHandler = (message: SignalingMessage) => void;

export class SignalingClient {
  private socket?: WebSocket;
  private messageHandlers = new Set<MessageHandler>();

  constructor(private readonly serverUrl: string) {}

  async connect(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.serverUrl);
      this.socket = socket;

      socket.once("open", () => resolve());
      socket.once("error", (error) => {
        const errorMessage = error.message || "connection refused or unavailable";
        reject(new A47Error(`Unable to connect to signaling server: ${errorMessage}`));
      });
      socket.on("message", (data) => this.handleMessage(data.toString()));
      socket.on("close", () => {
        this.messageHandlers.forEach((handler) => {
          handler({ type: "error", message: "Signaling server connection closed." });
        });
      });
    });
  }

  async join(room: string): Promise<void> {
    const joinedMessagePromise = this.waitForMessage((message) => message.type === "joined" || message.type === "error");
    this.send({ type: "join", room });

    const joinedMessage = await joinedMessagePromise;
    if (joinedMessage.type === "error") {
      throw new A47Error(joinedMessage.message);
    }
  }

  send(message: SignalingMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new A47Error("Signaling server is not connected.");
    }

    this.socket.send(encodeSignalingMessage(message));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  waitForMessage(predicate: (message: SignalingMessage) => boolean): Promise<SignalingMessage> {
    return new Promise((resolve) => {
      const unsubscribe = this.onMessage((message) => {
        if (predicate(message)) {
          unsubscribe();
          resolve(message);
        }
      });
    });
  }

  close(): void {
    this.socket?.close();
  }

  private handleMessage(rawData: string): void {
    try {
      const message = decodeSignalingMessage(rawData);
      this.messageHandlers.forEach((handler) => handler(message));
    } catch {
      this.messageHandlers.forEach((handler) => {
        handler({ type: "error", message: "Received an invalid signaling message." });
      });
    }
  }
}
