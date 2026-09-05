import { prisma } from "./prisma";

export interface ConcurrencyCheckResult {
  canEnroll: boolean;
  conflictingEventTitle?: string;
  reason?: string;
}

/**
 * Checks whether a user can enroll in a target event.
 * Rule: A user cannot participate in two events that have overlapping date ranges.
 */
export async function checkUserEventConcurrency(
  userId: string,
  targetEventId: string
): Promise<ConcurrencyCheckResult> {
  const targetEvent = await prisma.event.findUnique({
    where: { id: targetEventId },
  });

  if (!targetEvent) {
    return { canEnroll: false, reason: "Target event not found" };
  }

  // Find all active teams the user is currently a member of
  const existingMemberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          event: true,
        },
      },
    },
  });

  for (const membership of existingMemberships) {
    const existingEvent = membership.team.event;

    // Already in this exact event
    if (existingEvent.id === targetEventId) {
      return {
        canEnroll: false,
        conflictingEventTitle: existingEvent.title,
        reason: "You are already enrolled in a team for this event.",
      };
    }

    // Check for date range overlap:
    // Overlap exists if (StartA <= EndB) and (EndA >= StartB)
    const overlaps =
      targetEvent.startDate <= existingEvent.endDate &&
      targetEvent.endDate >= existingEvent.startDate;

    if (overlaps) {
      return {
        canEnroll: false,
        conflictingEventTitle: existingEvent.title,
        reason: `You are already participating in '${existingEvent.title}' which runs concurrently from ${existingEvent.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} to ${existingEvent.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}. Multiple simultaneous event participation is not allowed.`,
      };
    }
  }

  return { canEnroll: true };
}

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
