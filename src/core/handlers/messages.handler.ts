import { Context } from '../services/waha-api-library/context';
import { PinoLogger } from 'nestjs-pino';

export async function onMessages(ctx: Context, logger: PinoLogger, whbot: any) {
  try {
    let text =
      ctx.data?.message?.extendedTextMessage?.text ||
      ctx.data?.message?.conversation;

    if (text?.toLowerCase() === '.ping') {
      const startTime = performance.now();
      const response = await ctx.reply('Пинг...');
      const endTime = performance.now();
      const ping = Math.round(endTime - startTime);
      await whbot.api.editMessage(
        ctx.data.session,
        `Понг! ${ping}ms`,
        response,
      );
    }

    console.log(ctx);
  } catch (err) {
    console.error(err);
  }
}
