/**
 * Utility to mask emails for non-leader squad members and privacy protection
 * e.g., leader@savedino.org -> lea****er@savedino.org
 */

export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string") return "";
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  if (local.length <= 4) {
    return `${local.slice(0, 1)}**${local.slice(-1)}@${domain}`;
  }
  return `${local.slice(0, 3)}****${local.slice(-2)}@${domain}`;
}
