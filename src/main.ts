import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. MQTT 마이크로서비스 연결 (환경 변수 사용)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL || 'mqtt://localhost:1883',
      clientId: 'home-iot-server-main', // 고유 ID 추가
    },
  });

  // 2. HTTP 전역 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 3. 마이크로서비스 시작 및 HTTP 서버 가동
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);
  
  console.log(`서버가 가동되었습니다: http://localhost:${process.env.PORT || 3001}`);
  console.log(`MQTT 마이크로서비스 연결 시도 중: ${process.env.MQTT_URL || 'mqtt://localhost:1883'}`);
}
bootstrap();
