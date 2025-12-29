import { BadRequestException, Injectable } from '@nestjs/common'
import { parse } from 'date-fns'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentProducer } from 'src/routes/payment/payment.producer'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/other.constant'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { OrderIncludeProductSKUSnapshotType } from 'src/shared/models/order.model'
import { MessageResponseType } from 'src/shared/models/response.model'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentProducer: PaymentProducer,
  ) {}

  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]): number {
    return orders.reduce((total, order) => {
      const orderTotal = order.items.reduce((totalPrice, productSku) => {
        return totalPrice + productSku.skuPrice * productSku.quantity
      }, 0)
      return total + orderTotal
    }, 0)
  }

  async receiver(body: WebhookPaymentBodyType): Promise<
    MessageResponseType & {
      userId: number
    }
  > {
    // 1. Thêm thông tin giao dịch vào DB
    // Tham khảo: https://docs.sepay.vn/lap-trinh-webhooks.html
    let amountIn = 0
    let amountOut = 0
    if (body.transferType === 'in') {
      amountIn = body.transferAmount
    } else if (body.transferType === 'out') {
      amountOut = body.transferAmount
    }
    // Kiểm tra giao dịch đã tồn tại chưa. Vì sepay có thể gửi lại nhiều lần cùng một giao dịch. Nếu đã tồn tại thì báo lỗi "Transaction already exists".
    const paymentTransaction = await this.prismaService.paymentTransaction.findUnique({
      where: {
        id: body.id,
      },
    })

    if (paymentTransaction) {
      throw new BadRequestException('Transaction already exists')
    }
    const userId = await this.prismaService.$transaction(async (tx) => {
      // Tạo mới bản ghi giao dịch
      await tx.paymentTransaction.create({
        data: {
          gateway: body.gateway,
          transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
          accountNumber: body.accountNumber,
          subAccount: body.subAccount,
          amountIn,
          amountOut,
          accumulated: body.accumulated,
          code: body.code,
          transactionContent: body.content,
          referenceNumber: body.referenceCode,
          body: body.description,
        },
      })
      // 2. Kiểm tra nội dung chuyển khoản và tổng số tiền có khớp hay không
      const paymentId = body.code
        ? Number(body.code.split(PREFIX_PAYMENT_CODE)[1])
        : Number(body.content?.split(PREFIX_PAYMENT_CODE)[1])
      if (isNaN(paymentId)) {
        throw new BadRequestException('Cannot get payment id from content')
      }
      // Từ paymentId lấy ra danh sách order.
      const payment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: {
          orders: {
            include: {
              items: true,
            },
          },
        },
      })
      if (!payment) {
        throw new BadRequestException(`Cannot find payment with id ${paymentId}`)
      }
      const userId = payment.orders[0].userId
      const { orders } = payment
      // Tính số tiền của payment đó.
      const totalPrice = this.getTotalPrice(orders)
      // Kiểm tra số tiền khớp hay không
      if (totalPrice !== body.transferAmount) {
        throw new BadRequestException(`Price not match, expected ${totalPrice} but got ${body.transferAmount}`)
      }

      // 3. Cập nhật trạng thái payment thành công và các đơn hàng liên quan thành PENDING_PICKUP (nếu tất cả ok)
      await Promise.all([
        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: PaymentStatus.SUCCESS,
          },
        }),
        await tx.order.updateMany({
          where: {
            id: {
              in: orders.map((order) => order.id),
            },
          },
          data: {
            status: OrderStatus.PENDING_PICKUP,
          },
        }),
        this.paymentProducer.removeJob(paymentId),
      ])
      return userId
    })

    return {
      userId: userId,
      message: 'Payment success',
    }
  }
}
