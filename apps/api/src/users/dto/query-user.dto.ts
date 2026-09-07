import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { AuthorizationLevel } from '../enums/authorization-level.enum.js';

export class QueryUserDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  // Precisa de @Type(() => Number): query string chega como "2" (string), e
  // sem a conversão o @IsEnum falha comparando string com o valor numérico
  // do enum — bug real encontrado testando o filtro pela primeira vez.
  @IsOptional()
  @Type(() => Number)
  @IsEnum(AuthorizationLevel)
  authorizationLevel?: AuthorizationLevel;

  @IsOptional()
  @IsString()
  companyId?: string;
}
