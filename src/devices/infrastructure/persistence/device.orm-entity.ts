import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceStatus } from '../../domain/device';

@Entity('devices')
export class DeviceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.OFF,
  })
  status: DeviceStatus;

  @Column()
  type: string;

  @Column('float', { nullable: true })
  value: number;

  @Column({ nullable: true })
  unit: string;
}
