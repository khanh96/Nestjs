// Seed data

import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

const prismaService = new PrismaService()
const hashingService = new HashingService()
prismaService.$connect()

const main = async () => {
  // Check if the database is empty
  const countRoles = await prismaService.role.count()
  if (countRoles > 0) {
    console.log('Database already has data. Skipping seeding.')
    throw new Error('Database already has data. Skipping seeding.')
  }
  console.log('Seeding data...')
  const roles = await prismaService.role.createMany({
    data: [
      {
        name: RoleName.ADMIN,
        description: 'Admin role',
      },
      {
        name: RoleName.CLIENT,
        description: 'Client role',
      },
      {
        name: RoleName.SELLER,
        description: 'Seller role',
      },
    ],
  })

  const adminRole = await prismaService.role.findFirstOrThrow({
    where: {
      name: RoleName.ADMIN,
    },
  })

  const hashingPass = await hashingService.hash(envConfig.ADMIN_PASSWORD)

  const user = await prismaService.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashingPass,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE,
      roleId: adminRole.id,
    },
  })
  return {
    message: 'Seeding data successfully',
    rolesCount: roles.count,
    user,
  }
}

main()
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.log('Seeding data failed')
    console.error(err)
  })
