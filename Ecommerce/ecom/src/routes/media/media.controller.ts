import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import path from 'path'
import { MediaService } from 'src/routes/media/media.service'
import { ParseFilePipeWithUnlink } from 'src/routes/media/parse-file-pipe-with-unlink'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeWithUnlink({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024, // 2MB
            message: 'File must be smaller than 2MB',
          }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file)
  }

  // API upload array of files
  @Post('images/uploads')
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultipleFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 3 * 1024 * 1024, // 3MB
            message: 'Each file must be smaller than 3MB',
          }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|jpg|png|webp)$/ }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.mediaService.uploadFileToS3(files)
    // return files.map((file) => ({
    //   url: `${envConfig.PREFIX_STATIC_ENDPOINT}/${file.filename}`,
    // }))
  }

  // Serve static files
  @Get('static/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_DIR, filename), (error) => {
      if (error) {
        const notfound = new NotFoundException('File not found')
        res.status(notfound.getStatus()).json(notfound.getResponse())
      }
    })
  }

  @Post('images/presigned-url')
  @IsPublic()
  async getPresignedUrl(@Body('filename') filename: string) {
    return this.mediaService.getPresignedUrl(filename)
  }
}

// Cách 2:
// export class MediaController {
//   @Post('images/upload')
//   @UseInterceptors(FileInterceptor('file'))
//   uploadFile(
//     @UploadedFile(
//       new ParseFilePipeBuilder()
//         .addFileTypeValidator({
//           fileType: 'jpeg',
//         })
//         .addMaxSizeValidator({
//           maxSize: 1000,
//         })
//         .build({
//           errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
//         }),
//     )
//     file: Express.Multer.File,
//   ) {
//     console.log(file)
//   }
// }
