import { Api } from '../api';
import { Context } from '../context';
import { sleep } from '../utils';
import { HttpClient } from './http';
import { Pooling } from './pooling';

export class WHBot {
  private http: HttpClient;
  private pooling: Pooling;
  private eventListeners: Map<string, (data: any) => void>;
  public readonly api: Api;
  private isInitialized: boolean = false;

  constructor(
    apiKey: string,
    private data: { sessionDefaultName?: string } = {},
    baseUrl: string = 'http://localhost:3000',
  ) {
    this.http = new HttpClient(apiKey, baseUrl);
    this.pooling = new Pooling();
    this.eventListeners = new Map();
    this.api = new Api(this.http);
  }

  /** Run initialization bot */
  async init() {
    try {
      const success = await this.initializeSession(
        this.data.sessionDefaultName,
      );
      if (!success) {
        throw new Error('Session initialization failed.');
      }
      await sleep(2500);
      this.isInitialized = true;
    } catch (error) {
      console.error('Bot initialization failed:', error);
      throw error;
    }
  }

  private async initializeSession(
    sessionDefaultName?: string,
  ): Promise<boolean> {
    if (!sessionDefaultName) {
      throw new Error('Session name is not provided.');
    }

    try {
      const sessions = await this.api.sessions.list(true);
      if (sessions.length > 0) {
        const session = sessions.find((s) => s.name === sessionDefaultName);
        if (session) {
          if (session.status === 'STOPPED') {
            await this.api.sessions.start(session.name);
            console.log('Default session started.');
          }
          return true;
        } else {
          throw new Error(`Session "${sessionDefaultName}" not found.`);
        }
      } else {
        await this.api.sessions.create(sessionDefaultName, true);
        console.log('Default session created and started.');
        return true;
      }
    } catch (error) {
      throw new Error(`Failed to initialize session: ${error.message}`);
    }
  }

  /** Check inintialization bot */
  private checkInitialization() {
    if (!this.isInitialized) {
      throw new Error('Bot is not initialized. Call `await bot.init()` first.');
    }
  }

  on(session: string, event: string, callback: (ctx: any) => void) {
    this.checkInitialization();

    const key = `${session}:${event}`;

    if (this.eventListeners.has(key)) {
      console.warn(`Listener for ${key} already exists`);
      return;
    }

    const handler = (data: any) => {
      if (!data) return;
      const ctx = new Context(this.api, data);
      callback(ctx);
    };

    this.eventListeners.set(key, handler);
    this.pooling.start(session, event, this.http, handler);
  }

  off(session: string, event: string) {
    this.checkInitialization();

    const key = `${session}:${event}`;
    if (this.eventListeners.has(key)) {
      this.eventListeners.delete(key);
      this.pooling.stop(session, event);
    }
  }

  /** Deletes all listeners and stops Long Pool*/
  removeAllListeners() {
    this.checkInitialization();

    this.eventListeners.forEach((_, key) => {
      const [session, event] = key.split(':');
      this.pooling.stop(session, event);
    });

    this.eventListeners.clear();
    console.log('All event listeners have been removed.');
  }
}
