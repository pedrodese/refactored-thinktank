import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../enums/status.enum.js';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  // Obrigatório só quando status = absent — validado no service (depende do
  // valor final combinado, igual Attendance#reason no Rails).
  @IsOptional()
  @IsString()
  reason?: string;
}
