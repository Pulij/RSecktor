import { proto } from '@whiskeysockets/baileys';
import { HttpClient } from './core/http';

// ===================== [ Sessions API ] =====================
class SessionsAPI {
  constructor(private http: HttpClient) {}

  async list(all?: boolean) {
    const query = all ? `?all=${all}` : '';
    return await this.http.get(`/api/sessions${query}`);
  }

  async create(name: string, start: boolean) {
    return await this.http.post('/api/sessions', { name, start });
  }

  async get(sessionId: string) {
    return await this.http.get(`/api/sessions/${sessionId}`);
  }

  async update(sessionId: string) {
    return await this.http.put(`/api/sessions/${sessionId}`);
  }

  async delete(sessionId: string) {
    return await this.http.delete(`/api/sessions/${sessionId}`);
  }

  async start(sessionId: string) {
    return await this.http.post(`/api/sessions/${sessionId}/start`);
  }

  async stop(sessionId: string) {
    return await this.http.post(`/api/sessions/${sessionId}/stop`);
  }

  async logout(sessionId: string) {
    return await this.http.post(`/api/sessions/${sessionId}/logout`);
  }

  async restart(sessionId: string) {
    return await this.http.post(`/api/sessions/${sessionId}/restart`);
  }
}

// ===================== [ Auth API ] =====================
class AuthAPI {
  constructor(private http: HttpClient) {}

  async getQrCode(sessionId: string) {
    return await this.http.get(`/api/auth/${sessionId}/qr`);
  }

  async getPairingCode(sessionId: string, phoneNumber: string) {
    return await this.http.post(`/api/auth/${sessionId}/pairing-code`, {
      phoneNumber,
    });
  }
}

// ===================== [ Messages API ] =====================
class MessagesAPI {
  constructor(private http: HttpClient) {}

  async sendText(
    session: string,
    text: string,
    chatId: string,
    reply_to?: proto.IMessageKey,
  ): Promise<proto.IMessage> {
    return await this.http.post('/api/sendText', {
      session,
      chatId,
      text,
      reply_to,
    });
  }
}

// ===================== [ Chats API ] =====================
class ChatsAPI {
  constructor(private http: HttpClient) {}
  async edit(
    session: string,
    text: string,
    chatId: string,
    key: proto.IMessageKey,
  ): Promise<proto.IMessage> {
    const messageId = `${key.fromMe}_${key.remoteJid}_${key.id}`;
    return await this.http.put(
      `/api/chats/${session}/${chatId}/messages/${messageId}`,
      {
        text,
      },
    );
  }

  async delete(
    session: string,
    chatId: string,
    key: proto.IMessageKey,
  ): Promise<any> {
    const messageId = `${key.fromMe}_${key.remoteJid}_${key.id}[_${key.participant}]`;
    return await this.http.delete(
      `/api/chats/${session}/${chatId}/messages/${messageId}`,
    );
  }
}

// ===================== [ Contacts API ] =====================
class ContactsAPI {
  constructor(private http: HttpClient) {}
  async getAll() {}
  async getInfo() {}
  async checkExists() {}
  async getAbout() {}
  async getProfilePicture() {}
  async block() {}
  async unblock() {}
}

// ===================== [ Groups API ] =====================
class GroupsAPI {
  constructor(private http: HttpClient) {}

  async create(name: string, participants: string[]) {
    return await this.http.post('/api/groups', { name, participants });
  }

  async getAll() {
    return await this.http.get('/api/groups');
  }

  async getInfo(groupId: string) {
    return await this.http.get(`/api/groups/${groupId}`);
  }

  async leave(groupId: string) {
    return await this.http.post(`/api/groups/${groupId}/leave`);
  }

  async getParticipants(groupId: string) {
    return await this.http.get(`/api/groups/${groupId}/participants`);
  }

  async add(groupId: string, userId: string) {
    return await this.http.post(`/api/groups/${groupId}/add`, { userId });
  }

  async remove(
    session: string,
    groupId: string,
    participants: { id: string }[],
  ) {
    return await this.http.post(
      `/api/groups/${session}/${groupId}/participants/remove`,
      {
        participants,
      },
    );
  }

  async promote(
    session: string,
    groupId: string,
    participants: { id: string }[],
  ) {
    return await this.http.post(
      `/api/groups/${session}/${groupId}/admin/promote`,
      { participants },
    );
  }

  async demote(
    session: string,
    groupId: string,
    participants: { id: string }[],
  ) {
    return await this.http.post(
      `/api/groups/${session}/${groupId}/admin/demote`,
      { participants },
    );
  }

  async changeDescription(groupId: string, description: string) {
    return await this.http.put(`/api/groups/${groupId}/description`, {
      description,
    });
  }

  async changeSubject(groupId: string, subject: string) {
    return await this.http.put(`/api/groups/${groupId}/subject`, { subject });
  }

  async getInviteCode(groupId: string) {
    return await this.http.get(`/api/groups/${groupId}/invite-code`);
  }

  async revokeInviteCode(groupId: string) {
    return await this.http.post(`/api/groups/${groupId}/invite-code/revoke`);
  }
}

// ===================== [ Main API ] =====================
export class Api {
  public sessions: SessionsAPI;
  public auth: AuthAPI;
  public messages: MessagesAPI;
  public chats: ChatsAPI;
  public contacts: ContactsAPI;
  public groups: GroupsAPI;

  constructor(private http: HttpClient) {
    this.sessions = new SessionsAPI(this.http);
    this.auth = new AuthAPI(this.http);
    this.messages = new MessagesAPI(this.http);
    this.chats = new ChatsAPI(this.http);
    this.contacts = new ContactsAPI(this.http);
    this.groups = new GroupsAPI(this.http);
  }
}
