import { PartialType } from '@nestjs/swagger';
import { CreateMeetingDto } from './create-meeting.dto.js';

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {}
