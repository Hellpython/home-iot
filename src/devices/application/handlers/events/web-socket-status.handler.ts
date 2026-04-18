import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DeviceStatusChangedEvent } from '../../events/device-status-changed.event';
import { EventsGateway } from '../../../infrastructure/gateways/events.gateway';
import { Logger } from '@nestjs/common';

@EventsHandler(DeviceStatusChangedEvent)
export class WebSocketStatusHandler implements IEventHandler<DeviceStatusChangedEvent> {
  private readonly logger = new Logger(WebSocketStatusHandler.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  handle(event: DeviceStatusChangedEvent) {
    this.logger.log(`웹소켓 알림 전송: ${event.name} -> ${event.newStatus}`);
    
    // 클라이언트가 이해할 수 있는 형식으로 데이터 전송
    this.eventsGateway.emitDeviceStatusChanged({
      id: event.id,
      name: event.name,
      status: event.newStatus,
      timestamp: new Date().toISOString()
    });
  }
}
