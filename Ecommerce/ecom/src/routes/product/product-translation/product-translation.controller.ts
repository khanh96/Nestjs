import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodyDTO,
  GetProductTranslationDetailResDTO,
  GetProductTranslationParamsDTO,
  UpdateProductTranslationBodyDTO,
} from 'src/routes/product/product-translation/product-translation.dto'
import { ProductTranslationService } from 'src/routes/product/product-translation/product-translation.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('product-translations')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Get(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  @ApiParam({ name: 'productTranslationId', type: Number })
  findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  create(@Body() body: CreateProductTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  @ApiParam({ name: 'productTranslationId', type: Number })
  update(
    @Body() body: UpdateProductTranslationBodyDTO,
    @Param() params: GetProductTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.update({
      data: body,
      id: params.productTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':productTranslationId')
  @ZodSerializerDto(MessageResponseDto)
  @ApiParam({ name: 'productTranslationId', type: Number })
  delete(@Param() params: GetProductTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.delete({
      id: params.productTranslationId,
      deletedById: userId,
    })
  }
}
