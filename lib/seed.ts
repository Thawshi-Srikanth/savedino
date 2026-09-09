import { prisma } from "./prisma";

export async function seedDatabase() {
  console.log("🌱 Starting Clean SaveDino Database Seeding...");

  // 0. Clean wipe existing records in correct foreign key order
  await prisma.imageSet.deleteMany();
  await prisma.teamJoinRequest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Previous data wiped cleanly.");

  // 1. Single Person For Each Role
  const usersData = [
    {
      email: "admin@savedino.org",
      name: "Dr. Eleanor Arroway",
      role: "admin",
      institution: "SETI Research",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "staff@savedino.org",
      name: "Priya Patel",
      role: "staff",
      institution: "IASC Operations",
      country: "India",
      emailVerified: true,
    },
    {
      email: "leader@savedino.org",
      name: "Sarah Chen",
      role: "user",
      institution: "MIT Astrophysics",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "member@savedino.org",
      name: "Marcus Vance",
      role: "user",
      institution: "Caltech Astronomy",
      country: "United States",
      emailVerified: true,
    },
    {
      email: "applicant@savedino.org",
      name: "Amina Khalil",
      role: "user",
      institution: "Cairo Space Science",
      country: "Egypt",
      emailVerified: true,
    },
    {
      email: "solo@savedino.org",
      name: "Alex Novak",
      role: "user",
      institution: "Carnegie Mellon",
      country: "United States",
      emailVerified: true,
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: u,
    });
    createdUsers[u.email] = user;
  }
  console.log(`✅ Created ${Object.keys(createdUsers).length} role personas.`);

  // 2. Create Two Campaigns with Proper Timeline (No em dashes)
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Campaign 1: Active Phase (In progress right now)
  const c1RegStart = new Date(now.getTime() - 14 * dayMs);
  const c1RegEnd = new Date(now.getTime() + 14 * dayMs);
  const c1TeamStart = new Date(now.getTime() - 14 * dayMs);
  const c1TeamEnd = new Date(now.getTime() + 14 * dayMs);
  const c1StartDate = new Date(now.getTime() - 7 * dayMs);
  const c1EndDate = new Date(now.getTime() + 14 * dayMs);
  const c1SubStart = new Date(now.getTime() - 7 * dayMs);
  const c1SubEnd = new Date(now.getTime() + 14 * dayMs);

  // Campaign 2: Upcoming Phase (Starts after Campaign 1 ends, but Registration is open now)
  const c2RegStart = new Date(now.getTime() - 5 * dayMs);
  const c2RegEnd = new Date(now.getTime() + 20 * dayMs);
  const c2TeamStart = new Date(now.getTime() - 5 * dayMs);
  const c2TeamEnd = new Date(now.getTime() + 20 * dayMs);
  const c2StartDate = new Date(now.getTime() + 20 * dayMs);
  const c2EndDate = new Date(now.getTime() + 50 * dayMs);
  const c2SubStart = new Date(now.getTime() + 20 * dayMs);
  const c2SubEnd = new Date(now.getTime() + 50 * dayMs);

  const event1 = await prisma.event.create({
    data: {
      code: "AST-2026-A",
      title: "Pan-STARRS Sky Survey Phase 1",
      description: "Active asteroid search campaign detecting Near Earth Objects and Main Belt asteroids.",
      regStart: c1RegStart,
      regEnd: c1RegEnd,
      teamFormationStart: c1TeamStart,
      teamFormationEnd: c1TeamEnd,
      startDate: c1StartDate,
      endDate: c1EndDate,
      submissionStart: c1SubStart,
      submissionEnd: c1SubEnd,
      maxTeamSize: 6,
      status: "ACTIVE",
    },
  });

  const event2 = await prisma.event.create({
    data: {
      code: "AST-2026-B",
      title: "Catalina Deep Sky Phase 2",
      description: "Next phase fast moving near earth object tracking campaign.",
      regStart: c2RegStart,
      regEnd: c2RegEnd,
      teamFormationStart: c2TeamStart,
      teamFormationEnd: c2TeamEnd,
      startDate: c2StartDate,
      endDate: c2EndDate,
      submissionStart: c2SubStart,
      submissionEnd: c2SubEnd,
      maxTeamSize: 5,
      status: "UPCOMING",
    },
  });

  console.log("✅ Created 2 campaigns with sequential timelines.");

  // 3. Create Two Teams
  // Team 1: Active in Campaign 1
  const leaderUser = createdUsers["leader@savedino.org"];
  const memberUser = createdUsers["member@savedino.org"];
  const staffUser = createdUsers["staff@savedino.org"];
  const applicantUser = createdUsers["applicant@savedino.org"];

  const team1 = await prisma.team.create({
    data: {
      name: "Nova Orbitals",
      eventId: event1.id,
      inviteCode: "NOVA99",
      leaderId: leaderUser.id,
      status: "ACTIVE",
      isRecruiting: true,
      recruitmentNotes: "Active team reviewing Pan-STARRS batches. Open for dedicated observers.",
    },
  });

  // Add Leader to Team 1
  await prisma.teamMember.create({
    data: {
      teamId: team1.id,
      userId: leaderUser.id,
      role: "leader",
    },
  });

  // Add Member to Team 1
  await prisma.teamMember.create({
    data: {
      teamId: team1.id,
      userId: memberUser.id,
      role: "member",
    },
  });

  // Team 2: Forming in Campaign 2
  const team2 = await prisma.team.create({
    data: {
      name: "Cosmic Wardens",
      eventId: event2.id,
      inviteCode: "WARD77",
      leaderId: leaderUser.id,
      status: "FORMING",
      isRecruiting: true,
      recruitmentNotes: "Forming team for the upcoming Catalina search. Open for solo student matching.",
    },
  });

  // Add Leader to Team 2
  await prisma.teamMember.create({
    data: {
      teamId: team2.id,
      userId: leaderUser.id,
      role: "leader",
    },
  });

  console.log("✅ Created 2 teams with student leaders and members (Staff has zero team memberships).");

  // 4. Create Pending Join Request from Applicant to Team 1
  await prisma.teamJoinRequest.create({
    data: {
      teamId: team1.id,
      userId: applicantUser.id,
      message: "Hi Sarah! I have experience with Astrometrica and would like to help blink image sets.",
      status: "PENDING",
    },
  });
  console.log("✅ Created pending join request for applicant.");

  // 5. Create Sample Image Sets for Testing
  const sampleMpcReport = `COD F65
CON S. Chen, MIT Astrophysics <leader@savedino.org>
OBS S. Chen, M. Vance
MEA S. Chen
TEL 1.8-m Ritchey-Chretien + CCD
NET GAIA-DR2
    SD26A01  * C2026 09 01.21405 21 45 12.34 +14 18 32.1          20.4 R      F65
    SD26A01    C2026 09 01.23120 21 45 13.89 +14 18 30.2          20.3 R      F65
    SD26A01    C2026 09 01.24835 21 45 15.42 +14 18 28.5          20.5 R      F65
----- end -----`;

  await prisma.imageSet.createMany({
    data: [
      {
        name: "PS1-26A-01",
        eventId: event1.id,
        teamId: team1.id,
        claimedById: leaderUser.id,
        status: "SUBMITTED",
        mpcReportText: sampleMpcReport,
        isClean: false,
        submittedAt: now,
      },
      {
        name: "PS1-26A-02",
        eventId: event1.id,
        teamId: team1.id,
        claimedById: memberUser.id,
        status: "IN_PROGRESS",
        isClean: false,
      },
      {
        name: "PS1-26A-03",
        eventId: event1.id,
        teamId: team1.id,
        status: "UNASSIGNED",
        isClean: false,
      },
      {
        name: "CSS-26B-01",
        eventId: event2.id,
        teamId: team2.id,
        status: "UNASSIGNED",
        isClean: false,
      },
    ],
  });

  console.log("✅ Created test image sets across teams.");
  console.log("🚀 SaveDino database seeded cleanly and successfully!");

  return {
    success: true,
    users: Object.keys(createdUsers).length,
    events: 2,
    teams: 2,
  };
}
