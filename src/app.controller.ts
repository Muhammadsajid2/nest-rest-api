import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('app-ads.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  getAppAds(): string {
    return 'google.com, pub-3478996450126704, DIRECT, f08c47fec0942fa0';
  }
}
