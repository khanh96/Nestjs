import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { ServerResponse } from 'http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // Khu vực này sẽ được thực thi trước khi request được xử lý
    return next.handle().pipe(
      // Khu vực này sẽ được thực thi sau khi request được xử lý
      map((data) => {
        const ctx = context.switchToHttp()
        const response = ctx.getResponse<ServerResponse>()
        // console.log(response)
        const statusCode = response.statusCode
        // Nếu data là một mảng thì trả về { data: data }
        // Nếu data là một object thì trả về { data: data }

        return { data, statusCode: statusCode }
      }),
    )
  }
}
