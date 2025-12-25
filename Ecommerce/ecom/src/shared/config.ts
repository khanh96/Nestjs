// Kiểm tra xem có file validation hay chưa?
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import z from 'zod'

// Phải có thư viện dotenv để chắc chắn đọc được file .env
config({
  path: path.resolve('.env'),
})

// Kiểm tra xem có file .env hay chưa?
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  API_KEY: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PHONE: z.string(),
  OTP_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_CLIENT_OAUTH_URL: z.string(),
  PREFIX_STATIC_ENDPOINT: z.string(),
  APP_NAME: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  PAYMENT_API_KEY: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('Các giá trị khai báo trong file .env không hợp lệ')

  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
