import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly token: string | undefined;
  private readonly chatId: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.token = this.configService.get<string>('TELEGRAM_TOKEN');
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (this.isConfigured()) {
      this.logger.log('✅ 텔레그램 알림 서비스가 활성화되었습니다.');
    } else {
      this.logger.warn('⚠️ 텔레그램 설정이 완료되지 않았습니다. 알림 기능이 대기 모드입니다.');
    }
  }

  private isConfigured(): boolean {
    return (
      !!this.token && 
      this.token !== 'your_bot_token_here' && 
      !!this.chatId && 
      this.chatId !== 'your_chat_id_here'
    );
  }

  async sendTelegram(message: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug(`[Telegram Skip] 설정 미비로 알림 생략: ${message}`);
      return;
    }

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      );
      this.logger.log(`[Telegram] 메시지 전송 성공: ${message}`);
    } catch (error) {
      this.logger.error(`[Telegram] 메시지 전송 실패: ${error.message}`);
    }
  }
}
