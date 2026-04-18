import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DeviceStatusChangedEvent } from '../../events/device-status-changed.event';
import { NotificationService } from '../../../../notification/notification.service';
import { DeviceStatus } from '../../../domain/device';

@EventsHandler(DeviceStatusChangedEvent)
export class NotificationHandler implements IEventHandler<DeviceStatusChangedEvent> {
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: DeviceStatusChangedEvent) {
    const { name, oldStatus, newStatus } = event;

    // 상태가 실제로 변했을 때만 알림 전송
    if (oldStatus !== newStatus) {
      const actionStr = newStatus === DeviceStatus.ON ? '켜짐' : '꺼짐';
      await this.notificationService.sendTelegram(
        `🔔 *장치 제어 알림*\n*${name}*이(가) *${actionStr}* 상태로 변경되었습니다.`
      );
    }
  }
}
