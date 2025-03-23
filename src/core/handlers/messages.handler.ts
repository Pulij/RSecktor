import { Context } from '../services/waha-api/context';
import { format } from 'util';
import { PinoLogger } from 'nestjs-pino';

export async function onMessages(ctx: Context, whbot: any) {
  try {
    const command = ctx.text?.toLowerCase().match(/^(\.\w+)\b/)?.[1];

    switch (command) {
      case '.ping': {
        const startTime = performance.now();
        const response = await ctx.reply('Пинг...');
        const endTime = performance.now();
        const ping = Math.round(endTime - startTime);
        await whbot.api.chats.edit(
          ctx.session,
          `Понг -> ${ping}`,
          ctx.chatId,
          response.key,
        );
        break;
      }

      case '.prom': {
        const participant = ctx.quoted?.id;
        if (participant) {
          await whbot.api.groups.promote(ctx.session, ctx.chatId, [
            { id: participant },
          ]);
        } else {
          await ctx.reply('Ошибка: не удалось получить ID участника.');
        }
        break;
      }

      case '.dem': {
        const participant = ctx.quoted?.id;
        if (participant) {
          await whbot.api.groups.demote(ctx.session, ctx.chatId, [
            { id: participant },
          ]);
        } else {
          await ctx.reply('Ошибка: не удалось получить ID участника.');
        }
        break;
      }

      case '.del': {
        const SKey = {
          remoteJid: ctx.chatId,
          fromMe: false,
          id: ctx.id,
          participant: ctx.senderId,
        };
        await ctx.quoted?.delete();
        await whbot.api.chats.delete(ctx.session, ctx.chatId, SKey);
        break;
      }

      default:
        break;
    }

    if (ctx.text.startsWith('>')) {
      try {
        const result = eval(ctx?.text?.slice(1)?.trim());
        await ctx.reply(format(result));
      } catch (err) {
        await ctx.reply(format(err));
      }
    }

    console.log(ctx.toJSON());
  } catch (err) {
    console.error('Error in onMessages:', err);
  }
}
