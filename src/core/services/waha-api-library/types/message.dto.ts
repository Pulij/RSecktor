interface IMessageKey {
  /** MessageKey remoteJid */
  remoteJid?: string | null;

  /** MessageKey fromMe */
  fromMe?: boolean | null;

  /** MessageKey id */
  id?: string | null;

  /** MessageKey participant */
  participant?: string | null;
}

interface SendText {
  text: string;
  mentions?: string[];
  reply_to?: IMessageKey;
}

interface EditMessage {
  chatId: string;
  text: string;
  key: IMessageKey;
}
