export interface EventData {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  regStart?: string | null;
  regEnd?: string | null;
  teamFormationStart?: string | null;
  teamFormationEnd?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  submissionStart?: string | null;
  submissionEnd?: string | null;
  status: string;
  maxTeamSize?: number | null;
  maxTeams?: number | null;
  _count?: {
    teams: number;
    imageSets?: number;
  };
}

export interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  status: "FORMING" | "ACTIVE" | "SUBMITTED" | "DISQUALIFIED" | string;
  isRecruiting?: boolean;
  recruitmentNotes?: string | null;
  disqualificationReason?: string | null;
  leaderId?: string;
  eventId: string;
  event: {
    title: string;
    code: string;
    maxTeamSize?: number | null;
    maxTeams?: number | null;
  };
  members: Array<{
    id: string;
    role: string;
    userId?: string;
    user: {
      id: string;
      name: string;
      email: string;
      country?: string;
    };
  }>;
  _count?: {
    members?: number;
    joinRequests?: number;
    candidates?: number;
    imageSets?: number;
  };
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  institution?: string | null;
  country?: string | null;
  role: "admin" | "staff" | "leader" | "user" | string;
  emailVerified?: boolean;
  createdAt: string;
  teamMembers: Array<{
    id: string;
    role: string;
    team: {
      id: string;
      name: string;
      event: {
        id: string;
        title: string;
        code?: string;
      };
    };
  }>;
}

export const toLocalInput = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
};

export const getInitials = (name?: string) => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
