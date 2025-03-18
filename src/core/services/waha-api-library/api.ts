import { HttpClient } from './core/http';

export class Api {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async listSessions(all: boolean | undefined): Promise<[any]> {
    return await this.http.get('/api/sessions', all ? { all } : undefined);
  }
  async createSession(name: string, start: boolean) {
    return await this.http.post('/api/sessions', { name, start });
  }

  async getSession(sessionId: string) {
    return await this.http.get(`/api/sessions/${sessionId}`);
  }

  async deleteSession(sessionId: string) {
    return await this.http.delete(`/api/sessions/${sessionId}`);
  }

  async startSession(sessionId: string) {
    return await this.http.post(`/api/sessions/${sessionId}/start`);
  }

  async stopSession(sessionId: string) {
    return await this.http.post(`/api/sessions/${sessionId}/stop`);
  }

  /** Send text messages */
  async sendText(session: string, text: string, chatId: string) {
    const payload = {
      session: session,
      chatId: chatId,
      text: text,
    };

    return await this.http.post('/api/sendText', payload);
  }

  /** Edit messages */
  async editMessage(session: string, text: string, content: EditMessage) {
    const payload = {
      session: session,
      text: text,
      key: content.key,
    };

    return await this.http.post('/api/editText', payload);
  }
}
