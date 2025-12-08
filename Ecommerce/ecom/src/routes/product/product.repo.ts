import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsResType,
  ProductType,
} from 'src/routes/product/product.model'
import { ALL_LANGUAGES_CODE } from 'src/shared/constants/other.constant'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

@Injectable()
export class ProductRepo {
  constructor(private readonly prismaService: PrismaService) {}
  async list({
    limit,
    page,
    name,
    brandIds,
    categories,
    minPrice,
    maxPrice,
    createdById,
    isPublic,
    languageId,
  }: {
    limit: number
    page: number
    name?: string
    brandIds?: number[]
    categories?: number[]
    minPrice?: number
    maxPrice?: number
    createdById?: number
    isPublic?: boolean
    languageId: string
  }): Promise<GetProductsResType> {
    const skip = (page - 1) * limit
    const take = limit

    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: createdById ? createdById : undefined,
    }
    if (isPublic) {
      where.publishedAt = { lte: new Date(), not: null }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: { gte: new Date() } }, { publishedAt: null }],
      }
    }
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive', // Không phân biệt hoa thường
      }
    }
    if (brandIds && brandIds.length > 0) {
      where.brandId = { in: brandIds } // only filter những product có brandId nằm trong brandIds truyền vào
    }
    if (categories && categories.length > 0) {
      where.categories = {
        some: {
          id: { in: categories }, // only filter những product có ít nhất 1 categoryId nằm trong categories truyền vào
          deletedAt: null,
        },
      }
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.basePrice = {
        gte: minPrice,
        lte: maxPrice,
      }
    } else if (minPrice !== undefined) {
      where.basePrice = { gte: minPrice } // greater than equal (lớn hơn hoặc bằng)
    } else if (maxPrice !== undefined) {
      where.basePrice = { lte: maxPrice } // less than equal (nhỏ hơn hoặc bằng)
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where: where,
      }),
      this.prismaService.product.findMany({
        where: where,
        include: {
          productTranslations: {
            where: languageId === ALL_LANGUAGES_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
    ])
    return {
      data,
      totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  findById(productId: number): Promise<ProductType | null> {
    return this.prismaService.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
      },
    })
  }

  getDetail({
    productId,
    languageId,
    isPublic,
  }: {
    productId: number
    languageId: string
    isPublic?: boolean
  }): Promise<GetProductDetailResType | null> {
    let where: Prisma.ProductWhereUniqueInput = {
      id: productId,
      deletedAt: null,
    }

    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }

    return this.prismaService.product.findUnique({
      where: where,
      include: {
        productTranslations: {
          where: languageId === ALL_LANGUAGES_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
        },
        skus: {
          where: {
            deletedAt: null,
          },
        },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === ALL_LANGUAGES_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: languageId === ALL_LANGUAGES_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
            },
          },
        },
      },
    })
  }

  async delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<ProductType> {
    const now = new Date()
    if (isHard) {
      // Hard delete product phải xóa thêm sku liên quan đến product nữa. Nhưng thực ra ở đây không cần thiết vì bảng sku đã config cascade qua productId rồi
      // product             Product              @relation(fields: [productId], references: [id], onDelete: Cascade, onUpdate: NoAction)
      const product = await this.prismaService.product.delete({
        where: {
          id,
          deletedAt: null,
        },
      })
      return product
    }

    const [product] = await Promise.all([
      await this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          deletedById,
        },
      }),
      await this.prismaService.sKU.updateMany({
        where: {
          productId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
          deletedById,
        },
      }),
    ])
    return product
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateProductBodyType
  }): Promise<GetProductDetailResType> {
    const { skus, categories, ...product } = data

    return await this.prismaService.product.create({
      data: {
        ...product,
        createdById,
        categories: {
          // Tạo sao sử dụng connect vì các category đã được tạo từ trước rồi (trong bảng category)
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          // Tại sao sử dụng createMany vì các sku được tạo mới hoàn toàn cùng lúc với product
          createMany: {
            data: skus.map((sku) => ({
              ...sku,
              createdById,
            })),
          },
        },
      },
      include: {
        productTranslations: {
          where: { deletedAt: null },
        },
        skus: {
          where: { deletedAt: null },
        },
        brand: {
          include: {
            brandTranslations: {
              where: { deletedAt: null },
            },
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          include: {
            categoryTranslations: {
              where: { deletedAt: null },
            },
          },
        },
      },
    })
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: CreateProductBodyType
  }): Promise<ProductType> {
    // Case1: SKU đã tồn tại trong DB nhưng không có trong data payload thì sẽ bị xóa
    // Case2: SKU đã tồn tại trong DB nhưng có trong data payload thì sẽ được update
    // Case3: SKU không tồn tại trong DB nhưng có trong data payload thì sẽ được thêm mới

    const { skus: dataSkus, categories: categoriesData, ...productData } = data

    // 1. Lấy danh sách SKU của product cần update hiện tại từ DB
    const existingSKUs = await this.prismaService.sKU.findMany({
      where: {
        productId: id,
        deletedAt: null,
      },
    })

    // 2. Tìm các SKUs cần xóa (tồn tại trong DB nhưng không có trong data payload)
    const skusToDelete = existingSKUs.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id)

    // 3. Mapping ID vào trong data payload vơi các SKU đã tồn tại trong DB
    // sku có id là sku đã tồn tại trong DB, ngược lại sku có id là null là sku mới
    const skusWithId = dataSkus.map((dataSku) => {
      const existingSku = existingSKUs.find((existingSKU) => existingSKU.value === dataSku.value)
      return {
        ...dataSku,
        id: existingSku ? existingSku.id : null,
      }
    })

    // 4. Tìm các skus để cập nhật (có trong cả DB và data payload)
    const skusToUpdate = skusWithId.filter((sku) => sku.id !== null)

    // 5. Tìm các skus để thêm mới (không có trong DB nhưng có trong data payload)
    const skusToCreate = skusWithId
      .filter((sku) => sku.id === null)
      .map((sku) => {
        const { id: skuId, ...data } = sku
        return {
          ...data,
          productId: id,
          createdById: updatedById,
        }
      })

    const [product] = await this.prismaService.$transaction([
      // Cập nhật Product
      this.prismaService.product.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById,
          categories: {
            connect: categoriesData.map((category) => ({ id: category })),
          },
        },
      }),
      // Xóa mềm các SKU không có trong data payload
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedAt: new Date(),
          deletedById: updatedById,
        },
      }),
      // Cập nhật các SKU có trong data payload
      ...skusToUpdate.map((sku) =>
        this.prismaService.sKU.update({
          where: {
            id: sku.id as number,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),
      // Thêm mới các SKU không có trong DB
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ])
    return product
  }
}
