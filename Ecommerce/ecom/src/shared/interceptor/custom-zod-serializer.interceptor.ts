import { CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ZodSerializationException } from 'nestjs-zod'
import { map, Observable } from 'rxjs'
import { MessageKey } from 'src/shared/decorators/message.decorator'
import { ZodSchema } from 'zod'

/**
 * file này được sử dụng để xử lý response trả về cho client
 */

const ZOD_SERIALIZER_DTO_OPTIONS = 'ZOD_SERIALIZER_DTO_OPTIONS'

interface ZodDtoStatic {
  zodSchema?: ZodSchema
  isZodDto?: boolean
}

const createZodSerializationException = (error) => {
  return new ZodSerializationException(error)
}

@Injectable()
export class CustomZodSerializerInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Bỏ qua interceptor cho GraphQL requests
    const gqlContext = GqlExecutionContext.create(context)
    if (gqlContext.getType<string>() === 'graphql') {
      return next.handle()
    }

    const responseSchema = this.getContextResponseSchema(context)
    // console.log('responseSchema', responseSchema)
    const statusCode = context.switchToHttp().getResponse().statusCode
    // Lấy message từ decorator chưa xử lý nếu mà controller chưa response về message. [NOTE: có thể có hoặc không]
    const message = this.reflector.get<string | undefined>(MessageKey, context.getHandler()) ?? ''
    // console.log('message =======>', message)
    // Khu vực này sẽ được thực thi trước khi request được xử lý
    return next.handle().pipe(
      // Khu vực này sẽ được thực thi sau khi request được xử lý
      map((res) => {
        // console.log('res', res)
        if (!responseSchema || typeof res !== 'object' || res instanceof StreamableFile) {
          const { message: resMessage, ...restData } = res || {}
          return {
            result: restData,
            statusCode,
            message: resMessage || message,
          }
        }
        const validatedData = Array.isArray(res)
          ? res.map((item) => this.validateData(item, responseSchema))
          : this.validateData(res, responseSchema)
        console.log('validatedData', validatedData)
        return {
          result: validatedData,
          statusCode,
          message: res?.message || message,
        }
      }),
    )
  }

  private getContextResponseSchema(context: ExecutionContext): ZodSchema | null {
    // Lấy schema từ decorator @ZodSerializerDto
    const dtoOrSchema = this.reflector.get(ZOD_SERIALIZER_DTO_OPTIONS, context.getHandler())

    if (!dtoOrSchema) {
      return null
    }

    // Nếu là array [Dto] - unwrap array
    const unwrapped = Array.isArray(dtoOrSchema) ? dtoOrSchema[0] : dtoOrSchema

    // Kiểm tra xem có phải là ZodDto class hay ZodSchema trực tiếp
    if (typeof unwrapped === 'function') {
      const dto = unwrapped as ZodDtoStatic
      return dto.zodSchema || null
    }

    // Nếu là ZodSchema trực tiếp
    if (unwrapped && typeof unwrapped === 'object' && '_def' in unwrapped) {
      return unwrapped as ZodSchema
    }

    return null
  }

  private validateData(data: unknown, schema: ZodSchema): unknown {
    try {
      return schema.parse(data)
    } catch (error) {
      throw createZodSerializationException(error)
    }
  }
}
