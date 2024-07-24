const { getContentType } = require("@whiskeysockets/baileys")
const path = require('path');
const fs = require('fs');

exports.smsg = (conn, citel) => {
    if (!citel) return citel
    if (citel.key) {
        citel.id = citel.key.id
        citel.isBot = citel.id.startsWith('3EB0') && citel.id.length === 22
        citel.isBaileys = citel.id.startsWith('3EB0') && citel.id.length === 22
        citel.chat = citel.key.remoteJid
        citel.fromMe = citel.key.fromMe
        citel.isGroup = citel.chat.endsWith('@g.us')
        citel.sender = citel.fromMe ? conn.user.jid : citel.participant || citel.key.participant || citel.chat;
        if (citel.isGroup) citel.participant = conn.user.jid;
    }
    if (citel.message) {
        citel.mtype = getContentType(citel.message)
        citel.msg = (citel.mtype == 'viewOnceMessage' ? citel.message[citel.mtype].message[getContentType(citel.message[citel.mtype].message)] : citel.message[citel.mtype])
        try {
            citel.body = (citel.mtype === 'conversation') ? citel.message.conversation : (citel.mtype == 'imageMessage') && citel.message.imageMessage.caption != undefined ? citel.message.imageMessage.caption : (citel.mtype == 'videoMessage') && citel.message.videoMessage.caption != undefined ? citel.message.videoMessage.caption : (citel.mtype == 'extendedTextMessage') && citel.message.extendedTextMessage.text != undefined ? citel.message.extendedTextMessage.text : (citel.mtype == 'buttonsResponseMessage') ? citel.message.buttonsResponseMessage.selectedButtonId : (citel.mtype == 'listResponseMessage') ? citel.message.listResponseMessage.singleSelectReply.selectedRowId : (citel.mtype == 'templateButtonReplyMessage') ? citel.message.templateButtonReplyMessage.selectedId : (citel.mtype === 'messageContextInfo') ? (citel.message.buttonsResponseMessage?.selectedButtonId || citel.message.listResponseMessage?.singleSelectReply.selectedRowId || citel.text) : '';
        } catch {
            citel.body = false
        }
        let contextInfo = citel.msg && citel.msg.contextInfo
        let quoted = citel.quoted = (contextInfo && contextInfo.quotedMessage) ? contextInfo.quotedMessage : null;
        citel.mentionedJid = citel.msg && citel.msg.contextInfo ? citel.msg.contextInfo.mentionedJid : [];

        if (citel.quoted) {
            let type = getContentType(quoted)
            citel.quoted = citel.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(citel.quoted)
                citel.quoted = citel.quoted[type]
            }
            if (typeof citel.quoted === 'string') citel.quoted = { text: citel.quoted }


            if (quoted.viewOnceMessageV2) {
                console.log("entered ==================================== ")
            } else {
                if (citel.quoted) {
                    citel.quoted.mtype = type;
                    citel.quoted.id = citel.msg.contextInfo.stanzaId
                    citel.quoted.chat = citel.msg.contextInfo.remoteJid || citel.chat
                    citel.quoted.isBot = citel.quoted.id ? citel.quoted.id.startsWith('3EB0') && citel.quoted.id.length === 22 : false
                    citel.quoted.isBaileys = citel.quoted.id ? citel.quoted.id.startsWith('3EB0') && citel.quoted.id.length === 22 : false
                    citel.quoted.sender = citel.msg.contextInfo.participant
                    citel.quoted.fromMe = citel.quoted.sender === (conn.user && conn.user.id)
                    citel.quoted.text = citel.quoted.text || citel.quoted.caption || citel.quoted.conversation || citel.quoted.contentText || citel.quoted.selectedDisplayText || citel.quoted.title || ''
                    citel.quoted.mentionedJid = citel.msg.contextInfo ? citel.msg.contextInfo.mentionedJid : []
                }
            }
        }
    }
    citel.text = (citel && citel.msg) ? (citel.msg.text || citel.msg.caption || citel.message.conversation || citel.msg.contentText || citel.msg.selectedDisplayText || citel.msg.title || '') : '';
    return citel
}

exports.removeFolder = async (folder) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folder, (err, files) => {
            if (err) {
                reject(err);
            } else {
                files.forEach(file => {
                    const filePath = path.join(folder, file);
                    fs.unlinkSync(filePath);
                });
                fs.rmdir(folder, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Папка ${folder} успешно удалена.`);
                        resolve();
                    }
                });
            }
        });
    });
};