import { PutObjectCommand, S3, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import envConfig from 'src/shared/config'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import mime from 'mime-types'

@Injectable()
export class S3Service {
  // Implement S3 related methods here
  private s3: S3
  private s3Client: S3Client
  constructor() {
    this.s3 = new S3({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY,
      },
    })
    this.s3Client = new S3Client({
      region: envConfig.S3_REGION,
      credentials: {
        accessKeyId: envConfig.S3_ACCESS_KEY,
        secretAccessKey: envConfig.S3_SECRET_KEY,
      },
    })
  }

  async uploadFile({ fileName, filepath, contentType }: { fileName: string; filepath: string; contentType: string }) {
    const Key = fileName
    const Body = readFileSync(filepath) // đọc file từ đường dẫn filepath để chuyển thành buffer đưa vào S3
    const ContentType = contentType // phải có content type nếu không có khi mở link s3 lên sẽ bị download
    const parallelUploads3 = new Upload({
      client: this.s3 || this.s3Client,
      params: {
        Bucket: envConfig.S3_BUCKET_NAME,
        Key,
        Body,
        ContentType,
      },

      // optional tags
      tags: [
        /*...*/
      ],

      // (optional) concurrency configuration
      queueSize: 4,

      // (optional) size of each part, in bytes, at least 5MB
      partSize: 1024 * 1024 * 5,

      // (optional) when true, do not automatically call AbortMultipartUpload when
      // a multipart upload fails to complete. You should then manually handle
      // the leftover parts.
      leavePartsOnError: false,
    })

    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log('progress =>', progress)
    })

    return await parallelUploads3.done()
  }

  createPresignedUrlWithClient = ({ fileName, expiresIn = 10 }: { fileName: string; expiresIn?: number }) => {
    console.log(fileName)
    const key = fileName
    const client = this.s3Client
    const ContentType = mime.lookup(fileName) || 'application/octet-stream' // xác định content type từ tên file
    const command = new PutObjectCommand({ Bucket: envConfig.S3_BUCKET_NAME, Key: key, ContentType })
    return getSignedUrl(client, command, { expiresIn })
  }
}
