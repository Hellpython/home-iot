import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DevicesService } from '../devices/application/devices.service';
import { DeviceStatus } from '../devices/entities/device.entity';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly devicesService: DevicesService,
  ) {}

  @Cron('*/10 * * * * *')
  async handleSmartClimate() {
    const devices = await this.devicesService.findAll();
    const sensor = devices.find(d => d.type === 'sensor');
    const ac = devices.find(d => d.type === 'ac');
    
    if (sensor) {
      // 센서 값 업데이트 시 undefined 체크 추가
      const currentValue = sensor.value ?? 0;
      const change = (Math.random() - 0.5) * 0.4;
      const newValue = Number((currentValue + change).toFixed(1));

      await this.devicesService.updateValue(sensor.id, newValue);

      if (ac) {
        if (newValue >= 23.5 && ac.status === DeviceStatus.OFF) {
          this.logger.log(`⚠️ 폭염 감지(${newValue}°C)! 에어컨을 가동합니다.`);
          await this.devicesService.updateStatus(ac.id, DeviceStatus.ON);
        } else if (newValue <= 22.5 && ac.status === DeviceStatus.ON) {
          this.logger.log(`✅ 쾌적 온도 달성(${newValue}°C). 에어컨을 정지합니다.`);
          await this.devicesService.updateStatus(ac.id, DeviceStatus.OFF);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleGoodNight() {
    this.logger.log('--- [자동화] 취침 모드 가동 ---');
    const devices = await this.devicesService.findAll();
    const lights = devices.filter(d => d.type === 'light');

    for (const light of lights) {
      if (light.status === DeviceStatus.ON) {
        // DevicesService.updateStatus 내부에서 이제 알림을 알아서 보냅니다.
        await this.devicesService.updateStatus(light.id, DeviceStatus.OFF);
      }
    }
  }
}
