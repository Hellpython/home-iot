import { Module } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { DevicesModule } from '../devices/devices.module';

@Module({
  // AutomationModule이 DevicesModule의 DevicesService를 사용할 수 있도록 등록
  imports: [DevicesModule],
  providers: [AutomationService],
})
export class AutomationModule {}
