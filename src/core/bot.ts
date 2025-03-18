import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { WHBot } from './services/waha-api-library/core/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { onConnection } from './handlers/connection.handler';
import { onMessages } from './handlers/messages.handler';

@Injectable()
export class Bot implements OnModuleInit, OnModuleDestroy {
  private bot: WHBot;
  constructor(
    @InjectPinoLogger(Bot.name)
    private readonly logger: PinoLogger,
  ) {}

  async onModuleInit() {
    this.logger.info('RSecktor(Russian WhatsApp Bot) - Running');
    this.bot = new WHBot('', { sessionDefaultName: 'default' });
    await this.bot.init();
    this.bot.on('default', 'engine.event', (ctx) =>
      onConnection(ctx, this.logger),
    );
    this.bot.on('default', 'message', (ctx) => {
      onMessages(ctx, this.logger, this.bot);
    });
  }

  async onModuleDestroy() {
    this.bot.removeAllListeners();
    this.logger.info('Bot stopped!');
  }
}
