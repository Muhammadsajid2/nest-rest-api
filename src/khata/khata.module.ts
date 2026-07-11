import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { KhataController } from './khata.controller';
import { KhataService } from './khata.service';
import { Khata, KhataSchema } from './schemas/khata.schema';
import { KhataActivity, KhataActivitySchema } from './schemas/khata-activity.schema';
import { KhataTransaction, KhataTransactionSchema } from './schemas/khata-transaction.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Khata.name, schema: KhataSchema },
      { name: KhataTransaction.name, schema: KhataTransactionSchema },
      { name: KhataActivity.name, schema: KhataActivitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [KhataController],
  providers: [KhataService],
})
export class KhataModule {}
