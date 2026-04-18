import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxdbService {
  private readonly logger = new Logger(InfluxdbService.name);
  private writeApi: WriteApi | null = null;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('INFLUXDB_URL');
    const token = this.config.get<string>('INFLUXDB_TOKEN');
    const org = this.config.get<string>('INFLUXDB_ORG', 'home-iot');
    const bucket = this.config.get<string>('INFLUXDB_BUCKET', 'sensors');

    if (url && token) {
      this.writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, 'ms');
    } else {
      this.logger.warn('InfluxDB 환경변수 미설정 - 센서 데이터 저장 비활성화');
    }
  }

  writeSensorValue(deviceName: string, deviceType: string, value: number, unit: string) {
    if (!this.writeApi) return;

    const point = new Point('sensor_value')
      .tag('device', deviceName)
      .tag('type', deviceType)
      .floatField('value', value)
      .stringField('unit', unit);

    this.writeApi.writePoint(point);
    this.writeApi.flush().catch((err) => this.logger.error('InfluxDB 쓰기 실패', err));
  }
}
