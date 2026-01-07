import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...')
    // log res header
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    this.logger.log(request.headers)
    // Khu vực này sẽ được thực thi trước khi request được đưa vào controller

    const now = Date.now()
    return next.handle().pipe(
      tap((data) => {
        this.logger.log(`Response status: ${response.statusCode}`, data)
        //
        return console.log(`After... ${Date.now() - now}ms`)
      }),
    )
  }
}
