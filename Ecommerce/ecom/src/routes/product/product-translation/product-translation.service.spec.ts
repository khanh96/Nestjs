import { Test, TestingModule } from '@nestjs/testing';
import { ProductTranslationService } from './product-translation.service';

describe('ProductTranslationService', () => {
  let service: ProductTranslationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductTranslationService],
    }).compile();

    service = module.get<ProductTranslationService>(ProductTranslationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
