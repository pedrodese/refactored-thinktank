import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { ClustersModule } from '../clusters/clusters.module.js';
import { Cluster } from '../clusters/entities/cluster.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { Team } from './entities/team.entity.js';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Member, Cluster]), ClustersModule, AuthorizationModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
