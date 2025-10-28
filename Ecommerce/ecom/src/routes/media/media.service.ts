import { Injectable } from '@nestjs/common'
import { S3Service } from 'src/shared/services/s3/s3.service'
import fs from 'fs/promises'
import { generateRandomFilename } from 'src/shared/helpers'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}
  async uploadFileToS3(files: Express.Multer.File[]) {
    try {
      const res = await Promise.all(
        files.map((file) => {
          return this.s3Service.uploadFile({
            fileName: 'image/' + file.filename,
            filepath: file.path,
            contentType: file.mimetype,
          })
        }),
      )
      await Promise.all(files.map((file) => fs.unlink(file.path))) // xóa file trong thư mục tạm sau khi đã upload lên s3 thành công
      //   console.log(res)
      return res.map((item) => ({
        url: item.Location,
      }))
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getPresignedUrl(fileName: string) {
    try {
      const randomFileName = generateRandomFilename(fileName)
      const presignedUrl = await this.s3Service.createPresignedUrlWithClient({ fileName: randomFileName })
      const url = presignedUrl.split('?')[0] // get url cho client. Thực sự không cần thiết trả về vì client có thể lấy từ presignedUrl
      return {
        presignedUrl,
        url,
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
