// import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/library'
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/client'
import { randomInt } from 'crypto'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Type predicates
export function isUniqueConstraintPrismaError(error: any): error is PrismaClientUnknownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isNotFoundPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

export function isForeignKeyConstraintPrismaError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2003'
}

// generate

export function generateOTP(): string {
  return randomInt(100000, 999999).toString()
}

export const generateRandomFilename = (filename: string) => {
  const ext = path.extname(filename)
  return `${uuidv4()}${ext}`
}

export const generateCancelPaymentJobId = (paymentId: number) => {
  return `paymentId-${paymentId}`
}

export const generateRoomUserId = (userId: number) => {
  return `userId-${userId}`
}

export const generateCacheKeyRole = (roleId: number) => {
  return `role:${roleId}`
}
