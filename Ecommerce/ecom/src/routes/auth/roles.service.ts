import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null
  constructor(private readonly prismaService: PrismaService) {}

  // sử dụng method này để lấy roleId của client
  // vì trong db có thể có nhiều role khác nhau
  // nên cần phải lấy đúng roleId của client
  // nếu đã lấy rồi thì không cần phải gọi lại nữa
  // nếu chưa lấy thì gọi lại
  // và lưu vào biến clientRoleId
  // để lần sau không cần phải gọi lại nữa
  async getClientRoleId(): Promise<number> {
    console.log('get clientRoleId')
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    console.log('query get roleID')
    console.log('clientRoleId', this.clientRoleId)
    // Fetch the role ID from the database or any other source
    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: RoleName.CLIENT,
      },
    })
    this.clientRoleId = role.id
    return role.id
  }
}
