import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Infrastructure
import { DevicesController } from './infrastructure/controllers/devices.controller';
import { DeviceOrmEntity } from './infrastructure/persistence/device.orm-entity';
import { ActivityLog } from './entities/activity-log.entity';
import { TypeOrmDeviceRepositoryAdapter } from './infrastructure/adapters/typeorm-device-repository.adapter';
import { EventsGateway } from './infrastructure/gateways/events.gateway';

// Application
import { DevicesService } from './application/devices.service';
import { DEVICE_REPOSITORY_PORT } from './application/ports/device-repository.port';
import { NotificationModule } from '../notification/notification.module';

// Handlers
import { UpdateDeviceStatusHandler } from './application/handlers/commands/update-device-status.handler';
import { MqttStatusHandler } from './application/handlers/events/mqtt-status.handler';
import { NotificationHandler } from './application/handlers/events/notification.handler';
import { ActivityLogHandler } from './application/handlers/events/activity-log.handler';
import { WebSocketStatusHandler } from './application/handlers/events/web-socket-status.handler';

const CommandHandlers = [UpdateDeviceStatusHandler];
const EventHandlers = [MqttStatusHandler, NotificationHandler, ActivityLogHandler, WebSocketStatusHandler];

const DeviceRepositoryProvider = {
  provide: 'DeviceRepository',
  useClass: TypeOrmDeviceRepositoryAdapter,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceOrmEntity, ActivityLog]),
    CqrsModule,
    NotificationModule,
    ClientsModule.registerAsync([
      {
        name: 'IOT_MQTT_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: config.get<string>('MQTT_URL', 'mqtt://localhost:1883'),
          },
        }),
      },
    ]),
  ],
  controllers: [DevicesController],
  providers: [
    DeviceRepositoryProvider,
    DevicesService,
    EventsGateway,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [DevicesService, DEVICE_REPOSITORY_PORT],
})
export class DevicesModule {}
