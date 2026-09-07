import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class QueryCompanyDto extends PaginationQueryDto {
  // Busca por nome OU CNPJ — igual o filtro combinado que a tela de Empresas
  // do Rails tinha (um campo de nome, um de CNPJ), simplificado num só.
  @IsOptional()
  @IsString()
  q?: string;
}
