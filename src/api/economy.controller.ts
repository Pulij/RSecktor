import { Controller, Get } from '@nestjs/common';
import { Economy } from '../core/services/economy/economy';

@Controller()
export class AppController {
  constructor(private readonly eco: Economy) {}

  @Get()
  getHello(): string {
    return this.eco.getHello();
  }
}
