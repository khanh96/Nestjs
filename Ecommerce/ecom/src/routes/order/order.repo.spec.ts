import { Test, TestingModule } from '@nestjs/testing'
import { OrderProducer } from 'src/routes/order/order.producer'
import { OrderRepo } from 'src/routes/order/order.repo'
import { OrderStatus } from 'src/shared/constants/order.constant'
import { PaymentStatus } from 'src/shared/constants/payment.constant'
import { redlock } from 'src/shared/redis/redis'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

// Cách mocks cho redis và redlock từ thư viện bên ngoài vào test jest
jest.mock('src/shared/redis/redis', () => {
  return {
    redlock: {
      acquire: jest.fn(),
    },
  }
})
const mockLock = {
  release: jest.fn().mockResolvedValue({}),
}

describe('OrderRepository', () => {
  let orderRepo: OrderRepo

  const mockPrismaService = {
    $transaction: jest.fn(),
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockOrderProducer = {
    addCancelPaymentJob: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepo,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: OrderProducer,
          useValue: mockOrderProducer,
        },
      ],
    }).compile()

    // Get the OrderRepo instance from the testing module
    orderRepo = module.get<OrderRepo>(OrderRepo)
    // Mock redlock acquire method
    ;(redlock.acquire as jest.Mock).mockResolvedValue(mockLock)
  })

  // Xóa tất cả các mock sau mỗi lần test
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(orderRepo).toBeDefined()
  })

  describe('create', () => {
    const userId = 1
    const createOrderBody = [
      {
        shopId: 1,
        cartItemIds: [1, 2],
        receiver: {
          name: 'Test User',
          phone: '0123456789',
          address: 'Test Address',
        },
      },
    ]
    const mockCartItemsForSKUId = [
      {
        skuId: 1,
      },
      {
        skuId: 2,
      },
    ]
    const mockCartItems = [
      {
        id: 1,
        skuId: 1,
        quantity: 2,
        userId: 1,
        sku: {
          id: 1,
          stock: 10,
          price: 100000,
          image: 'image1.jpg',
          value: 'Red-M',
          createdById: 1,
          updatedAt: new Date('2024-01-01'),
          product: {
            id: 1,
            name: 'Product 1',
            deletedAt: null,
            publishedAt: new Date('2024-01-01'),
            productTranslations: [
              {
                id: 1,
                name: 'Product 1',
                description: 'Description 1',
                languageId: 1,
              },
            ],
          },
        },
      },
      {
        id: 2,
        skuId: 2,
        quantity: 1,
        userId: 1,
        sku: {
          id: 2,
          stock: 5,
          price: 200000,
          image: 'image2.jpg',
          value: 'Blue-L',
          createdById: 1,
          updatedAt: new Date('2024-01-01'),
          product: {
            id: 2,
            name: 'Product 2',
            deletedAt: null,
            publishedAt: new Date('2024-01-01'),
            productTranslations: [
              {
                id: 2,
                name: 'Product 2',
                description: 'Description 2',
                languageId: 1,
              },
            ],
          },
        },
      },
    ]
    const mockPayment = {
      id: 1,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const mockOrder = {
      id: 1,
      userId: 1,
      status: OrderStatus.PENDING_PAYMENT,
      shopId: 1,
      paymentId: 1,
    }
    it('should create order successfully', async () => {
      mockPrismaService.cartItem.findMany.mockResolvedValue(mockCartItemsForSKUId)

      //Với kiểu transactions trong prisma, thì chúng ta cần mockImplementation để mô phỏng hành vi của transaction
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          cartItem: {
            findMany: jest.fn().mockResolvedValue(mockCartItems),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          payment: {
            create: jest.fn().mockResolvedValue(mockPayment),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          sKU: {
            update: jest.fn().mockResolvedValue({}),
          },
        }
        return await callback(tx)
      })

      const result = await orderRepo.create(userId, createOrderBody)
      expect(result).toEqual({
        paymentId: mockPayment.id,
        orders: [mockOrder],
      })
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(redlock.acquire).toHaveBeenCalledTimes(2)
      expect(mockLock.release).toHaveBeenCalledTimes(2)
      expect(mockOrderProducer.addCancelPaymentJob).toHaveBeenCalledWith(mockPayment.id)
    })
  })
})
