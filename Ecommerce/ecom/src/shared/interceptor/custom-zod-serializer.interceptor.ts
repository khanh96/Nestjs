import { CallHandler, ExecutionContext, Injectable, StreamableFile } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { validate, ZodSerializationException, ZodSerializerInterceptor } from 'nestjs-zod'
import { map, Observable } from 'rxjs'
import { MessageKey } from 'src/shared/decorators/message.decorator'

/**
 * file này được sử dụng để xử lý response trả về cho client
 */

const createZodSerializationException = (error) => {
  return new ZodSerializationException(error)
}

@Injectable()
export class CustomZodSerializerInterceptor extends ZodSerializerInterceptor {
  constructor(reflector) {
    super(reflector)
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseSchema = this.getContextResponseSchema(context)
    const statusCode = context.switchToHttp().getResponse().statusCode
    // Lấy message từ decorator chưa xử lý nếu mà controller chưa response về message. [NOTE: có thể có hoặc không]
    const message = (this.reflector as Reflector).get<string | undefined>(MessageKey, context.getHandler()) ?? ''
    // console.log('message =======>', message)
    // Khu vực này sẽ được thực thi trước khi request được xử lý
    return next.handle().pipe(
      // Khu vực này sẽ được thực thi sau khi request được xử lý
      map((res) => {
        // console.log('res', res)
        if (!responseSchema || typeof res !== 'object' || res instanceof StreamableFile) {
          return {
            result: res,
            statusCode,
            message: res.message || message,
          }
        }

        const validatedData = Array.isArray(res)
          ? res.map((item) => validate(item, responseSchema, createZodSerializationException))
          : validate(res, responseSchema, createZodSerializationException)
        // console.log('validatedData', validatedData)
        return {
          result: validatedData,
          statusCode,
          message: res.message || message,
        }
      }),
    )
  }
}
