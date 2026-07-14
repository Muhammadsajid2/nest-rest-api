import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { FcmDevice, FcmDeviceSchema } from './schemas/fcm-device.schema';
import { NotificationCampaign, NotificationCampaignSchema } from './schemas/notification-campaign.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: FcmDevice.name, schema: FcmDeviceSchema },
      { name: NotificationCampaign.name, schema: NotificationCampaignSchema },
    ]),
  ],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
})
export class PushNotificationModule {}
