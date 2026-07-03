export type SignalingMessageType =
  | "join"
  | "joined"
  | "peer-joined"
  | "peer-left"
  | "offer"
  | "answer"
  | "ice-candidate"
  | "error";

export interface JoinMessage {
  type: "join";
  room: string;
}

export interface JoinedMessage {
  type: "joined";
  room: string;
  peerId: string;
  peers: number;
}

export interface PeerJoinedMessage {
  type: "peer-joined";
  peerId: string;
}

export interface PeerLeftMessage {
  type: "peer-left";
  peerId: string;
}

export interface SessionDescriptionPayload {
  type: "offer" | "answer";
  sdp: string;
}

export interface OfferMessage {
  type: "offer";
  description: SessionDescriptionPayload;
}

export interface AnswerMessage {
  type: "answer";
  description: SessionDescriptionPayload;
}

export interface IceCandidateMessage {
  type: "ice-candidate";
  candidate: unknown;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type SignalingMessage =
  | JoinMessage
  | JoinedMessage
  | PeerJoinedMessage
  | PeerLeftMessage
  | OfferMessage
  | AnswerMessage
  | IceCandidateMessage
  | ErrorMessage;

export function encodeSignalingMessage(message: SignalingMessage): string {
  return JSON.stringify(message);
}

export function decodeSignalingMessage(data: string): SignalingMessage {
  const parsedMessage = JSON.parse(data) as SignalingMessage;

  if (!parsedMessage || typeof parsedMessage.type !== "string") {
    throw new Error("Invalid signaling message.");
  }

  return parsedMessage;
}
