import { BadGatewayException, HttpStatus, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

export const InvalidOTPException = new UnprocessableEntityException(
  [
    {
      message: 'Invalid OTP code',
      path: 'code',
    },
  ],
  {
    cause: new Error('Invalid OTP code'),
    description: 'Invalid OTP code',
  },
)

export const OTPExpiredException = new UnprocessableEntityException([
  {
    message: 'OTP code has expired',
    path: 'code',
  },
])

export const EmailAlreadyExistsException = new UnprocessableEntityException(
  [
    {
      message: 'Email already exists',
      path: 'email',
    },
  ],
  {
    cause: new Error('Email already exists'),
    description: 'Email already exists',
  },
)

export const SendOtpFailedException = new BadGatewayException({
  message: 'Send OTP failed',
  status: HttpStatus.BAD_GATEWAY,
})

export const InvalidRefreshTokenException = new UnauthorizedException({
  message: 'Invalid refresh token',
})

export const AccountNotExistException = new UnauthorizedException(
  {
    message: 'Account does not exist',
  },
  {
    cause: new Error('Account does not exist'),
    description: 'Account does not exist',
  },
)

export const PasswordIncorrectException = new UnprocessableEntityException([
  {
    message: 'Password is incorrect',
    path: 'password',
  },
])
