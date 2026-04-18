import { DeviceStatus } from '../../domain/device';

export class UpdateDeviceStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: DeviceStatus,
  ) {}
}
