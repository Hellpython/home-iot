import { Device } from '../../domain/device';
import { DeviceOrmEntity } from '../persistence/device.orm-entity';

export class DeviceMapper {
  static toDomain(ormEntity: DeviceOrmEntity): Device {
    return new Device(
      ormEntity.id,
      ormEntity.name,
      ormEntity.status,
      ormEntity.type,
      ormEntity.value ?? undefined, // null/undefined 처리
      ormEntity.unit ?? undefined,
    );
  }

  static toOrm(domain: Device): DeviceOrmEntity {
    const ormEntity = new DeviceOrmEntity();
    if (domain.id) ormEntity.id = domain.id;
    ormEntity.name = domain.name;
    ormEntity.status = domain.status;
    ormEntity.type = domain.type;
    ormEntity.value = domain.value ?? 0; // null 허용 필드이므로 적절한 기본값 또는 null
    ormEntity.unit = domain.unit ?? '';
    return ormEntity;
  }
}
