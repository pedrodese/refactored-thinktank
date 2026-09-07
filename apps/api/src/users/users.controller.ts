import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { AuthorizationLevel } from './enums/authorization-level.enum.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Get('me')
  me(@CurrentUser() currentUser: User) {
    return UserResponseDto.fromEntity(currentUser);
  }

  @Get()
  async findAll(@Query() query: QueryUserDto, @CurrentUser() currentUser: User) {
    if (!this.authorization.canListUsers(currentUser)) {
      throw new ForbiddenException('Você não tem permissão para listar usuários');
    }
    const result = await this.usersService.findAll(query);
    return { ...result, data: result.data.map(UserResponseDto.fromEntity) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const user = await this.usersService.findOne(id);
    if (!this.authorization.canReadUser(currentUser, user)) {
      throw new ForbiddenException('Você não tem permissão para ver este usuário');
    }
    return UserResponseDto.fromEntity(user);
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: User) {
    const targetLevel = dto.authorizationLevel ?? AuthorizationLevel.PERSON;
    if (!this.authorization.canCreateUser(currentUser, targetLevel)) {
      throw new ForbiddenException('Você não tem permissão para criar este usuário');
    }
    const user = await this.usersService.create(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() currentUser: User) {
    const user = await this.usersService.findOne(id);
    if (!this.authorization.canUpdateUser(currentUser, user)) {
      throw new ForbiddenException('Você não tem permissão para atualizar este usuário');
    }
    const updated = await this.usersService.update(id, dto);
    return UserResponseDto.fromEntity(updated);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const user = await this.usersService.findOne(id);
    if (!this.authorization.canDeleteUser(currentUser, user)) {
      throw new ForbiddenException('Você não tem permissão para remover este usuário');
    }
    await this.usersService.remove(id);
  }
}
