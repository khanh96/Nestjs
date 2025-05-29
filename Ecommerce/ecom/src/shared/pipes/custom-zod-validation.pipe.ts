import { HttpStatus, UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

/**
 * Sử dụng file này để tạo một pipe tùy chỉnh cấu trúc lỗi trả về client khi lỗi là 422 (UnprocessableEntityException)
 * 422 là lỗi việc dữ liệu không hợp lệ, không thể xử lý được
 */
// Custom Zod validation pipe for handling validation errors
// Sử dụng createZodValidationPipe để tạo một pipe tùy chỉnh cho việc xác thực dữ liệu
const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    console.log('ZodError=>', error)
    // create custom error message
    // for each error in the ZodError
    const errors = error.errors.map((e) => {
      return {
        field: e.path.join('.'),
        message: e.message,
      }
    })
    // TODO: Còn phải validate lỗi cho chính xác các message
    const customError = {
      data: {
        errors: errors,
      },
      message: 'Validation failed',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }
    return new UnprocessableEntityException(customError)
  },
})

export default CustomZodValidationPipe
