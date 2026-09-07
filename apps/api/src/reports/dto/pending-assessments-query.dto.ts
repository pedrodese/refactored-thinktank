import { IsIn, IsOptional } from 'class-validator';

export class PendingAssessmentsQueryDto {
  @IsOptional()
  @IsIn(['active', 'inactive', 'all'])
  clusterStatus?: 'active' | 'inactive' | 'all';
}
