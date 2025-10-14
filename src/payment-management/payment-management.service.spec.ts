import { Test, TestingModule } from '@nestjs/testing';
import { PaymentManagementService } from './payment-management.service';

describe('PaymentManagementService', () => {
  let service: PaymentManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentManagementService],
    }).compile();

    service = module.get<PaymentManagementService>(PaymentManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
