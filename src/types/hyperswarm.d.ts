declare module "hyperswarm" {
  import type { Duplex } from "node:stream";

  export interface HyperswarmOptions {
    maxPeers?: number;
  }

  export interface HyperswarmJoinOptions {
    client?: boolean;
    server?: boolean;
    limit?: number;
  }

  export interface HyperswarmDiscovery {
    flushed(): Promise<void>;
    destroy(): Promise<void>;
  }

  export interface HyperswarmPeerInfo {
    publicKey: Buffer;
    topics?: Buffer[];
  }

  export default class Hyperswarm {
    readonly connections: Set<Duplex>;
    readonly connecting: number;

    constructor(options?: HyperswarmOptions);
    join(topic: Buffer, options?: HyperswarmJoinOptions): HyperswarmDiscovery;
    flush(): Promise<void>;
    destroy(): Promise<void>;
    on(event: "connection", listener: (socket: Duplex, peerInfo: HyperswarmPeerInfo) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
}
