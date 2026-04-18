import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { Device, DeviceStatus } from '../domain/device';
import { ActivityLog } from '../entities/activity-log.entity';
import { UpdateDeviceStatusCommand } from './commands/update-device-status.command';
import { DEVICE_REPOSITORY_PORT, DeviceRepositoryPort } from './ports/device-repository.port';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @Inject('DeviceRepository')
    private readonly deviceRepository: DeviceRepositoryPort,
    @InjectRepository(ActivityLog)
    private readonly logRepository: Repository<ActivityLog>,
    @Inject('IOT_MQTT_CLIENT')
    private readonly mqttClient: ClientProxy,
    private readonly commandBus: CommandBus,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.deviceRepository.findAll();
  }

  async updateStatus(id: string, status: DeviceStatus): Promise<Device> {
    return this.commandBus.execute(new UpdateDeviceStatusCommand(id, status));
  }

  async updateValue(id: string, value: number): Promise<Device> {
    const device = await this.deviceRepository.findById(id);
    if (!device) throw new NotFoundException('장치를 찾을 수 없습니다.');

    // 가치 업데이트 로직
    device.value = value;
    const updated = await this.deviceRepository.save(device);
    this.mqttClient.emit(`devices/${id}/value`, { value });
    return updated;
  }

  async getRecentLogs() {
    return this.logRepository.find({
      order: { timestamp: 'DESC' },
      take: 5
    });
  }

  async createSeedData() {
    const count = await this.deviceRepository.count();
    if (count === 0) {
      await this.deviceRepository.save({
        name: '거실 전등', status: DeviceStatus.OFF, type: 'light'
      });
      await this.deviceRepository.save({
        name: '실내 온도', type: 'sensor', value: 24.5, unit: '°C'
      });
      await this.deviceRepository.save({
        name: '스마트 에어컨', status: DeviceStatus.OFF, type: 'ac'
      });
      this.logger.log('초기 더미 장치 데이터를 생성했습니다.');
    }
  }
}
