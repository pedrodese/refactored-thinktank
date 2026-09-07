import { PartialType } from '@nestjs/swagger';
import { CreateClusterDto } from './create-cluster.dto.js';

export class UpdateClusterDto extends PartialType(CreateClusterDto) {}
