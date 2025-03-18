import { Context } from '../services/waha-api-library/context';
import { PinoLogger } from 'nestjs-pino';
import * as qrcode from 'qrcode-terminal';

export function onConnection(ctx: Context, logger: PinoLogger) {
  if (ctx.data.event === 'connection.update' && ctx.data.data.qr) {
    logger.info('Displaying QR code in terminal...');
    qrcode.generate(ctx.data.data.qr, { small: true });
  }
}
