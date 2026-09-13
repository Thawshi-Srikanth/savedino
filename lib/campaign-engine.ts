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
    // Overlap exists if both events have defined dates and (StartA <= EndB) and (EndA >= StartB)
    if (
      targetEvent.startDate &&
      targetEvent.endDate &&
      existingEvent.startDate &&
      existingEvent.endDate
    ) {
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
  }

  return { canEnroll: true };
}

export {
  generateInviteCode,
  calculateTeamStatus,
  isRegistrationClosed,
  isSubmissionClosed,
} from "./campaign-utils";
