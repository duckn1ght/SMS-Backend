import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendPushDto } from './dto/send-push.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('push')
  async sendPush(@Body() dto: SendPushDto) {
    return await this.notificationService.sendPush(dto.userId, dto.title, dto.body);
  }
}
