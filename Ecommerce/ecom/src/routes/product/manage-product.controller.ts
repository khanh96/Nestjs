import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { ManageProductService } from 'src/routes/product/manage-product.service'
import {
  CreateProductBodyDTO,
  GetManageProductsQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/routes/product/product.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

import { AccessTokenPayload } from 'src/shared/types/jwt.type'

// Controller dành cho Admin và Seller
@Controller('manage-product/products')
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetManageProductsQueryDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.manageProductService.list({
      query,
      roleNameRequest: user.roleName,
      userIdRequest: user.userId,
    })
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  @ApiParam({ name: 'productId', type: Number })
  findById(@Param() params: GetProductParamsDTO, @ActiveUser() user: AccessTokenPayload) {
    return this.manageProductService.getDetail({
      productId: params.productId,
      roleNameRequest: user.roleName,
      userIdRequest: user.userId,
    })
  }

  // ERROR: lỗi ở CreateProductBodyDTO
  @Post()
  create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    return this.manageProductService.create({
      data: body,
      createdById: userId,
    })
  }

  // @Put(':productId')
  // @ZodSerializerDto(ProductDTO)
  // @ApiParam({ name: 'productId', type: Number })
  // update(
  //   @Body() body: UpdateProductBodyDTO,
  //   @Param() params: GetProductParamsDTO,
  //   @ActiveUser() user: AccessTokenPayload,
  // ) {
  //   return this.manageProductService.update({
  //     data: body,
  //     productId: params.productId,
  //     updatedById: user.userId,
  //     roleNameRequest: user.roleName,
  //   })
  // }

  // @Delete(':productId')
  // @ZodSerializerDto(MessageResponseDto)
  // @ApiParam({ name: 'productId', type: Number })
  // delete(@Param() params: GetProductParamsDTO, @ActiveUser() user: AccessTokenPayload) {
  //   return this.manageProductService.delete({
  //     productId: params.productId,
  //     deletedById: user.userId,
  //     roleNameRequest: user.roleName,
  //   })
  // }
}
