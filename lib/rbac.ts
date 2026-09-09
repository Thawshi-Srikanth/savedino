/**
 * Centralized Role-Based Access Control (RBAC) & Permission Engine for SaveDino
 * Zero technical jargon, type-safe, single source of truth for both server and client.
 */

export type UserRole = "admin" | "staff" | "user" | string;
export type TeamMemberRole = "leader" | "member" | string;

export interface SessionUser {
  id?: string;
  role?: string | null;
  name?: string | null;
  email?: string | null;
  [key: string]: any;
}

/**
 * Checks if a user has platform organizer privileges (Admin or Staff).
 * Organizers have access to /admin and read-only inspection over team workspaces.
 */
export function isOrganizer(user?: SessionUser | null): boolean {
  if (!user || !user.role) return false;
  const role = user.role.toLowerCase();
  return role === "admin" || role === "staff";
}

/**
 * Checks if a user is a Platform Administrator.
 */
export function isAdmin(user?: SessionUser | null): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === "admin";
}

/**
 * Checks if a user is a Platform Staff member.
 */
export function isStaff(user?: SessionUser | null): boolean {
  if (!user || !user.role) return false;
  return user.role.toLowerCase() === "staff";
}

/**
 * Checks if a user is allowed to create or join participant teams.
 * Organizers (Admin and Staff) manage campaigns and cannot form or join participant teams.
 */
export function canParticipateInTeams(user?: SessionUser | null): boolean {
  if (!user) return false;
  return !isOrganizer(user);
}

/**
 * Evaluates contextual permissions for a user within a team workspace.
 */
export function getTeamContextPermissions(
  user: SessionUser | null | undefined,
  team: { leaderId?: string; members?: Array<{ userId: string; role?: string }> } | null | undefined
) {
  const userId = user?.id;
  const organizer = isOrganizer(user);
  const isMember = Boolean(userId && team?.members?.some((m) => m.userId === userId));
  const isLeader = Boolean(userId && team?.leaderId === userId);

  return {
    isMember,
    isLeader,
    isOrganizer: organizer,
    isObserverMode: organizer && !isMember,
    canManageTeam: isLeader || organizer,
    canClaimImageSets: isMember && !organizer,
    canApproveSubmissions: isLeader,
  };
}
