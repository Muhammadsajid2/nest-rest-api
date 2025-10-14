import { Test, TestingModule } from '@nestjs/testing';
import { PaymentManagementController } from './payment-management.controller';

describe('PaymentManagementController', () => {
  let controller: PaymentManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentManagementController],
    }).compile();

    controller = module.get<PaymentManagementController>(PaymentManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
