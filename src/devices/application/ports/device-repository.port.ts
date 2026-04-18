import { Device } from '../../domain/device';

export interface DeviceRepositoryPort {
  findAll(): Promise<Device[]>;
  findById(id: string): Promise<Device | null>;
  save(device: Device): Promise<Device>;
  count(): Promise<number>;
}

export const DEVICE_REPOSITORY_PORT = 'DeviceRepository';
