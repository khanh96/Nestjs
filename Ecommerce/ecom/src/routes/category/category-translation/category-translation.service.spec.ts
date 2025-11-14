import { Test, TestingModule } from '@nestjs/testing';
import { CategoryTranslationService } from './category-translation.service';

describe('CategoryTranslationService', () => {
  let service: CategoryTranslationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryTranslationService],
    }).compile();

    service = module.get<CategoryTranslationService>(CategoryTranslationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
