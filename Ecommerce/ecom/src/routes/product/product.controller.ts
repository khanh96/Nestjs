import { Body, Controller, Get, Param, Query } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { ZodSerializerDto } from 'nestjs-zod'
import { throttle } from 'rxjs'
import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
} from 'src/routes/product/product.dto'
import { ProductService } from 'src/routes/product/product.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

// Controller dành cho client và guest
@IsPublic()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @SkipThrottle({ short: true, long: true })
  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  async list(@Query() query: GetProductsQueryDTO) {
    const result = await this.productService.list({
      query,
    })
    return {
      ...result,
      message: 'Get products successfully',
    }
  }

  @SkipThrottle({ short: true, long: false })
  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  @ApiParam({ name: 'productId', type: Number })
  findById(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail({
      productId: params.productId,
    })
  }
}
