import { PartialType } from '@nestjs/swagger';
import { CreateAxisDto } from './create-axis.dto.js';

export class UpdateAxisDto extends PartialType(CreateAxisDto) {}
