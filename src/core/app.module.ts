import { Module } from '@nestjs/common';
import { AppController } from '../api/economy.controller';
import { Bot } from './bot';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Bot],
})
export class AppModule {}
