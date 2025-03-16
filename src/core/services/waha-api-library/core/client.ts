import { HttpClient } from "./http";
import { Api } from "../api";
import { Pooling } from "./pooling";
import { Context } from "../context";

export class WHBot {
  private http: HttpClient;
  private pooling: Pooling;
  private eventListeners: Map<string, (data: any) => void>;
  public readonly api: Api;

  constructor(apiKey: string, baseUrl: string = "http://localhost:3000") {
    this.http = new HttpClient(apiKey, baseUrl);
    this.pooling = new Pooling();
    this.eventListeners = new Map();
    this.api = new Api(this.http);
  }

  on(session: string, event: string, callback: (ctx: any) => void) {
    const key = `${session}:${event}`;

    if (this.eventListeners.has(key)) {
      console.warn(`Listener for ${key} already exists`);
      return;
    }

    const handler = (data: any) => {
      if (!data) return;
      const ctx = new Context(data, this.http);
      callback(ctx);
    };

    this.eventListeners.set(key, handler);
    this.pooling.start(session, event, this.http, handler);
  }

  off(session: string, event: string) {
    const key = `${session}:${event}`;
    if (this.eventListeners.has(key)) {
      this.eventListeners.delete(key);
      this.pooling.stop(session, event);
    }
  }

  /** Deletes all listeners and stops Long Pool*/
  removeAllListeners() {
    this.eventListeners.forEach((_, key) => {
      const [session, event] = key.split(":");
      this.pooling.stop(session, event);
    });

    this.eventListeners.clear();
    console.log("All event listeners have been removed.");
  }
}
