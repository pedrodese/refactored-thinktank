import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { Cluster } from './entities/cluster.entity.js';
import { ClustersController } from './clusters.controller.js';
import { ClustersService } from './clusters.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cluster]), AuthorizationModule],
  controllers: [ClustersController],
  providers: [ClustersService],
  exports: [ClustersService],
})
export class ClustersModule {}
