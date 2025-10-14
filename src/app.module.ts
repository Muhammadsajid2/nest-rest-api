import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { PaymentManagementModule } from './payment-management/payment-management.module';
import { PaymenManagementController } from './paymen-management/paymen-management.controller';
import { PaymentManagementModule } from './payment-management/payment-management.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb+srv://MuhammadSajid:Sajidqw12@personalprojects.8koqt.mongodb.net/TaskHive',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    UsersModule,
    AuthModule,
    TaskModule,
    PaymentManagementModule,
  ],
  controllers: [AppController, PaymenManagementController],
  providers: [AppService],
})
export class AppModule {}
