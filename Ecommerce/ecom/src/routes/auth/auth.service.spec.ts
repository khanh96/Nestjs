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
import { InvalidOTPException, OTPExpiredException } from 'src/routes/auth/auth.error'

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
})
