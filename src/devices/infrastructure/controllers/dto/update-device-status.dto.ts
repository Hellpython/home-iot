import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeviceStatus } from '../../../domain/device';

export class UpdateDeviceStatusDto {
  @IsEnum(DeviceStatus, { message: '상태값은 ON 또는 OFF여야 합니다.' })
  @IsNotEmpty()
  status: DeviceStatus;
}
