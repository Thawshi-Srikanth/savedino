/**
 * Client-safe campaign utility functions (no database / Prisma dependencies)
 */

/**
 * Generates an uppercase 6-character unique alphanumeric invite code (e.g. AST-8492)
 */
export function generateInviteCode(): string {
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AST-${randomChars}`;
}

/**
 * Validates team status based on member count
 */
export function calculateTeamStatus(memberCount: number): "FORMING" | "ACTIVE" {
  if (memberCount < 2) return "FORMING";
  return "ACTIVE";
}

/**
 * Checks if team registration/formation deadline has passed for an event.
 */
export function isRegistrationClosed(
  event: {
    teamFormationEnd?: Date | string | null;
    regEnd?: Date | string | null;
    startDate?: Date | string | null;
    status?: string;
  },
  now: Date = new Date()
): { closed: boolean; reason?: string } {
  if (event.status === "COMPLETED") {
    return { closed: true, reason: "This campaign has already concluded." };
  }
  const deadlineStr = event.teamFormationEnd || event.regEnd || event.startDate;
  if (deadlineStr) {
    const deadline = new Date(deadlineStr);
    if (!isNaN(deadline.getTime()) && now.getTime() > deadline.getTime()) {
      return {
        closed: true,
        reason: "Registration and team formation for this campaign has closed.",
      };
    }
  }
  return { closed: false };
}

/**
 * Checks if report submission deadline has passed for an event.
 */
export function isSubmissionClosed(
  event: {
    submissionEnd?: Date | string | null;
    endDate?: Date | string | null;
    status?: string;
  },
  now: Date = new Date()
): { closed: boolean; reason?: string } {
  if (event.status === "COMPLETED") {
    return { closed: true, reason: "This campaign has already concluded." };
  }
  const deadlineStr = event.submissionEnd || event.endDate;
  if (deadlineStr) {
    const deadline = new Date(deadlineStr);
    if (!isNaN(deadline.getTime()) && now.getTime() > deadline.getTime()) {
      return {
        closed: true,
        reason: "The submission window for this campaign has ended. Discovery reports can no longer be submitted.",
      };
    }
  }
  return { closed: false };
}
