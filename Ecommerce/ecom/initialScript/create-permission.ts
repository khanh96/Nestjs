import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { HTTPMethod, RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

const prismaService = new PrismaService()

async function createPermissionScript() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3030)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  // Lấy ra danh sách các permission đã tồn tại trong cơ sở dữ liệu
  const permissionsInDb = await prismaService.permission.findMany({
    where: {
      deletedAt: null,
    },
  })
  // Lấy ra danh sách các route hiện có trong ứng dụng
  const availableRoutes = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = layer.route?.stack[0].method.toUpperCase() as keyof typeof HTTPMethod
        return {
          path: path,
          method: method,
          name: path + ' ' + method,
        }
      }
    })
    .filter((item) => item !== undefined)

  // Tạo object permissionInDbMap với key là [method-path]
  const permissionInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  // Tạo object availableRoutesMap với key là [method-path]
  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  // Tìm permissions trong database mà không tồn tại trong availableRoutes
  const permissionsToDelete = permissionsInDb.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`]
  })

  // Xóa permissions không tồn tại trong availableRoutes
  if (permissionsToDelete.length > 0) {
    const deleteResult = await prismaService.permission.deleteMany({
      where: {
        id: {
          in: permissionsToDelete.map((item) => item.id),
        },
      },
    })
    console.log('Deleted permissions:', deleteResult.count)
  } else {
    console.log('No permissions to delete')
  }

  // Tìm routes mà không tồn tại trong permissionsInDb
  const routesToAdd = availableRoutes.filter((item) => {
    return !permissionInDbMap[`${item.method}-${item.path}`]
  })

  // Thêm các routes này dưới dạng permissions database
  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prismaService.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true,
    })
    console.log('Added permissions:', permissionsToAdd.count)
  } else {
    console.log('No permissions to add')
  }

  // Lấy lại permissions trong database sau khi thêm mới (hoặc bị xóa)
  const updatedPermissionsInDb = await prismaService.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  // Cật nhật lại các permissions trong Admin role
  const adminRole = await prismaService.role.findFirstOrThrow({
    where: {
      name: RoleName.ADMIN,
      deletedAt: null,
    },
  })
  await prismaService.role.update({
    where: {
      id: adminRole.id,
    },
    data: {
      permissions: {
        set: updatedPermissionsInDb.map((permission) => ({ id: permission.id })),
      },
    },
  })

  process.exit(0)
}
createPermissionScript()
  .then((res) => {
    console.log('res->', res)
    console.log('Permission creation script completed successfully.')
  })
  .catch((err) => {
    console.log('Error during permission creation script:')
    console.error(err)
  })
