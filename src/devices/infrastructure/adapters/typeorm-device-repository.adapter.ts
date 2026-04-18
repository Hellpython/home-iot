import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceRepositoryPort } from '../../application/ports/device-repository.port';
import { Device } from '../../domain/device';
import { DeviceOrmEntity } from '../persistence/device.orm-entity';
import { DeviceMapper } from './device.mapper';

@Injectable()
export class TypeOrmDeviceRepositoryAdapter implements DeviceRepositoryPort {
  constructor(
    @InjectRepository(DeviceOrmEntity)
    private readonly repository: Repository<DeviceOrmEntity>,
  ) {}

  async findAll(): Promise<Device[]> {
    const entities = await this.repository.find();
    return entities.map(DeviceMapper.toDomain);
  }

  async findById(id: string): Promise<Device | null> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) return null;
    return DeviceMapper.toDomain(entity);
  }

  async save(device: Device): Promise<Device> {
    const ormEntity = DeviceMapper.toOrm(device);
    const saved = await this.repository.save(ormEntity);
    return DeviceMapper.toDomain(saved);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
