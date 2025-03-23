/** Тип для данных о пользователе в сессии */
interface SessionUser {
  id: string;
  pushName: string;
}

/** Тип для метаданных пользователя */
interface Metadata {
  'user.id': string;
  'user.email': string;
}

/** Тип для настроек хранилища */
interface StoreConfig {
  enabled: boolean;
  fullSync: boolean;
}

/** Тип для настроек вебхуков */
interface Webhook {
  url: string;
  events: string[];
  hmac: string | null;
  retries: number | null;
  customHeaders: Record<string, string> | null;
}

/** Конфигурация сессии */
interface SessionConfig {
  metadata: Metadata;
  proxy: string | null;
  debug: boolean;
  noweb: {
    store: StoreConfig;
  };
  webhooks: Webhook[];
}

/** Основной тип сессии */
interface Session {
  name: string;
  me: SessionUser;
  assignedWorker: string;
  status: 'STOPPED' | 'RUNNING' | 'PAUSED' | 'ERROR'; // Добавил возможные статусы
  config: SessionConfig;
}

/** Ответ listSessions */
type SessionsListResponse = Session[];
type SessionResponse = Session;
