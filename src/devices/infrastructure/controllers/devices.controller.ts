import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DevicesService } from '../../application/devices.service';
import { UpdateDeviceStatusDto } from './dto/update-device-status.dto';
import { SensorDataDto } from './dto/sensor-data.dto';
import { ApiKeyGuard } from './api-key.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getAllDevices() {
    return this.devicesService.findAll();
  }

  // 최신 활동 로그 조회
  @Get('logs')
  getLogs() {
    return this.devicesService.getRecentLogs();
  }

  @Post(':id/control')
  @UseGuards(ApiKeyGuard)
  controlDevice(
    @Param('id') id: string,
    @Body() updateDeviceStatusDto: UpdateDeviceStatusDto,
  ) {
    return this.devicesService.updateStatus(id, updateDeviceStatusDto.status);
  }

  @Post(':id/value')
  updateValue(
    @Param('id') id: string,
    @Body('value') value: number,
  ) {
    return this.devicesService.updateValue(id, value);
  }

  @Post(':id/sensor-data')
  updateSensorData(
    @Param('id') id: string,
    @Body() sensorDataDto: SensorDataDto,
  ) {
    // 온도 값을 우선적으로 업데이트합니다.
    return this.devicesService.updateValue(id, sensorDataDto.temperature);
  }

  @Post('seed')
  seed() {
    return this.devicesService.createSeedData();
  }
}
