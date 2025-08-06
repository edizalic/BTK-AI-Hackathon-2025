import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { StorageService } from './storage.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('upload.uploadPath'),
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
          },
        }),
        limits: {
          fileSize: configService.get<number>('upload.maxFileSize') * 1024 * 1024, // Convert MB to bytes
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [FilesService, StorageService],
  controllers: [FilesController],
  exports: [FilesService, StorageService],
})
export class FilesModule {}