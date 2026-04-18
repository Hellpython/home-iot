import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateDeviceStatusCommand } from '../../commands/update-device-status.command';
import { DeviceStatusChangedEvent } from '../../events/device-status-changed.event';
import { DEVICE_REPOSITORY_PORT } from "../../ports/device-repository.port";
import type { DeviceRepositoryPort } from '../../ports/device-repository.port';

@CommandHandler(UpdateDeviceStatusCommand)
export class UpdateDeviceStatusHandler implements ICommandHandler<UpdateDeviceStatusCommand> {
  constructor(
    @Inject('DeviceRepository')
    private readonly deviceRepository: DeviceRepositoryPort, // 포트 주입
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateDeviceStatusCommand) {
    const { id, status } = command;
    const device = await this.deviceRepository.findById(id);
    
    if (!device) {
      throw new NotFoundException(`장치를 찾을 수 없습니다: ${id}`);
    }

    const oldStatus = device.status;
    device.updateStatus(status); // 도메인 로직 호출
    const updatedDevice = await this.deviceRepository.save(device);

    this.eventBus.publish(
      new DeviceStatusChangedEvent(
        updatedDevice.id,
        updatedDevice.name,
        oldStatus,
        status,
      ),
    );

    return updatedDevice;
  }
}
