import { Test, TestingModule } from '@nestjs/testing'
import { VerificationCode } from 'src/shared/constants/auth.constant'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { HashingService } from 'src/shared/services/hashing/hashing.service'
import { ShareRoleRepository } from 'src/shared/repositories/role.repo'
import { TokenService } from 'src/shared/services/token/token.service'
import { ShareUserRepository } from 'src/shared/repositories/user.repo'
import { EmailService } from 'src/shared/services/email/email.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa/2fa.service'
import { AuthService } from 'src/routes/auth/auth.service'
import { EmailAlreadyExistsException, InvalidOTPException, OTPExpiredException } from 'src/routes/auth/auth.error'
import { Prisma } from '@prisma/client'

describe('AuthService', () => {
  let authService: AuthService

  const mockAuthRepository = {
    createUser: jest.fn(),
    findUniqueUserIncludeRole: jest.fn(),
    createVerificationCode: jest.fn(),
    findUniqueVerificationCode: jest.fn(),
    deleteVerificationCode: jest.fn(),
    createDevice: jest.fn(),
    updateDevice: jest.fn(),
    createRefreshToken: jest.fn(),
    findUniqueRefreshTokenIncludeUserRole: jest.fn(),
    deleteRefreshToken: jest.fn(),
  }

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  }

  const mockShareRoleRepository = {
    getClientRoleId: jest.fn(),
  }

  const mockTokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  }

  const mockShareUserRepository = {
    findUnique: jest.fn(),
    findUserByEmailIncludeRole: jest.fn(),
    update: jest.fn(),
  }

  const mockEmailService = {
    sendOTP: jest.fn(),
  }

  const mockTwoFactorService = {
    generateTOTPSecret: jest.fn(),
    verifyTOTP: jest.fn(),
  }

  // Tạo module kiểm thử cho mỗi lần test
  beforeEach(async () => {
    // Create the testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
        {
          provide: ShareRoleRepository,
          useValue: mockShareRoleRepository,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: ShareUserRepository,
          useValue: mockShareUserRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: TwoFactorAuthService,
          useValue: mockTwoFactorService,
        },
      ],
    }).compile()

    // Get the AuthService instance from the testing module
    authService = module.get<AuthService>(AuthService)
  })

  // Xóa tất cả các mock sau mỗi lần test
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
  })

  describe('verifyVerificationCode', () => {
    it('should validate verification code successfully', async () => {
      const mockVerificationCode = {
        id: 1,
        email: 'test1@example.com',
        type: VerificationCode.REGISTER,
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        createdAt: new Date(),
      }
      // Mock the repository method
      mockAuthRepository.findUniqueVerificationCode.mockResolvedValue(mockVerificationCode)

      // Use bracket notation to access private method
      const result = await authService['verifyVerificationCode']({
        email: 'test@example.com',
        code: '123456',
        type: VerificationCode.REGISTER,
      })

      // Assert the result
      expect(result).toEqual(mockVerificationCode)
      // Verify that the repository method was called with correct parameters
      expect(mockAuthRepository.findUniqueVerificationCode).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '123456',
        type: VerificationCode.REGISTER,
      })
    })

    it('should throw InvalidOTPException when verification code not found', async () => {
      const mockVerificationCode = {
        id: 1,
        email: 'test1@example.com',
        type: VerificationCode.REGISTER,
        code: '123456',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        createdAt: new Date(),
      }
      mockAuthRepository.findUniqueVerificationCode.mockResolvedValue(mockVerificationCode)

      await expect(
        authService['verifyVerificationCode']({
          email: 'test@example.com',
          code: 'invalid',
          type: VerificationCode.REGISTER,
        }),
      ).rejects.toThrow(InvalidOTPException)
    })

    it('should throw OTPExpiredException when verification code is expired', async () => {
      const expiredVerificationCode = {
        id: 1,
        email: 'test@example.com',
        type: VerificationCode.REGISTER,
        code: '123456',
        expiresAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago (expired)
        createdAt: new Date(),
      }
      mockAuthRepository.findUniqueVerificationCode.mockResolvedValue(expiredVerificationCode)

      await expect(
        authService['verifyVerificationCode']({
          email: 'test@example.com',
          code: '123456',
          type: VerificationCode.REGISTER,
        }),
      ).rejects.toThrow(OTPExpiredException)
    })
  })

  describe('register', () => {
    // Happy path
    it('should register a new user successfully', async () => {
      jest.spyOn(authService as any, 'verifyVerificationCode').mockResolvedValue(null as any)
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '0123456789',
        confirmPassword: 'password123',
        code: '123456',
      }
      const mockUser = {
        id: 1,
        email: registerData.email,
        name: registerData.name,
        phoneNumber: registerData.phoneNumber,
        password: 'hashedPassword',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockShareRoleRepository.getClientRoleId.mockResolvedValue(1)
      mockHashingService.hash.mockResolvedValue('hashedPassword')
      mockAuthRepository.createUser.mockResolvedValue(mockUser)
      mockAuthRepository.deleteVerificationCode.mockResolvedValue(null)
      const result = await authService.register(registerData)
      expect(result).toEqual(mockUser)
      expect(mockHashingService.hash).toHaveBeenCalledWith(registerData.password)
      expect(mockAuthRepository.createUser).toHaveBeenCalled()
      expect(mockAuthRepository.deleteVerificationCode).toHaveBeenCalled()
    })

    it('should throw EmailAlreadyExistsException when email already exists', async () => {
      jest.spyOn(authService as any, 'verifyVerificationCode').mockResolvedValue(null)
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '0123456789',
        confirmPassword: 'password123',
        code: '123456',
      }

      mockShareRoleRepository.getClientRoleId.mockResolvedValue(1)
      mockHashingService.hash.mockResolvedValue('hashedPassword')
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '6.0.0',
      })
      mockAuthRepository.createUser.mockRejectedValue(error)
      mockAuthRepository.deleteVerificationCode.mockResolvedValue(null)
      await expect(authService.register(registerData)).rejects.toBe(EmailAlreadyExistsException)
    })

    it('should throw Error when validation fails', async () => {
      jest.spyOn(authService as any, 'verifyVerificationCode').mockRejectedValue(null as any)
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phoneNumber: '0123456789',
        confirmPassword: 'password123',
        code: '123456',
      }
      await expect(authService.register(registerData)).rejects.toBeDefined()

      // Verify các method phía dưới không được gọi
      expect(mockShareRoleRepository.getClientRoleId).not.toHaveBeenCalled()
      expect(mockHashingService.hash).not.toHaveBeenCalled()
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled()
      expect(mockAuthRepository.deleteVerificationCode).not.toHaveBeenCalled()
    })
  })
})
