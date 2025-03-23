import { type Api } from './api';

export class Context {
  public id: string;
  public chatId: string;
  public senderId: string;
  public pushName: string;
  public isGroup: boolean;
  public text: string;
  public session: string;
  public mentionedJid: string[];
  public quoted: {
    id?: string;
    chat?: string;
    sender?: string;
    fromMe?: boolean;
    text?: string;
    mentionedJid?: string[];
    delete: () => Promise<any>;
  } | null;

  constructor(
    private api: Api,
    private data: any,
  ) {
    if (!data?.[0]?.payload?.key) return;
    this.id = data[0]?.payload?.key?.id || '';
    this.chatId =
      data[0]?.payload?.key?.remoteJid || data[0]?.payload?.key?.fromMe || '';
    this.senderId = data[0]?.payload?.key?.participant || this.chatId;
    this.pushName = data[0]?.payload?.pushName || 'Unknown';
    this.isGroup = this.chatId.endsWith('@g.us');
    this.text =
      data[0]?.payload?.message?.extendedTextMessage?.text ||
      data[0]?.payload?.message?.conversation ||
      '';
    this.session = data[0]?.session || '';

    const contextInfo =
      data[0]?.payload?.message?.extendedTextMessage?.contextInfo || {};
    this.mentionedJid = contextInfo.mentionedJid || [];

    // Определение цитируемого сообщения
    const quotedMessage = contextInfo.quotedMessage || null;
    this.quoted = quotedMessage
      ? {
          id: contextInfo.stanzaId,
          chat: contextInfo.remoteJid || this.chatId,
          sender: contextInfo.participant,
          fromMe: contextInfo.participant === this.senderId,
          text:
            quotedMessage.conversation ||
            quotedMessage.extendedTextMessage?.text ||
            quotedMessage.imageMessage?.caption ||
            quotedMessage.videoMessage?.caption ||
            '',
          mentionedJid: contextInfo.mentionedJid || [],
          delete: async () => {
            if (!contextInfo.stanzaId) {
              throw new Error('No quoted message to delete');
            }
            const key = {
              remoteJid: this.chatId,
              fromMe: true,
              id: this.quoted?.id,
              participant: this.quoted?.sender,
            };
            return this.api.chats.delete(this.session, this.chatId, key);
          },
        }
      : null;

    this.reply = this.reply.bind(this);
    Object.preventExtensions(this);
  }

  async reply(text: string): Promise<any> {
    return this.api.messages.sendText(
      this.session,
      text,
      this.chatId,
      this.data[0]?.payload?.key,
    );
  }

  // Улучшенный вывод в консоль
  toJSON() {
    return {
      session: this.session,
      id: this.id,
      chatId: this.chatId,
      senderId: this.senderId,
      pushName: this.pushName,
      isGroup: this.isGroup,
      text: this.text,
      mentionedJid: this.mentionedJid,
      quoted: this.quoted,
    };
  }
}
