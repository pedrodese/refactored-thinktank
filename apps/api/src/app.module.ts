import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { appConfig, databaseConfig, jwtConfig } from './config/configuration.js';
import { validationSchema } from './config/validation.schema.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { UsersModule } from './users/users.module.js';
import { CompaniesModule } from './companies/companies.module.js';
import { ChaptersModule } from './chapters/chapters.module.js';
import { AxesModule } from './axes/axes.module.js';
import { PhasesModule } from './phases/phases.module.js';
import { ToolsModule } from './tools/tools.module.js';
import { MeetingsModule } from './meetings/meetings.module.js';
import { ClustersModule } from './clusters/clusters.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { MembersModule } from './members/members.module.js';
import { EventsModule } from './events/events.module.js';
import { AttendancesModule } from './attendances/attendances.module.js';
import { ToolEventAssessmentsModule } from './tool-event-assessments/tool-event-assessments.module.js';
import { TeamBulkEvaluationsModule } from './team-bulk-evaluations/team-bulk-evaluations.module.js';
import { ReportsModule } from './reports/reports.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    HealthModule,
    UsersModule,
    CompaniesModule,
    ChaptersModule,
    AxesModule,
    PhasesModule,
    ToolsModule,
    MeetingsModule,
    ClustersModule,
    TeamsModule,
    MembersModule,
    EventsModule,
    AttendancesModule,
    ToolEventAssessmentsModule,
    TeamBulkEvaluationsModule,
    ReportsModule,
    AuthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
