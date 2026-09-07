import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MemberModality } from '../enums/modality.enum.js';
import { MemberRole } from '../enums/role.enum.js';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsEnum(MemberModality)
  modality?: MemberModality;

  @IsOptional()
  @IsEnum(MemberRole)
  role?: MemberRole;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
