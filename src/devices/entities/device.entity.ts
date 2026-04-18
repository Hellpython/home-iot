import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum DeviceStatus {
  ON = 'ON',
  OFF = 'OFF',
}

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: DeviceStatus,
    default: DeviceStatus.OFF,
  })
  status: DeviceStatus;

  @Column({ default: 'unknown' })
  type: string; // light, sensor, ac, etc.

  // 측정값 (예: 온도 24.5)
  @Column({ type: 'float', nullable: true })
  value: number;

  // 단위 (예: °C, %)
  @Column({ nullable: true })
  unit: string;
}
