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
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('Các giá trị khai báo trong file .env không hợp lệ')

  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
