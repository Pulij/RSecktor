const { argv } = require('process');
const path = require('path');
const sessionsDir = argv[2] || path.resolve(__dirname, './sessions/');
const USE_PAIRING_CODE = true;
const RECONNECT_INTERVAL = 1000;
let groupMetadataCache = {};
let remoteWs;

const {
    default: VoidConnect,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    jidDecode,
    delay
} = require('@whiskeysockets/baileys');
const WebSocket = require('ws');
const NodeCache = require('node-cache');
const { smsg, removeFolder } = require('./funcn');
const pino = require('pino');
const fs = require('fs');
const bodyParser = require('body-parser');

let PHONE_NUMBER
let SESSIONS_JID

const express = require('express')
const app = express();
const port = 3000;
app.use(bodyParser.json());

app.post('/phone', (req, res) => {
    const { phoneNumber } = req.body;

    if (phoneNumber) {
        PHONE_NUMBER = phoneNumber
        SESSIONS_JID = phoneNumber + '@s.whatsapp.net'
    }
});


// Функция проверки наличия файла creds.json
async function checkCredsFile() {
    try {
        const filePath = path.resolve(sessionsDir, './creds.json');
        await fs.promises.access(filePath);
        console.log('Файл creds.json найден.');
        return true;
    } catch (error) {
        console.error('Файл creds.json не найден.');
        return false;
    }
}

// Функция подключения и управления сессиями WhatsApp
async function connectionWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionsDir);

        const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
        const msgRetryCounterCache = new NodeCache();
        const Void = VoidConnect({
            logger: pino({ level: 'silent' }),
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            printQRInTerminal: !USE_PAIRING_CODE,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'silent' })),
            },
            msgRetryCounterCache,
        });

        // Функция подключения к WebSocket =========================================================================
        const connectWebSocket = () => {
            const ws = new WebSocket('ws://192.168.8.104:8080');

            ws.on('open', () => {
                console.log('✅ Соединение с WebSocket сервером установлено.');
                ws.send(JSON.stringify({ type: 'sessionsJid', SESSIONS_JID }));
                remoteWs = ws;
            });

            ws.on('error', (error) => {
                console.error('❌ Ошибка подключения к удаленному WebSocket серверу:', error);
            });

            ws.on('close', (code, reason) => {
                console.log(`❌ Соединение с удаленным WebSocket сервером закрыто. Код: ${code}, Причина: ${reason}`);
                console.log('Попытка повторного подключения...');
                setTimeout(() => connectWebSocket(), RECONNECT_INTERVAL);  // Удаляем аргумент
            });

            return ws;
        };

        connectWebSocket();

        // Функция отправки данных через WebSocket с проверкой состояния подключения
        Void.sendToWebSocket = (data) => {
            if (remoteWs && remoteWs.readyState === WebSocket.OPEN) {
                remoteWs.send(JSON.stringify(data));
            } else {
                console.error('WebSocket не подключен.');
            }
        };

        // Периодическая запись сессий в файл
        const interval = setInterval(() => {
            try {
                store.writeToFile(path.resolve(sessionsDir, './store.json'));
            } catch (e) {
                clearInterval(interval);
                console.error('❌ Ошибка записи файла сессии:', e);
            }
        }, 30000);

        Void.ev.on('creds.update', saveCreds);

        if (USE_PAIRING_CODE && PHONE_NUMBER && !(await checkCredsFile())) {  // Используем await для вызова checkCredsFile
            await delay(1700);
            const pCode = await Void.requestPairingCode(PHONE_NUMBER);
            await delay(500);
            Void.sendToWebSocket({ pCode: pCode });
        }

        // Утилитарные функции =====================================================================================================
        Void.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};
                return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
            } else return jid;
        };

        Void.metadataGroup = async (chatId) => {
            if (chatId.endsWith('@g.us')) {
                if (!(chatId in groupMetadataCache)) {
                    groupMetadataCache[chatId] = await Void.groupMetadata(chatId);
                }
                return groupMetadataCache[chatId];
            } else {
                return 'privateChat';
            }
        };
        //===============================================================================================================
        // Обработчики событий подключения к WhatsApp
        Void.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            switch (connection) {
                case 'connecting':
                    Void.sendToWebSocket('🌍 Подключение к WhatsApp... Пожалуйста, подождите.');
                    break;
                case 'open':
                    Void.sendToWebSocket('✅ Подключение выполнено успешно.');
                    break;
                case 'close':
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode;
                    if (shouldReconnect === 515) {
                        await connectionWhatsApp();
                    } else if ([401, 405, 403].includes(shouldReconnect) || lastDisconnect?.error?.message === 'QR refs attempts ended') {
                        Void.logout();
                        await removeFolder(sessionsDir);
                        await connectionWhatsApp();
                    } else {
                        await connectionWhatsApp();
                    }
                    break;
                default:
                    break;
            }
        });

        // Обработчик входящих сообщений
        Void.ev.on('messages.upsert', async (chatUpdate) => {
            Void.sendToWebSocket(chatUpdate)
        });

        // Обработчик обновления участников групп
        Void.ev.on('group-participants.update', async (anu) => {
        });
    } catch (e) {
        console.error(e);
    }
}

// Запуск клиента
connectionWhatsApp();
setInterval(() => {
    groupMetadataCache = {};
}, 30000);