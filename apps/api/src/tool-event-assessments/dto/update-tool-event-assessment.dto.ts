import { PartialType } from '@nestjs/swagger';
import { CreateToolEventAssessmentDto } from './create-tool-event-assessment.dto.js';

export class UpdateToolEventAssessmentDto extends PartialType(CreateToolEventAssessmentDto) {}
