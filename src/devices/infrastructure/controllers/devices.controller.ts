import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DevicesService } from '../../application/devices.service';
import { UpdateDeviceStatusDto } from './dto/update-device-status.dto';
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

  @Post('seed')
  seed() {
    return this.devicesService.createSeedData();
  }
}
