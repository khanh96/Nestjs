# Prisma

https://docs.nestjs.com/recipes/prisma


**Prisma** là một ORM nguồn mở cho Node.js và TypeScript. Nó được sử dụng như một giải pháp thay thế để viết SQL đơn giản hoặc sử dụng một công cụ truy cập cơ sở dữ liệu khác như các trình xây dựng truy vấn SQL (như knex.js) hoặc orms (như typeorm và sequelize).




### @prisma/client
PRISMA Client là máy khách cơ sở dữ liệu an toàn kiểu được tạo từ định nghĩa mô hình PRISMA của bạn. Do phương pháp này, khách hàng Prisma có thể phơi bày các hoạt động CRUD được điều chỉnh cụ thể cho các mô hình của bạn.


### Share Module

- Generate shared.module.ts trong thư mục share
```bash
nest g mo shared
```

- Generate file service prisma.service.ts không có file prisma.service.spec.ts
```bash
nest g s prisma --no-spec
```

- crud\src\shared\shared.module.ts

```ts
import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma/prisma.service'

const sharedServices = [PrismaService]

// Để sử dụng được PrismaService ở các module khác, cần phải import SharedModule vào module đó
// global để có thể sử dụng ở bất kỳ module nào mà không cần import SharedModule vào module đó
@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices, // để có thể sử dụng PrismaService ở các module khác
})
export class SharedModule {}

// File: crud\src\app.module.ts
@Module({
  imports: [PostsModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})

```

> **@Global()** và **exports** chỉ định ở đây là services có thể sử dụng ở nhiều chỗ khác nhau
> Phải import vào trong root app.modules.ts để có thể sử dụng cho toàn app