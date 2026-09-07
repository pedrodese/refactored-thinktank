import { PartialType } from '@nestjs/swagger';
import { CreatePhaseDto } from './create-phase.dto.js';

export class UpdatePhaseDto extends PartialType(CreatePhaseDto) {}
