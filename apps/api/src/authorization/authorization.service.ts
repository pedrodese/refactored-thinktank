import { Injectable } from '@nestjs/common';
import { AuthorizationLevel } from '../users/enums/authorization-level.enum.js';
import { User } from '../users/entities/user.entity.js';

const ELEVATED_LEVELS = [
  AuthorizationLevel.SUPER_ADMIN,
  AuthorizationLevel.ADMIN,
  AuthorizationLevel.SECRETARY,
];

const PROTECTED_LEVELS = [AuthorizationLevel.SUPER_ADMIN, AuthorizationLevel.ADMIN];

@Injectable()
export class AuthorizationService {
  private isSelf(actor: User, target: User): boolean {
    return actor.id === target.id;
  }

  private isElevated(actor: User): boolean {
    return ELEVATED_LEVELS.includes(actor.authorizationLevel);
  }

  canListUsers(actor: User): boolean {
    return this.isElevated(actor);
  }

  canReadUser(actor: User, target: User): boolean {
    if (this.isElevated(actor)) return true;
    if (actor.authorizationLevel === AuthorizationLevel.FACILITATOR) return this.isSelf(actor, target);
    return false;
  }

  canCreateUser(actor: User, targetLevel: AuthorizationLevel): boolean {
    if (actor.authorizationLevel === AuthorizationLevel.SUPER_ADMIN) return true;
    if (actor.authorizationLevel === AuthorizationLevel.ADMIN ||actor.authorizationLevel === AuthorizationLevel.SECRETARY) {
      return !PROTECTED_LEVELS.includes(targetLevel);
    }
    return false;
  }

  canUpdateUser(actor: User, target: User): boolean {
    if (actor.authorizationLevel === AuthorizationLevel.SUPER_ADMIN) return true;
    if (actor.authorizationLevel === AuthorizationLevel.ADMIN || actor.authorizationLevel === AuthorizationLevel.SECRETARY) {
      if (PROTECTED_LEVELS.includes(target.authorizationLevel)) return this.isSelf(actor, target);
      return true;
    }
    if (actor.authorizationLevel === AuthorizationLevel.FACILITATOR) return this.isSelf(actor, target);
    return false;
  }

  canDeleteUser(actor: User, target: User): boolean {
    if (actor.authorizationLevel === AuthorizationLevel.SUPER_ADMIN) return true;
    if (actor.authorizationLevel === AuthorizationLevel.ADMIN || actor.authorizationLevel === AuthorizationLevel.SECRETARY) {
      return !PROTECTED_LEVELS.includes(target.authorizationLevel);
    }
    return false;
  }

  canManageCompanies(actor: User): boolean {
    return this.isElevated(actor);
  }

  canManageCatalog(actor: User): boolean {
    return this.isElevated(actor);
  }

  canManageClusters(actor: User): boolean {
    return this.isElevated(actor);
  }

  canManageTeams(actor: User): boolean {
    return this.isElevated(actor);
  }

  canManageMembers(actor: User): boolean {
    return this.isElevated(actor);
  }

  canListOperations(actor: User): boolean {
    return this.isElevated(actor) || actor.authorizationLevel === AuthorizationLevel.FACILITATOR;
  }

  facilitatorScopeId(actor: User): string | null {
    return actor.authorizationLevel === AuthorizationLevel.FACILITATOR ? actor.id : null;
  }

  isClusterOwner(actor: User, cluster: { facilitatorId: string | null; auxiliaryFacilitatorId: string | null }): boolean {
    return cluster.facilitatorId === actor.id || cluster.auxiliaryFacilitatorId === actor.id;
  }

  canManageEvents(actor: User): boolean {
    return this.isElevated(actor);
  }

  canCreateEvent(actor: User): boolean {
    return this.isElevated(actor) || actor.authorizationLevel === AuthorizationLevel.FACILITATOR;
  }
}
