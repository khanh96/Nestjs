import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartItemParamsDTO,
  GetCartResDTO,
  UpdateCartItemBodyDTO,
} from 'src/routes/cart/cart.dto'
import { CartService } from 'src/routes/cart/cart.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { PaginationQueryDTO } from 'src/shared/dto/request.dto'
import { MessageResponseDto } from 'src/shared/dto/response.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  @ZodSerializerDto(GetCartResDTO)
  getCart(@ActiveUser('userId') userId: number, @Query() query: PaginationQueryDTO) {
    return this.cartService.getCart(userId, query)
  }

  @Get('query-raw')
  @ZodSerializerDto(GetCartResDTO)
  getCartQueryRaw(@ActiveUser('userId') userId: number, @Query() query: PaginationQueryDTO) {
    return this.cartService.getCartWithQueryRaw(userId, query)
  }

  @Post()
  @ZodSerializerDto(CartItemDTO)
  addToCart(@Body() body: AddToCartBodyDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.addToCart(userId, body)
  }

  @Put(':cartItemId')
  @ZodSerializerDto(CartItemDTO)
  updateCartItem(@Param() param: GetCartItemParamsDTO, @Body() body: UpdateCartItemBodyDTO) {
    return this.cartService.updateCartItem(param.cartItemId, body)
  }

  @Post('delete')
  @ZodSerializerDto(MessageResponseDto)
  deleteCart(@Body() body: DeleteCartBodyDTO, @ActiveUser('userId') userId: number) {
    return this.cartService.deleteCart(userId, body)
  }
}
