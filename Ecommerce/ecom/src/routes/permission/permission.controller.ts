import { Controller, Query } from '@nestjs/common'
import { Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreatePermissionBodyDTO,
  GetPermissionsDetailResDTO,
  GetPermissionsParamsDTO,
  GetPermissionsQueryDTO,
  GetPermissionsResDTO,
  UpdatePermissionBodyDTO,
} from 'src/routes/permission/permission.dto'
import { PermissionService } from 'src/routes/permission/permission.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(GetPermissionsResDTO)
  findAll(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.list({
      page: query.page,
      limit: query.limit,
    })
  }

  @Get(':permissionId')
  @ZodSerializerDto(GetPermissionsDetailResDTO)
  findOne(@Param() params: GetPermissionsParamsDTO) {
    return this.permissionService.findById(params.permissionId)
  }

  @Post()
  @ZodSerializerDto(GetPermissionsDetailResDTO)
  create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':permissionId')
  @ZodSerializerDto(GetPermissionsDetailResDTO)
  update(
    @Body() body: UpdatePermissionBodyDTO,
    @Param() params: GetPermissionsParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.update({
      id: params.permissionId,
      updatedById: userId,
      data: body,
    })
  }

  @Delete(':permissionId')
  @ZodSerializerDto(MessageResponseDto)
  remove(@Param() params: GetPermissionsParamsDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.delete({
      id: params.permissionId,
      deletedById: userId,
    })
  }
}
