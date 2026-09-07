import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class EventQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  meetingId?: string;

  // Equivalente simplificado de Event.pending_assessment: algum item a-d
  // sem score OU alguma attendance not_registered.
  @IsOptional()
  @IsIn(['true', 'false'])
  pending?: 'true' | 'false';
}
