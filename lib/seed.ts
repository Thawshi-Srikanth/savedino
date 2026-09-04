import { prisma } from "./prisma";

export async function seedDatabase() {
  console.log("🌱 Starting SaveDino Database Seeding...");

  // 1. Create Users with 4-Tier Roles (admin, staff, leader, user)
  const usersData = [
    {
      email: "admin@savedino.org",
      name: "Dr. Eleanor Arroway",
      role: "admin",
      institution: "SETI & IASC Research",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "sarah.chen@mit.edu",
      name: "Sarah Chen",
      role: "leader",
      institution: "MIT Astrophysics",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "kenji.sato@u-tokyo.ac.jp",
      name: "Kenji Sato",
      role: "leader",
      institution: "University of Tokyo",
      country: "Japan",
      emailVerified: true,
    },
    {
      email: "elena.rostova@cam.ac.uk",
      name: "Dr. Elena Rostova",
      role: "leader",
      institution: "Cambridge Astronomy",
      country: "United Kingdom",
      emailVerified: true,
    },
    {
      email: "marcus.vance@caltech.edu",
      name: "Marcus Vance",
      role: "leader",
      institution: "Caltech",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "priya.patel@iisc.ac.in",
      name: "Priya Patel",
      role: "staff",
      institution: "Indian Institute of Science",
      country: "India",
      emailVerified: true,
    },
    {
      email: "hina.takahashi@kyoto-u.ac.jp",
      name: "Hina Takahashi",
      role: "staff",
      institution: "Kyoto University",
      country: "Japan",
      emailVerified: true,
    },
    {
      email: "lucas.silva@usp.br",
      name: "Lucas Silva",
      role: "user",
      institution: "University of São Paulo",
      country: "Brazil",
      emailVerified: true,
    },
    {
      email: "amina.khalil@aucegypt.edu",
      name: "Amina Khalil",
      role: "user",
      institution: "American University in Cairo",
      country: "Egypt",
      emailVerified: true,
    },
    {
      email: "leo.dupont@sorbonne.fr",
      name: "Léo Dupont",
      role: "user",
      institution: "Sorbonne University",
      country: "France",
      emailVerified: true,
    },
    // Unassigned Solo Researchers / Students (Available for Matchmaking & Teams)
    {
      email: "alex.novak@cmu.edu",
      name: "Alex Novak",
      role: "user",
      institution: "Carnegie Mellon University",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "mateo.fernandez@uba.ar",
      name: "Mateo Fernandez",
      role: "user",
      institution: "University of Buenos Aires",
      country: "Argentina",
      emailVerified: true,
    },
    {
      email: "zara.mensah@ug.edu.gh",
      name: "Zara Mensah",
      role: "user",
      institution: "University of Ghana",
      country: "Ghana",
      emailVerified: true,
    },
    {
      email: "oliver.smith@ox.ac.uk",
      name: "Oliver Smith",
      role: "user",
      institution: "University of Oxford",
      country: "United Kingdom",
      emailVerified: true,
    },
    {
      email: "fatima.almansoori@uaeu.ac.ae",
      name: "Fatima Al-Mansoori",
      role: "user",
      institution: "UAE University",
      country: "United Arab Emirates",
      emailVerified: true,
    },
    {
      email: "lars.lindqvist@kth.se",
      name: "Lars Lindqvist",
      role: "user",
      institution: "KTH Royal Institute of Technology",
      country: "Sweden",
      emailVerified: true,
    },
    {
      email: "chloe.martin@unimelb.edu.au",
      name: "Chloe Martin",
      role: "user",
      institution: "University of Melbourne",
      country: "Australia",
      emailVerified: true,
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        institution: u.institution,
        country: u.country,
        emailVerified: u.emailVerified,
      },
      create: u,
    });
    createdUsers[u.email] = user;
  }
  console.log(`✅ Upserted ${Object.keys(createdUsers).length} users.`);

  // 2. Create Events (Campaigns)
  const now = new Date();
  const pastDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const eventsData = [
    {
      code: "IASC-2026-A",
      title: "Global Asteroid Search Campaign — Phase 1",
      description:
        "Primary Pan-STARRS sky survey analysis campaign detecting Near Earth Objects (NEOs) and Main Belt asteroids.",
      regStart: pastDate,
      regEnd: futureDate,
      teamFormationStart: pastDate,
      teamFormationEnd: futureDate,
      startDate: pastDate,
      endDate: futureDate,
      submissionStart: pastDate,
      submissionEnd: futureDate,
      status: "ACTIVE" as const,
    },
    {
      code: "IASC-2026-B",
      title: "Catalina Sky Survey Rapid Response",
      description:
        "Targeted analysis for fast-moving faint orbital targets across Catalina Sky Survey image batches.",
      regStart: pastDate,
      regEnd: futureDate,
      teamFormationStart: pastDate,
      teamFormationEnd: futureDate,
      startDate: pastDate,
      endDate: futureDate,
      submissionStart: pastDate,
      submissionEnd: futureDate,
      status: "SUBMISSION_OPEN" as const,
    },
    {
      code: "IASC-2026-C",
      title: "Pan-STARRS Deep Sky Exploration",
      description:
        "Upcoming deep-sky orbital identification campaign starting next month.",
      regStart: now,
      regEnd: futureDate,
      teamFormationStart: now,
      teamFormationEnd: futureDate,
      startDate: futureDate,
      endDate: nextMonth,
      submissionStart: futureDate,
      submissionEnd: nextMonth,
      status: "UPCOMING" as const,
    },
  ];

  const createdEvents: Record<string, any> = {};

  for (const e of eventsData) {
    const event = await prisma.event.upsert({
      where: { code: e.code },
      update: {
        title: e.title,
        description: e.description,
        status: e.status,
      },
      create: e,
    });
    createdEvents[e.code] = event;
  }
  console.log(`✅ Upserted ${Object.keys(createdEvents).length} events.`);

  // 3. Create Teams
  const teamsData = [
    {
      name: "Nova Orbitals",
      eventCode: "IASC-2026-A",
      inviteCode: "NOVA92",
      leaderEmail: "sarah.chen@mit.edu",
      status: "ACTIVE" as const,
      isRecruiting: true,
      recruitmentNotes:
        "Active daily analyzing Pan-STARRS batches with Astrometrica. Looking for 1-2 dedicated observers.",
      memberEmails: ["sarah.chen@mit.edu", "marcus.vance@caltech.edu", "priya.patel@iisc.ac.in"],
    },
    {
      name: "Cosmic Wardens",
      eventCode: "IASC-2026-A",
      inviteCode: "WARD77",
      leaderEmail: "kenji.sato@u-tokyo.ac.jp",
      status: "FORMING" as const,
      isRecruiting: true,
      recruitmentNotes:
        "Forming team focused on high-precision astrometric verification. Beginners welcome!",
      memberEmails: ["kenji.sato@u-tokyo.ac.jp"],
    },
    {
      name: "Stellar Hunters",
      eventCode: "IASC-2026-A",
      inviteCode: "STEL41",
      leaderEmail: "elena.rostova@cam.ac.uk",
      status: "ACTIVE" as const,
      isRecruiting: false,
      recruitmentNotes: "Experienced team conducting multi-night asteroid verification.",
      memberEmails: [
        "elena.rostova@cam.ac.uk",
        "lucas.silva@usp.br",
        "amina.khalil@aucegypt.edu",
        "leo.dupont@sorbonne.fr",
        "admin@savedino.org",
      ],
    },
    {
      name: "Meteor Watchers",
      eventCode: "IASC-2026-B",
      inviteCode: "METE15",
      leaderEmail: "marcus.vance@caltech.edu",
      status: "ACTIVE" as const,
      isRecruiting: true,
      recruitmentNotes: "Catalina fast-track team. We review daily batch uploads within 12 hours.",
      memberEmails: ["marcus.vance@caltech.edu", "lucas.silva@usp.br"],
    },
  ];

  const createdTeams: Record<string, any> = {};

  for (const t of teamsData) {
    const event = createdEvents[t.eventCode];
    const leader = createdUsers[t.leaderEmail];
    if (!event || !leader) continue;

    let team = await prisma.team.findUnique({
      where: { inviteCode: t.inviteCode },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: t.name,
          eventId: event.id,
          inviteCode: t.inviteCode,
          leaderId: leader.id,
          status: t.status,
          isRecruiting: t.isRecruiting,
          recruitmentNotes: t.recruitmentNotes,
        },
      });
    } else {
      team = await prisma.team.update({
        where: { id: team.id },
        data: {
          name: t.name,
          eventId: event.id,
          leaderId: leader.id,
          status: t.status,
          isRecruiting: t.isRecruiting,
          recruitmentNotes: t.recruitmentNotes,
        },
      });
    }

    // Add members
    for (const email of t.memberEmails) {
      const user = createdUsers[email];
      if (!user) continue;

      const role = email === t.leaderEmail ? "LEADER" : "MEMBER";
      await prisma.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: user.id,
          },
        },
        update: { role },
        create: {
          teamId: team.id,
          userId: user.id,
          role,
        },
      });
    }

    createdTeams[t.name] = team;
  }
  console.log(`✅ Upserted ${Object.keys(createdTeams).length} teams with members.`);

  // 4. Create Image Sets
  const novaTeam = createdTeams["Nova Orbitals"];
  const wardenTeam = createdTeams["Cosmic Wardens"];
  const eventA = createdEvents["IASC-2026-A"];

  if (novaTeam && eventA) {
    const sampleMpcReport = `COD F65
CON S. Chen, MIT Astrophysics <sarah.chen@mit.edu>
OBS S. Chen, M. Vance
MEA S. Chen
TEL 1.8-m Ritchey-Chretien + CCD
NET GAIA-DR2
    SD26A01  * C2026 09 01.21405 21 45 12.34 +14 18 32.1          20.4 R      F65
    SD26A01    C2026 09 01.23120 21 45 13.89 +14 18 30.2          20.3 R      F65
    SD26A01    C2026 09 01.24835 21 45 15.42 +14 18 28.5          20.5 R      F65
----- end -----`;

    const setsData = [
      {
        name: "PS1-26A-01",
        eventId: eventA.id,
        teamId: novaTeam.id,
        claimedById: createdUsers["sarah.chen@mit.edu"]?.id,
        status: "SUBMITTED",
        mpcReportText: sampleMpcReport,
        isClean: false,
        submittedAt: now,
      },
      {
        name: "PS1-26A-02",
        eventId: eventA.id,
        teamId: novaTeam.id,
        claimedById: createdUsers["marcus.vance@caltech.edu"]?.id,
        status: "IN_PROGRESS",
        isClean: false,
      },
      {
        name: "PS1-26A-03",
        eventId: eventA.id,
        teamId: novaTeam.id,
        status: "UNASSIGNED",
        isClean: false,
      },
      {
        name: "PS1-26A-04",
        eventId: eventA.id,
        teamId: novaTeam.id,
        claimedById: createdUsers["priya.patel@iisc.ac.in"]?.id,
        status: "SUBMITTED",
        isClean: true,
        submittedAt: now,
      },
      {
        name: "PS1-26A-05",
        eventId: eventA.id,
        teamId: novaTeam.id,
        status: "UNASSIGNED",
        isClean: false,
      },
    ];

    for (const s of setsData) {
      const existing = await prisma.imageSet.findFirst({
        where: { name: s.name, teamId: novaTeam.id },
      });
      if (!existing) {
        await prisma.imageSet.create({ data: s });
      }
    }
  }

  if (wardenTeam && eventA) {
    const wardenSets = [
      {
        name: "CSS-26B-01",
        eventId: eventA.id,
        teamId: wardenTeam.id,
        claimedById: createdUsers["kenji.sato@u-tokyo.ac.jp"]?.id,
        status: "IN_PROGRESS",
        isClean: false,
      },
      {
        name: "CSS-26B-02",
        eventId: eventA.id,
        teamId: wardenTeam.id,
        status: "UNASSIGNED",
        isClean: false,
      },
    ];

    for (const s of wardenSets) {
      const existing = await prisma.imageSet.findFirst({
        where: { name: s.name, teamId: wardenTeam.id },
      });
      if (!existing) {
        await prisma.imageSet.create({ data: s });
      }
    }
  }

  // 5. Create Sample Join Requests
  if (novaTeam && createdUsers["amina.khalil@aucegypt.edu"]) {
    const existingReq = await prisma.teamJoinRequest.findFirst({
      where: {
        teamId: novaTeam.id,
        userId: createdUsers["amina.khalil@aucegypt.edu"].id,
      },
    });
    if (!existingReq) {
      await prisma.teamJoinRequest.create({
        data: {
          teamId: novaTeam.id,
          userId: createdUsers["amina.khalil@aucegypt.edu"].id,
          message: "Hi Sarah! I have experience with Astrometrica and would love to help blink image sets.",
          status: "PENDING",
        },
      });
    }
  }

  console.log("🚀 Database seeding completed successfully!");
  return {
    success: true,
    usersCount: Object.keys(createdUsers).length,
    eventsCount: Object.keys(createdEvents).length,
    teamsCount: Object.keys(createdTeams).length,
  };
}
