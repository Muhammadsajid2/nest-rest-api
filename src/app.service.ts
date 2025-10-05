import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { statusCode: number; message: string } {
    return {
      statusCode: 200,
      message: 'Welcome to TaskHive API',
    };
  }
}
