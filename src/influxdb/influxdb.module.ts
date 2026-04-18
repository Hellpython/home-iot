import { Global, Module } from '@nestjs/common';
import { InfluxdbService } from './influxdb.service';

@Global()
@Module({
  providers: [InfluxdbService],
  exports: [InfluxdbService],
})
export class InfluxdbModule {}
