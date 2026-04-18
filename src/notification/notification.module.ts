import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationService } from './notification.service';

@Global() // 전역 모듈로 설정하여 어디서든 주입 가능하게 함
@Module({
  imports: [HttpModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
