import { Module } from '@nestjs/common'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { CartRepo } from 'src/routes/cart/cart.repo'

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepo],
})
export class CartModule {}
