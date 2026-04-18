import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DeviceStatusChangedEvent } from '../../events/device-status-changed.event';

@EventsHandler(DeviceStatusChangedEvent)
export class MqttStatusHandler implements IEventHandler<DeviceStatusChangedEvent> {
  private readonly logger = new Logger(MqttStatusHandler.name);

  constructor(
    @Inject('IOT_MQTT_CLIENT')
    private readonly mqttClient: ClientProxy,
  ) {}

  handle(event: DeviceStatusChangedEvent) {
    const { id, newStatus } = event;
    this.logger.log(`MQTT 제어 명령 전송: devices/${id}/command -> ${newStatus}`);
    this.mqttClient.emit(`devices/${id}/command`, { status: newStatus });
  }
}
