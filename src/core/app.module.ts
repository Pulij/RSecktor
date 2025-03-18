import { Module } from '@nestjs/common';
import { AppController } from '../api/economy.controller';
import { Bot } from './bot';
import { Economy } from './services/economy/economy';
import { LoggerModule } from 'nestjs-pino';
import {
  getPinoHttpUseLevel,
  getPinoLogLevel,
  getPinoTransport,
} from '@rsecktor/utils/logger';

const IMPORTS = [
  LoggerModule.forRoot({
    renameContext: 'name',
    pinoHttp: {
      quietReqLogger: true,
      level: getPinoLogLevel(),
      useLevel: getPinoHttpUseLevel(),
      transport: getPinoTransport(),
      autoLogging: {
        ignore: (req) => {
          return (
            req.url?.startsWith('/dashboard/') ||
            req.url?.startsWith('/api/files/') ||
            req.url?.startsWith('/api/s3/') ||
            false
          );
        },
      },
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          query: req.query,
          params: req.params,
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
    },
  }),
];

@Module({
  imports: IMPORTS,
  controllers: [AppController],
  providers: [Bot, Economy],
})
export class AppModule {}
