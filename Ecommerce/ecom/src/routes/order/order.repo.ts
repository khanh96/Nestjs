import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CannotCancelOrderException,
  NotFoundCartItemException,
  OrderNotFoundException,
  OutOfStockSKUException,
  ProductNotFoundException,
  SKUNotBelongToShopException,
} from 'src/routes/order/order.error'
import {
  CancelOrderResType,
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
} from 'src/routes/order/order.model'
import { OrderProducer } from 'src/routes/order/order.producer'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class OrderRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}

  async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
    const { page, limit, status } = query
    const skip = (page - 1) * limit
    const take = limit

    const where: Prisma.OrderWhereInput = {
      userId: userId,
      status: status,
    }
    // Đếm tổng số đơn hàng
    const totalItem$ = this.prismaService.order.count({
      where,
    })

    // Lấy list đơn hàng
    const data$ = this.prismaService.order.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: true,
      },
    })

    const [data, totalItems] = await Promise.all([data$, totalItem$])

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async create(
    userId: number,
    body: CreateOrderBodyType,
  ): Promise<{
    paymentId: number
    orders: CreateOrderResType['data']
  }> {
    // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
    // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
    // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
    // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
    // 5. Tạo order
    // 6. Xóa cartItem
    // 7. Thêm job huỷ thanh toán vào queue

    // 1. flatMap: chuyển từ [{cartItemIds: [1,2,3]}, {cartItemIds: [4,5]}] => [1,2,3,4,5]
    const allBodyCartItemIds = body.flatMap((item) => item.cartItemIds)
    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: { in: allBodyCartItemIds },
        userId: userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    })

    // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
    if (cartItems.length !== allBodyCartItemIds.length) {
      throw NotFoundCartItemException
    }

    // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
    const isOutOfStock = cartItems.some((item) => {
      return item.sku.stock < item.quantity
    })
    if (isOutOfStock) {
      throw OutOfStockSKUException
    }

    // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
    const isExistNotReadyProduct = cartItems.some(
      (item) =>
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        item.sku.product.publishedAt > new Date(),
    )
    if (isExistNotReadyProduct) {
      throw ProductNotFoundException
    }
    // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
    const cartItemMap = new Map<number, (typeof cartItems)[0]>()
    cartItems.forEach((item) => {
      cartItemMap.set(item.id, item)
    })

    const isValidShop = body.every((item) => {
      const bodyCartItemIds = item.cartItemIds
      return bodyCartItemIds.every((cartItemId) => {
        // Nếu đã đến bước này thì cartItem luôn luôn có giá trị
        // Vì chúng ta đã so sánh với allBodyCartItems.length ở trên rồi
        const cartItem = cartItemMap.get(cartItemId)!
        return item.shopId === cartItem.sku.createdById
      })
    })
    if (!isValidShop) {
      throw SKUNotBelongToShopException
    }

    // 5. Tạo order và xóa cartItem trong transaction để đảm bảo tính toàn vẹn dữ liệu
    const [paymentId, orders] = await this.prismaService.$transaction(async (tx) => {
      // Tạo record payment trước
      const payment = await this.prismaService.payment.create({
        data: {
          status: PaymentStatus.PENDING,
        },
      })
      // Tạo từng order
      const orders$ = await Promise.all(
        body.map((item) =>
          tx.order.create({
            data: {
              paymentId: payment.id,
              userId,
              status: OrderStatus.PENDING_PAYMENT,
              receiver: item.receiver,
              createdById: userId,
              shopId: item.shopId,
              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuId: cartItem.sku.id,
                    skuValue: cartItem.sku.value,
                    quantity: cartItem.quantity,
                    productId: cartItem.sku.product.id,
                    productTranslations: cartItem.sku.product.productTranslations.map((translation) => {
                      return {
                        id: translation.id,
                        name: translation.name,
                        description: translation.description,
                        languageId: translation.languageId,
                      }
                    }),
                  }
                }),
              },
              products: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)!
                  return {
                    id: cartItem.sku.product.id,
                  }
                }),
              },
            },
          }),
        ),
      )
      // 6. Xóa cartItem và cập nhật lại số lượng sku
      const cartItem$ = tx.cartItem.deleteMany({
        where: {
          id: {
            in: allBodyCartItemIds,
          },
        },
      })
      // Cập nhật lại số lượng sku
      const sku$ = Promise.all(
        cartItems.map((item) =>
          tx.sKU.update({
            where: {
              id: item.sku.id,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      )
      // 7. Thêm job huỷ thanh toán vào queue
      const addCancelPaymentJob$ = await this.orderProducer.addCancelPaymentJob(payment.id)
      const [orders] = await Promise.all([orders$, cartItem$, sku$, addCancelPaymentJob$])

      return [payment.id, orders]
    })
    return {
      paymentId,
      orders,
    }
  }

  async detail(userId: number, orderid: number): Promise<GetOrderDetailResType> {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderid,
        userId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    })
    if (!order) {
      throw OrderNotFoundException
    }
    return order
  }

  async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
      })
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw CannotCancelOrderException
      }
      const updatedOrder = await this.prismaService.order.update({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        data: {
          status: OrderStatus.CANCELLED,
          updatedById: userId,
        },
      })
      return updatedOrder
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }
}
