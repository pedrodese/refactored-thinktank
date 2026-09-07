import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class ToolEventAssessmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  toolId?: string;
}
