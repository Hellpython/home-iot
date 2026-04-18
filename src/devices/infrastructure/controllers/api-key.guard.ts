import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // 환경 변수(.env)에서 API_KEY를 가져와서 비교
    const validKey = this.configService.get<string>('API_KEY', 'my-secret-iot-key');

    if (apiKey !== validKey) {
      throw new UnauthorizedException('유효하지 않은 API Key입니다.');
    }
    return true;
  }
}
