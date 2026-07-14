import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../decorators';
import { RegisterDeviceDto, SendNotificationDto } from './dto';
import { PushNotificationService } from './push-notification.service';

@Controller('push-notifications')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  // Public because the phone app has no account; an FCM token identifies the app installation.
  @Post('devices')
  registerDevice(@Body() dto: RegisterDeviceDto) {
    return this.pushNotificationService.registerDevice(dto);
  }

  @Get('devices')
  @UseGuards(AuthGuard('jwt'))
  getDevices() {
    return this.pushNotificationService.getDevices();
  }

  @Get('campaigns')
  @UseGuards(AuthGuard('jwt'))
  getCampaigns() {
    return this.pushNotificationService.getCampaigns();
  }

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  sendNotification(@Body() dto: SendNotificationDto, @CurrentUser() user: any) {
    return this.pushNotificationService.sendNotification(dto, (user._id || user.id).toString());
  }
}
