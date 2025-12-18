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
    return this.orderRepository.create(userId, body)
  }

  cancel(userId: number, orderId: number) {
    return this.orderRepository.cancel(userId, orderId)
  }

  detail(userId: number, orderId: number) {
    return this.orderRepository.detail(userId, orderId)
  }
}
