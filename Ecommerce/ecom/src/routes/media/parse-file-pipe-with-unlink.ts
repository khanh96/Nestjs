import { Injectable, ParseFileOptions, ParseFilePipe } from '@nestjs/common'
import fs from 'fs/promises'

@Injectable()
export class ParseFilePipeWithUnlink extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options)
  }

  async transform(file: Express.Multer.File): Promise<any> {
    // Kế thừa và ghi đè phương thức transform để thêm logic xóa file khi validation thất bại
    return super.transform(file).catch(async (error) => {
      // If validation fails, unlink the file
      if (file && file.path) {
        await fs.unlink(file.path)
      }
      throw error
    })
  }
}
