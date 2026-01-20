import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { ZodSerializationException } from 'nestjs-zod'
import { ZodError as ZodErrorV3 } from 'zod/v3'
import { ZodError as ZodErrorV4 } from 'zod/v4'

// Logging serialization errors using ZodSerializationException
@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('exception', exception)
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError()
      if (zodError instanceof ZodErrorV3) {
        this.logger.error(`ZodSerializationExceptionV3: ${zodError.message}`)
      } else if (zodError instanceof ZodErrorV4) {
        this.logger.error(`ZodSerializationExceptionV4: ${zodError.message}`)
      }
    }

    super.catch(exception, host)
  }
}
