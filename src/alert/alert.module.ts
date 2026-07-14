import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertController } from './alert.controller';
import { AlertRepository } from './alert.repository';
import { AlertService } from './alert.service';
import { Alert, AlertSchema } from './schemas/alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]),
  ],
  controllers: [AlertController],
  providers: [AlertService, AlertRepository],
  exports: [AlertService, AlertRepository],
})
export class AlertModule {}
