import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 기본 루트(@Get())를 비워두거나 다른 경로로 옮겨야 
  // ServeStaticModule이 index.html을 보여줄 수 있습니다.
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
