import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { MemberRole } from '../enums/role.enum.js';

export class MemberQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  active?: 'true' | 'false';

  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;
}
