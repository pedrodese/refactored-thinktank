import { AuthorizationLevel } from '../enums/authorization-level.enum.js';
import { Gender } from '../enums/gender.enum.js';
import { User } from '../entities/user.entity.js';

const AUTHORIZATION_LEVEL_LABEL: Record<AuthorizationLevel, string> = {
  [AuthorizationLevel.PERSON]: 'person',
  [AuthorizationLevel.SECRETARY]: 'secretary',
  [AuthorizationLevel.FACILITATOR]: 'facilitator',
  [AuthorizationLevel.ADMIN]: 'admin',
  [AuthorizationLevel.SUPER_ADMIN]: 'super_admin',
};

const GENDER_LABEL: Record<Gender, string> = {
  [Gender.MAN]: 'man',
  [Gender.WOMAN]: 'woman',
  [Gender.OTHER]: 'other',
};

export class UserResponseDto {
  id!: string;
  fullName!: string;
  authorizationLevel!: string;
  email!: string;
  secondaryEmail!: string;
  gender!: string;
  birthday!: string | null;
  nickname!: string;
  cpf!: string | null;
  rg!: string | null;
  address!: string;
  celularNumber!: string;
  phoneNumber!: string;
  companyId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.fullName = user.fullName;
    dto.authorizationLevel = AUTHORIZATION_LEVEL_LABEL[user.authorizationLevel];
    dto.email = user.email;
    dto.secondaryEmail = user.secondaryEmail;
    dto.gender = GENDER_LABEL[user.gender];
    dto.birthday = user.birthday;
    dto.nickname = user.nickname;
    dto.cpf = user.cpf;
    dto.rg = user.rg;
    dto.address = user.address;
    dto.celularNumber = user.celularNumber;
    dto.phoneNumber = user.phoneNumber;
    dto.companyId = user.companyId;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
