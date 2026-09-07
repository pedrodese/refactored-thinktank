import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { ClustersModule } from '../clusters/clusters.module.js';
import { TeamsModule } from '../teams/teams.module.js';
import { Member } from './entities/member.entity.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Member]), TeamsModule, ClustersModule, AuthorizationModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
