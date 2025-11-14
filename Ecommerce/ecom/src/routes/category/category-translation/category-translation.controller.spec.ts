import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTranslationController } from './category-translation.controller';

describe('CategoryTranslationController', () => {
  let controller: CategoryTranslationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryTranslationController],
    }).compile();

    controller = module.get<CategoryTranslationController>(CategoryTranslationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
