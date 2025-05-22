import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/library'
import { randomInt } from 'crypto'

// Type predicates
export function isUniqueConstraintPrismaError(error: any): error is PrismaClientUnknownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

export function generateOTP(): string {
  return randomInt(100000, 999999).toString()
}
