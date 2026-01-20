```graphql
mutation CreateProduct {
  createProduct(
    createProductInput: {
      publishedAt: "2025-08-08T18:28:41.469Z"
      name: "Giày Bitis"
      basePrice: 123123
      virtualPrice: 123123
      brandId: 20002
      images: ["hello.jpg"]
      variants: [
        { value: "Màu sắc", options: ["Đen", "Trắng", "Xanh", "Đỏ"] }
        { value: "Kích thước", options: ["S", "M", "L", "XL"] }
        { value: "Kích thước", options: ["S", "M", "L", "XL"] }
      ]
      categories: [1, 2, 3]
      skus: [
        { value: "Đen-S", price: 0, stock: 100, image: "" }
        { value: "Đen-M", price: 0, stock: 100, image: "" }
        { value: "Đen-L", price: 0, stock: 100, image: "" }
        { value: "Đen-XL", price: 0, stock: 100, image: "" }
        { value: "Trắng-S", price: 0, stock: 100, image: "" }
        { value: "Trắng-M", price: 0, stock: 100, image: "" }
        { value: "Trắng-L", price: 0, stock: 100, image: "" }
        { value: "Trắng-XL", price: 0, stock: 100, image: "" }
        { value: "Xanh-S", price: 0, stock: 100, image: "" }
        { value: "Xanh-M", price: 0, stock: 100, image: "" }
        { value: "Xanh-L", price: 0, stock: 100, image: "" }
        { value: "Xanh-XL", price: 0, stock: 100, image: "" }
        { value: "Đỏ-S", price: 0, stock: 100, image: "" }
        { value: "Đỏ-M", price: 0, stock: 100, image: "" }
        { value: "Đỏ-L", price: 0, stock: 100, image: "" }
        { value: "Đỏ-XL", price: 0, stock: 100, image: "" }
      ]
    }
  ) {
    createdById
    updatedById
    deletedById
    deletedAt
    createdAt
    updatedAt
    id
    publishedAt
    name
    basePrice
    virtualPrice
    brandId
    images
    variants {
      value
      options
    }
    productTranslations {
      createdById
      updatedById
      deletedById
      deletedAt
      createdAt
      updatedAt
      id
      productId
      name
      description
      languageId
    }
    skus {
      createdById
      updatedById
      deletedById
      deletedAt
      createdAt
      updatedAt
      id
      value
      price
      stock
      image
      productId
    }
    categories {
      createdById
      updatedById
      deletedById
      deletedAt
      createdAt
      updatedAt
      id
      parentCategoryId
      name
      logo
      categoryTranslations {
        createdById
        updatedById
        deletedById
        deletedAt
        createdAt
        updatedAt
        id
        categoryId
        languageId
        name
        description
      }
    }
    brand {
      createdById
      updatedById
      deletedById
      deletedAt
      createdAt
      updatedAt
      id
      name
      logo
      brandTranslations {
        createdById
        updatedById
        deletedById
        deletedAt
        createdAt
        updatedAt
        id
        brandId
        languageId
        name
        description
      }
    }
  }
}
```