import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cert, getApps, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { Model } from 'mongoose';
import { IPaginationQueryParams } from '../decorators';
import { RegisterDeviceDto, SendNotificationDto } from './dto';
import { FcmDevice, FcmDeviceDocument } from './schemas/fcm-device.schema';
import { NotificationCampaign, NotificationCampaignDocument } from './schemas/notification-campaign.schema';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    @InjectModel(FcmDevice.name) private readonly deviceModel: Model<FcmDeviceDocument>,
    @InjectModel(NotificationCampaign.name) private readonly campaignModel: Model<NotificationCampaignDocument>,
  ) {}

  private isFirebaseConfigured() {
    return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  private messaging(): Messaging {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!rawServiceAccount) {
      throw new ServiceUnavailableException('Firebase push notifications are not configured');
    }

    try {
      if (!getApps().length) {
        initializeApp({ credential: cert(JSON.parse(rawServiceAccount) as ServiceAccount) });
      }
      return getMessaging();
    } catch (error) {
      this.logger.error('Unable to initialize Firebase Admin', error);
      throw new ServiceUnavailableException('Firebase push notifications are not configured correctly');
    }
  }

  async registerDevice(dto: RegisterDeviceDto) {
    const device = await this.deviceModel.findOneAndUpdate(
      { token: dto.token },
      { ...dto, enabled: true, lastSeenAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    // Topic membership allows a single broadcast to every opted-in app instance.
    if (this.isFirebaseConfigured()) {
      try {
        await this.messaging().subscribeToTopic([dto.token], 'all_devices');
      } catch (error) {
        this.logger.warn(`Unable to subscribe device ${device._id} to all_devices`);
      }
    }

    return { id: device._id, enabled: device.enabled, topic: 'all_devices' };
  }

  async getDevices({ limit, offset }: IPaginationQueryParams) {
    const [data, total] = await Promise.all([
      this.deviceModel
      .find()
      .select('_id deviceId platform deviceName appVersion enabled lastSeenAt createdAt')
      .skip(offset)
      .limit(limit)
      .sort({ lastSeenAt: -1 })
      .lean(),
      this.deviceModel.countDocuments(),
    ]);

    return {
      data,
      total,
      currentPageSize: data.length,
      hasNextPage: offset + data.length < total,
      hasPreviousPage: offset > 0,
      pageNumber: Math.floor(offset / limit) + 1,
    };
  }

  async getCampaigns({ limit, offset }: IPaginationQueryParams) {
    const [data, total] = await Promise.all([
      this.campaignModel
        .find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.campaignModel.countDocuments(),
    ]);

    return {
      data,
      total,
      currentPageSize: data.length,
      hasNextPage: offset + data.length < total,
      hasPreviousPage: offset > 0,
      pageNumber: Math.floor(offset / limit) + 1,
    };
  }

  async sendNotification(dto: SendNotificationDto, createdBy: string) {
    const messaging = this.messaging();
    const data = Object.fromEntries(
      Object.entries(dto.data || {}).map(([key, value]) => [key, String(value)]),
    );
    const notification = { title: dto.title, body: dto.body, ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}) };
    let targetedDeviceCount = 0;
    let sentCount = 0;
    let failureCount = 0;

    if (dto.targetType === 'all') {
      await messaging.send({ topic: 'all_devices', notification, data });
      sentCount = 1;
    } else if (dto.targetType === 'topic') {
      if (!dto.topic?.trim()) throw new BadRequestException('A topic is required');
      await messaging.send({ topic: dto.topic.trim(), notification, data });
      sentCount = 1;
    } else {
      if (!dto.deviceIds?.length) throw new BadRequestException('Select at least one device');
      const devices = await this.deviceModel.find({ _id: { $in: dto.deviceIds }, enabled: true }).lean();
      if (!devices.length) throw new BadRequestException('No enabled devices were selected');
      targetedDeviceCount = devices.length;
      const invalidTokens: string[] = [];

      for (let index = 0; index < devices.length; index += 500) {
        const batch = devices.slice(index, index + 500);
        const response = await messaging.sendEachForMulticast({ tokens: batch.map((device) => device.token), notification, data });
        sentCount += response.successCount;
        failureCount += response.failureCount;
        response.responses.forEach((result, resultIndex) => {
          const code = result.error?.code;
          if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
            invalidTokens.push(batch[resultIndex].token);
          }
        });
      }

      if (invalidTokens.length) {
        await this.deviceModel.updateMany({ token: { $in: invalidTokens } }, { enabled: false });
      }
    }

    return this.campaignModel.create({
      title: dto.title,
      body: dto.body,
      targetType: dto.targetType,
      topic: dto.targetType === 'all' ? 'all_devices' : dto.topic?.trim(),
      imageUrl: dto.imageUrl,
      data,
      targetedDeviceCount,
      sentCount,
      failureCount,
      createdBy,
    });
  }
}
