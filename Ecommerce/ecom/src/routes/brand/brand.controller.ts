import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiParam } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateBrandBodyDTO,
  GetBrandDetailResDTO,
  GetBrandParamsDTO,
  GetBrandsResDTO,
  UpdateBrandBodyDTO,
} from 'src/routes/brand/brand.dto'
import { BrandService } from 'src/routes/brand/brand.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { PaginationQueryDTO } from 'src/shared/dto/request.dto'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetBrandsResDTO)
  list(@Query() query: PaginationQueryDTO) {
    return this.brandService.list(query)
  }

  @Get(':brandId')
  @IsPublic()
  @ZodSerializerDto(GetBrandDetailResDTO)
  @ApiParam({ name: 'brandId', type: Number })
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params.brandId)
  }

  @Post()
  @ZodSerializerDto(GetBrandDetailResDTO)
  create(@Body() body: CreateBrandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':brandId')
  @ZodSerializerDto(GetBrandDetailResDTO)
  @ApiParam({ name: 'brandId', type: Number })
  update(@Body() body: UpdateBrandBodyDTO, @Param() params: GetBrandParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.update({
      data: body,
      id: params.brandId,
      updatedById: userId,
    })
  }

  @Delete(':brandId')
  @ZodSerializerDto(MessageResponseDto)
  @ApiParam({ name: 'brandId', type: Number })
  delete(@Param() params: GetBrandParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.delete({
      id: params.brandId,
      deletedById: userId,
    })
  }
}
