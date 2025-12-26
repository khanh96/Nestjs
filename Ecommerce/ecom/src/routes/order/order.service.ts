import { Injectable } from '@nestjs/common'
import { CreateOrderBodyType, GetOrderListQueryType } from 'src/routes/order/order.model'
import { OrderRepo } from 'src/routes/order/order.repo'

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepo) {}

  async list(userId: number, query: GetOrderListQueryType) {
    return this.orderRepository.list(userId, query)
  }

  async create(userId: number, body: CreateOrderBodyType) {
    const result = await this.orderRepository.create(userId, body)
    return {
      data: result.orders,
    }
  }

  cancel(userId: number, orderId: number) {
    return this.orderRepository.cancel(userId, orderId)
  }

  detail(userId: number, orderId: number) {
    return this.orderRepository.detail(userId, orderId)
  }
}
