import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...')
    // Khu vực này sẽ được thực thi trước khi request được đưa vào controller

    const now = Date.now()
    return next.handle().pipe(
      tap(() => {
        //
        return console.log(`After... ${Date.now() - now}ms`)
      }),
    )
  }
}
