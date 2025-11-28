import { Test, TestingModule } from '@nestjs/testing';
import { ProductTranslationController } from './product-translation.controller';

describe('ProductTranslationController', () => {
  let controller: ProductTranslationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTranslationController],
    }).compile();

    controller = module.get<ProductTranslationController>(ProductTranslationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
