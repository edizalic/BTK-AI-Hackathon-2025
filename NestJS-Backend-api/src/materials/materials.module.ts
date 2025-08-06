import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { FilesModule } from '../files/files.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, FilesModule],
  providers: [MaterialsService],
  controllers: [MaterialsController],
  exports: [MaterialsService],
})
export class MaterialsModule {}