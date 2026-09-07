import { MEMBER_MODALITY_LABEL, type MemberModality } from '../enums/modality.enum.js';
import { MEMBER_ROLE_LABEL } from '../enums/role.enum.js';
import { Member } from '../entities/member.entity.js';

export class MemberResponseDto {
  id!: string;
  active!: boolean;
  modality!: string | null;
  role!: string;
  teamId!: string;
  userId!: string;
  user?: { id: string; fullName: string; email: string };
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(member: Member): MemberResponseDto {
    const dto = new MemberResponseDto();
    dto.id = member.id;
    dto.active = member.active;
    dto.modality = member.modality !== null ? MEMBER_MODALITY_LABEL[member.modality as MemberModality] : null;
    dto.role = MEMBER_ROLE_LABEL[member.role];
    dto.teamId = member.teamId;
    dto.userId = member.userId;
    if (member.user) {
      dto.user = { id: member.user.id, fullName: member.user.fullName, email: member.user.email };
    }
    dto.createdAt = member.createdAt;
    dto.updatedAt = member.updatedAt;
    return dto;
  }
}
