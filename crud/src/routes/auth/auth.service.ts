import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(body: { email: string; password: string; name: string }) {
    // Perform registration logic here

    // Hash password if needed
    // Save user to the database
    // Send confirmation email if needed

    // How to hash password
    // import { hash } from 'bcrypt'
    // import { HashingService } from 'src/shared/services/hashing/hashing.service';
    try {
      const hashedPassword = await this.hashingService.hash(body.password)
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      })
      console.log('result,', user)
      return {
        result: user,
        message: 'Register successfully',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        // P2002: Unique constraint failed on the fields: (`email`)
        throw new ConflictException(
          {
            message: 'Email already exists',
          },
          {
            cause: error,
            description: 'Email already exists',
          },
        )
      }
      throw error
    }
  }
}
