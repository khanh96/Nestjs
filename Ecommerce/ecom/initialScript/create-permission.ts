import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { HTTPMethod, RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

const SellerModule = ['AUTH', 'MEDIA', 'MANAGE-PRODUCT', 'PRODUCT-TRANSLATION', 'PROFILE', 'CART', 'ORDERS']
const ClientModule = ['AUTH', 'MEDIA', 'PRODUCT', 'CART', 'PROFILE', 'ORDERS']

const prismaService = new PrismaService()

async function createPermissionScript() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3030)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  // 1. Lấy ra danh sách các permission đã tồn tại trong cơ sở dữ liệu
  const permissionsInDb = await prismaService.permission.findMany({
    where: {
      deletedAt: null,
    },
  })
  // 2. Lấy ra danh sách các route hiện có trong ứng dụng
  const availableRoutes = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = layer.route?.stack[0].method.toUpperCase() as keyof typeof HTTPMethod
        const moduleName = String(path.split('/')[1]).toUpperCase()
        return {
          path: path,
          method: method,
          name: path + ' ' + method,
          module: moduleName,
        }
      }
    })
    .filter((item) => item !== undefined)

  // 3. Tạo object permissionInDbMap với key là [method-path]
  const permissionInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  // 4. Tạo object availableRoutesMap với key là [method-path]
  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}-${item.path}`] = item
    return acc
  }, {})

  // 5. Tìm permissions trong database mà không tồn tại trong availableRoutes
  const permissionsToDelete = permissionsInDb.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`]
  })

  // 6. Xóa permissions không tồn tại trong availableRoutes
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

  // 7. Tìm routes mà không tồn tại trong permissionsInDb
  const routesToAdd = availableRoutes.filter((item) => {
    return !permissionInDbMap[`${item.method}-${item.path}`]
  })

  // 8. Thêm các routes này dưới dạng permissions database
  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prismaService.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true,
    })
    console.log('Added permissions:', permissionsToAdd.count)
  } else {
    console.log('No permissions to add')
  }

  // 9. Lấy lại permissions trong database sau khi thêm mới (hoặc bị xóa)
  const updatedPermissionsInDb = await prismaService.permission.findMany({
    where: {
      deletedAt: null,
    },
  })
  // 10.Cật nhật lại các permissions theo role
  // Admin role
  const adminPermissionIds = updatedPermissionsInDb.map((item) => ({ id: item.id }))

  // Seller role
  const sellerPermissionIds = updatedPermissionsInDb
    .filter((permission) => SellerModule.includes(permission.module))
    .map((item) => ({ id: item.id }))

  // Client role
  const clientPermissionIds = updatedPermissionsInDb
    .filter((permission) => ClientModule.includes(permission.module))
    .map((item) => ({ id: item.id }))

  await Promise.all([
    updateRole(adminPermissionIds, RoleName.ADMIN),
    updateRole(sellerPermissionIds, RoleName.SELLER),
    updateRole(clientPermissionIds, RoleName.CLIENT),
  ])

  process.exit(0)
}

const updateRole = async (permissions: { id: number }[], roleName: string) => {
  const role = await prismaService.role.findFirstOrThrow({
    where: {
      name: roleName,
      deletedAt: null,
    },
  })
  await prismaService.role.update({
    where: {
      id: role.id,
    },
    data: {
      permissions: {
        set: permissions.map((permission) => ({ id: permission.id })),
      },
    },
  })
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
