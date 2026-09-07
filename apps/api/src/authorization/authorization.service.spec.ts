import { AuthorizationService } from './authorization.service.js';
import { AuthorizationLevel } from '../users/enums/authorization-level.enum.js';
import { User } from '../users/entities/user.entity.js';

function buildUser(id: string, authorizationLevel: AuthorizationLevel): User {
  const user = new User();
  user.id = id;
  user.authorizationLevel = authorizationLevel;
  return user;
}

describe('AuthorizationService', () => {
  const authorization = new AuthorizationService();

  it('lets super_admin do anything, including managing other admins', () => {
    const superAdmin = buildUser('1', AuthorizationLevel.SUPER_ADMIN);
    const otherAdmin = buildUser('2', AuthorizationLevel.ADMIN);

    expect(authorization.canListUsers(superAdmin)).toBe(true);
    expect(authorization.canCreateUser(superAdmin, AuthorizationLevel.ADMIN)).toBe(true);
    expect(authorization.canUpdateUser(superAdmin, otherAdmin)).toBe(true);
    expect(authorization.canDeleteUser(superAdmin, otherAdmin)).toBe(true);
  });

  it('forbids admin/secretary from creating, updating or deleting other admin/super_admin users, but allows self-update', () => {
    const admin = buildUser('1', AuthorizationLevel.ADMIN);
    const otherAdmin = buildUser('2', AuthorizationLevel.SUPER_ADMIN);
    const person = buildUser('3', AuthorizationLevel.PERSON);

    expect(authorization.canCreateUser(admin, AuthorizationLevel.ADMIN)).toBe(false);
    expect(authorization.canCreateUser(admin, AuthorizationLevel.PERSON)).toBe(true);
    expect(authorization.canUpdateUser(admin, otherAdmin)).toBe(false);
    expect(authorization.canUpdateUser(admin, admin)).toBe(true);
    expect(authorization.canUpdateUser(admin, person)).toBe(true);
    expect(authorization.canDeleteUser(admin, otherAdmin)).toBe(false);
    expect(authorization.canDeleteUser(admin, admin)).toBe(false);
    expect(authorization.canDeleteUser(admin, person)).toBe(true);
  });

  it('lets a facilitator read/update only their own user record, and never list or manage others', () => {
    const facilitator = buildUser('2', AuthorizationLevel.FACILITATOR);
    const stranger = buildUser('99', AuthorizationLevel.PERSON);

    expect(authorization.canListUsers(facilitator)).toBe(false);
    expect(authorization.canReadUser(facilitator, facilitator)).toBe(true);
    expect(authorization.canUpdateUser(facilitator, facilitator)).toBe(true);
    expect(authorization.canReadUser(facilitator, stranger)).toBe(false);
    expect(authorization.canCreateUser(facilitator, AuthorizationLevel.PERSON)).toBe(false);
    expect(authorization.canDeleteUser(facilitator, stranger)).toBe(false);
  });

  it('grants a plain person no user-management abilities', () => {
    const person = buildUser('5', AuthorizationLevel.PERSON);
    expect(authorization.canReadUser(person, person)).toBe(false);
    expect(authorization.canListUsers(person)).toBe(false);
  });

  it('only lets admin/secretary/super_admin manage companies, never facilitator or person', () => {
    expect(authorization.canManageCompanies(buildUser('1', AuthorizationLevel.SECRETARY))).toBe(true);
    expect(authorization.canManageCompanies(buildUser('2', AuthorizationLevel.FACILITATOR))).toBe(false);
    expect(authorization.canManageCompanies(buildUser('3', AuthorizationLevel.PERSON))).toBe(false);
  });

  it('only lets admin/secretary/super_admin manage the reference catalog, never facilitator or person', () => {
    expect(authorization.canManageCatalog(buildUser('1', AuthorizationLevel.ADMIN))).toBe(true);
    expect(authorization.canManageCatalog(buildUser('2', AuthorizationLevel.FACILITATOR))).toBe(false);
    expect(authorization.canManageCatalog(buildUser('3', AuthorizationLevel.PERSON))).toBe(false);
  });

  it('only lets admin/secretary/super_admin manage clusters/teams/members, never facilitator or person', () => {
    const admin = buildUser('1', AuthorizationLevel.ADMIN);
    const facilitator = buildUser('2', AuthorizationLevel.FACILITATOR);
    const person = buildUser('3', AuthorizationLevel.PERSON);

    expect(authorization.canManageClusters(admin)).toBe(true);
    expect(authorization.canManageClusters(facilitator)).toBe(false);
    expect(authorization.canManageClusters(person)).toBe(false);
    expect(authorization.canManageTeams(facilitator)).toBe(false);
    expect(authorization.canManageMembers(facilitator)).toBe(false);
  });

  it('lets admin and facilitator list operational resources, but never person', () => {
    expect(authorization.canListOperations(buildUser('1', AuthorizationLevel.ADMIN))).toBe(true);
    expect(authorization.canListOperations(buildUser('2', AuthorizationLevel.FACILITATOR))).toBe(true);
    expect(authorization.canListOperations(buildUser('3', AuthorizationLevel.PERSON))).toBe(false);
  });

  it('scopes the facilitator to their own id, and returns null for internal team', () => {
    const facilitator = buildUser('2', AuthorizationLevel.FACILITATOR);
    const admin = buildUser('1', AuthorizationLevel.ADMIN);

    expect(authorization.facilitatorScopeId(facilitator)).toBe('2');
    expect(authorization.facilitatorScopeId(admin)).toBeNull();
  });

  it('recognizes a facilitator as cluster owner via facilitatorId or auxiliaryFacilitatorId', () => {
    const facilitator = buildUser('2', AuthorizationLevel.FACILITATOR);

    expect(authorization.isClusterOwner(facilitator, { facilitatorId: '2', auxiliaryFacilitatorId: null })).toBe(true);
    expect(authorization.isClusterOwner(facilitator, { facilitatorId: null, auxiliaryFacilitatorId: '2' })).toBe(true);
    expect(authorization.isClusterOwner(facilitator, { facilitatorId: '99', auxiliaryFacilitatorId: '98' })).toBe(
      false,
    );
  });

  it('only lets admin/secretary/super_admin manage events unconditionally, never facilitator or person', () => {
    expect(authorization.canManageEvents(buildUser('1', AuthorizationLevel.ADMIN))).toBe(true);
    expect(authorization.canManageEvents(buildUser('2', AuthorizationLevel.FACILITATOR))).toBe(false);
    expect(authorization.canManageEvents(buildUser('3', AuthorizationLevel.PERSON))).toBe(false);
  });

  it('lets admin and facilitator create events unconditionally, but never person', () => {
    expect(authorization.canCreateEvent(buildUser('1', AuthorizationLevel.ADMIN))).toBe(true);
    expect(authorization.canCreateEvent(buildUser('2', AuthorizationLevel.FACILITATOR))).toBe(true);
    expect(authorization.canCreateEvent(buildUser('3', AuthorizationLevel.PERSON))).toBe(false);
  });
});
