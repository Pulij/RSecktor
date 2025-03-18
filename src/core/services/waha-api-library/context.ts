import { HttpClient } from './core/http';

export class Context {
  private http: HttpClient;
  public data: any;
  public chatId: string;

  constructor(data: any, httpClient: HttpClient) {
    this.data = data;
    this.http = httpClient;

    this.chatId =
      data?.payload?.key?.remoteJid || data?.payload?.key?.fromMe || '';

    this.reply = this.reply.bind(this);
  }

  /** Ответить на сообщение */
  async reply(text: string) {
    if (!this.http) {
      throw new Error('HTTP client is not initialized');
    }

    const payload = {
      session: this.data.session,
      chatId: this.chatId,
      text: text,
      reply_to: this.data?.payload?.key,
    };

    return await this.http.post('/api/sendText', payload);
  }
}
