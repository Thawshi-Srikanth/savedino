export interface EventData {
  id: string;
  title: string;
  code: string;
  description?: string;
  regStart?: string;
  regEnd?: string;
  teamFormationStart?: string;
  teamFormationEnd?: string;
  startDate: string;
  endDate: string;
  submissionStart?: string;
  submissionEnd?: string;
  status: string;
  _count?: {
    teams: number;
    imageSets?: number;
  };
}

export interface TeamData {
  id: string;
  name: string;
  inviteCode: string;
  status: string;
  eventId: string;
  event: {
    title: string;
    code: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      country?: string;
    };
  }>;
  _count?: {
    candidates: number;
    imageSets: number;
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

export const toLocalInput = (dateStr?: string) => {
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
