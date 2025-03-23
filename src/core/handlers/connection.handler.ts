import { Context } from '../services/waha-api/context';
import { PinoLogger } from 'nestjs-pino';
import * as qrcode from 'qrcode-terminal';

export function onConnection(ctx: Context, logger: PinoLogger) {}
