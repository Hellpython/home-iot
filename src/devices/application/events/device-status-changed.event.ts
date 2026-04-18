import { DeviceStatus } from '../../domain/device';

export class DeviceStatusChangedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly oldStatus: DeviceStatus,
    public readonly newStatus: DeviceStatus,
  ) {}
}
