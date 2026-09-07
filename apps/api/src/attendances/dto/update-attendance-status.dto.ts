import { IsEnum } from 'class-validator';
import { AttendanceStatus } from '../enums/status.enum.js';

// Equivalente ao `update_status` do Rails: só o status, sem validar reason
// (save(validate: false)) — uma ausência sem motivo ainda é um passo válido
// nesse fluxo rápido, o motivo é cobrado no update completo.
export class UpdateAttendanceStatusDto {
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}
