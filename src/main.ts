import { NestFactory } from '@nestjs/core';
import { AppModule } from './core/app.module';
import pino, { Logger } from 'pino';
import {
  Logger as NestJSPinoLogger,
  LoggerErrorInterceptor,
} from 'nestjs-pino';

import {
  getNestJSLogLevels,
  getPinoLogLevel,
  getPinoTransport,
} from '@rsecktor/utils/logger';

const logger: Logger = pino({
  level: getPinoLogLevel(),
  transport: getPinoTransport(),
}).child({ name: 'Bootstrap' });

logger.info('NODE - Catching unhandled rejection enabled');
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // @ts-ignore
  logger.error(reason.stack);
});
process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  await gracefulShutdown();
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  logger.info(
    'The application has completed its work, press ctrl +c again to exit...',
  );
  if (logger.flush) {
    logger.flush();
  }
  process.exit(0);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getNestJSLogLevels(),
    bufferLogs: true,
    forceCloseConnections: true,
  });
  app.useLogger(app.get(NestJSPinoLogger));

  // Print original stack, not pino one
  // https://github.com/iamolegga/nestjs-pino?tab=readme-ov-file#expose-stack-trace-and-error-class-in-err-property
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.enableCors();

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap().catch((error) => {
  logger.error(error, `Failed to start: ${error}`);
  // @ts-ignore
  logger.error(error.stack);
  process.exit(1);
});
