import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { AutomationModule } from './automation/automation.module';
import { NotificationModule } from './notification/notification.module';
import { DeviceOrmEntity } from './devices/infrastructure/persistence/device.orm-entity';
import { ActivityLog } from './devices/entities/activity-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'heechan'),
        password: config.get<string>('DB_PASSWORD', 'your_password'),
        database: config.get<string>('DB_NAME', 'home_iot'),
        entities: [DeviceOrmEntity, ActivityLog],
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
    DevicesModule,
    AutomationModule,
    NotificationModule, // 알림 모듈 추가
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
