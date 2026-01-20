import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from 'src/generated/prisma/client'
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
  UpdateStatusOrderBodyType,
} from 'src/routes/order/order.model'
import { OrderProducer } from 'src/routes/order/order.producer'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { VersionConflictException } from 'src/shared/error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { redlock } from 'src/shared/redis/redis'
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
    } as any
  }

  async create(
    userId: number,
    body: CreateOrderBodyType,
  ): Promise<{
    paymentId: number
    orders: CreateOrderResType['orders']
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
    const cartItemsForSKUId = await this.prismaService.cartItem.findMany({
      where: {
        id: { in: allBodyCartItemIds },
        userId: userId,
      },
      select: {
        skuId: true,
      },
    })

    const skuIds = cartItemsForSKUId.map((cartItem) => cartItem.skuId)

    // Khóa các SKU để tránh tình trạng oversell
    const locks = await Promise.all(
      skuIds.map((skuId) => {
        return redlock.acquire([`lock:sku:${skuId}`], 3000) // Giữ lock trong 3 giây
      }),
    )

    try {
      const [paymentId, orders] = await this.prismaService.$transaction(async (tx) => {
        // Sử dụng FOR UPDATE để khóa dòng (kỹ thuật Pessimistic lock trong SQL chỉ hoạt động trong transaction)
        // await tx.$queryRaw`SELECT * FROM "SKU" WHERE id IN (${Prisma.join(skuIds)}) FOR UPDATE`

        // Lấy thông tin chi tiết của cart items
        const cartItems = await tx.cartItem.findMany({
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

        // Tạo record payment trước
        const payment = await tx.payment.create({
          data: {
            status: PaymentStatus.PENDING,
          },
        })
        // Tạo từng order
        const orders: CreateOrderResType['orders'] = []
        for (const item of body) {
          const order = (await tx.order.create({
            data: {
              userId,
              status: OrderStatus.PENDING_PAYMENT,
              receiver: item.receiver,
              createdById: userId,
              shopId: item.shopId,
              paymentId: payment.id,
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
          })) as any
          orders.push(order)
        }

        // 6. Xóa cartItem và cập nhật lại số lượng sku
        await tx.cartItem.deleteMany({
          where: {
            id: {
              in: allBodyCartItemIds,
            },
          },
        })
        // Cập nhật lại số lượng sku
        for (const item of cartItems) {
          await tx.sKU
            .update({
              where: {
                id: item.sku.id,
                updatedAt: item.sku.updatedAt, // Sử dụng optimistic lock để tránh tình trạng oversell . Đảm bảo không có ai cập nhật SKU trong khi chúng ta đang xử lý
                stock: { gte: item.quantity }, // Đảm bảo số lượng tồn kho đủ để trừ
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
            // Sử dụng optimistic lock để tránh tình trạng oversell
            .catch((e) => {
              if (isNotFoundPrismaError(e)) {
                throw VersionConflictException
              }
              throw e
            })
        }

        // 7. Thêm job huỷ thanh toán vào queue
        await this.orderProducer.addCancelPaymentJob(payment.id)
        return [payment.id, orders]
      })
      return {
        paymentId,
        orders,
      }
    } finally {
      // Giải phóng tất cả các khoá
      await Promise.all(locks.map((lock) => lock.release().catch(() => {})))
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
    return order as any
  }

  async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        include: {
          items: true,
        },
      })
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw CannotCancelOrderException
      }

      const updatedOrder = await this.prismaService.$transaction(async (tx) => {
        // Update order status to cancelled
        const updatedOrder = await tx.order.update({
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

        // Restore stock for cancelled order items
        await Promise.all(
          order.items
            .filter((item) => item.skuId !== null)
            .map((item) =>
              tx.sKU.update({
                where: {
                  id: item.skuId!,
                },
                data: {
                  stock: {
                    increment: item.quantity, // Restore stock for cancelled orders
                  },
                },
              }),
            ),
        )

        return updatedOrder
      })

      return updatedOrder as any
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }

  async updateStatus(userId: number, orderId: number, body: UpdateStatusOrderBodyType) {
    const updatedOrder = await this.prismaService.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
          userId: body.userId,
          deletedAt: null,
        },
        include: {
          items: true,
        },
      })
      if (!order) {
        throw OrderNotFoundException
      }

      // Update order status

      // Handle stock updates based on order status
      if (body.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException('Only DELIVERED status is supported for stock update')
      }

      const updateStatusOrder$ = (await tx.order.update({
        where: {
          id: orderId,
          userId: body.userId,
          deletedAt: null,
        },
        data: {
          status: body.status,
          updatedById: userId,
        },
      })) as any

      const sku$ = Promise.all(
        order.items.map((item) =>
          tx.sKU.update({
            where: {
              id: item.skuId!,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      )
      const [item] = await Promise.all([updateStatusOrder$, sku$])
      return item
    })
    return updatedOrder
  }
}
