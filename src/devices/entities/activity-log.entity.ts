import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceName: string;

  @Column()
  action: string; // '켜짐', '꺼짐', '자동 소등' 등

  @CreateDateColumn()
  timestamp: Date;
}
