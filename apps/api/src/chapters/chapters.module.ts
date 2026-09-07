import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { Chapter } from './entities/chapter.entity.js';
import { ChaptersController } from './chapters.controller.js';
import { ChaptersService } from './chapters.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter]), AuthorizationModule],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
