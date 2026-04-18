import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceStatusChangedEvent } from '../../events/device-status-changed.event';
import { ActivityLog } from '../../../entities/activity-log.entity'; // 경로 수정
import { DeviceStatus } from '../../../domain/device'; // 경로 수정

@EventsHandler(DeviceStatusChangedEvent)
export class ActivityLogHandler implements IEventHandler<DeviceStatusChangedEvent> {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepository: Repository<ActivityLog>,
  ) {}

  async handle(event: DeviceStatusChangedEvent) {
    const { name, newStatus } = event;
    const actionStr = newStatus === DeviceStatus.ON ? '켜짐' : '꺼짐';

    await this.logRepository.save({
      deviceName: name,
      action: actionStr,
    });
  }
}
