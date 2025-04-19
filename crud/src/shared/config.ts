// Kiểm tra xem có file validation hay chưa?
import { plainToInstance } from 'class-transformer'
import { IsString, validateSync } from 'class-validator'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// Phải có thư viện dotenv để chắc chắn đọc được file .env
config({
  path: path.resolve('.env'),
})

// Kiểm tra xem có file .env hay chưa?
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}

class ConfigSchema {
  @IsString()
  DATABASE_URL: string
  @IsString()
  ACCESS_TOKEN_SECRET: string
  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string
  @IsString()
  REFRESH_TOKEN_SECRET: string
  @IsString()
  REFRESH_TOKEN_EXPIRES_IN: string
}

const configServer = plainToInstance(ConfigSchema, process.env)

const errorsArray = validateSync(configServer)

if (errorsArray.length > 0) {
  console.log('Các giá trị khai báo trong file .env không hợp lệ')
  const errors = errorsArray.map((error) => {
    return {
      property: error.property,
      constraints: error.constraints,
      value: error.value,
    }
  })
  throw errors
}

const envConfig = configServer

export default envConfig
