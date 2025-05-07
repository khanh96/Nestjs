import { UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

// Custom Zod validation pipe for handling validation errors
// Sử dụng createZodValidationPipe để tạo một pipe tùy chỉnh cho việc xác thực dữ liệu
const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    // create custom error message
    // for each error in the ZodError
    const errors = error.errors.map((e) => {
      return {
        field: e.path.join('.'),
        message: e.message,
      }
    })
    return new UnprocessableEntityException({ errors: errors })
  },
})

export default CustomZodValidationPipe
