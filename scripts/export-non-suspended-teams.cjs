/**
 * Export non-suspended (non-disqualified) teams to CSV in the organizer-specified roster format:
 *
 * Team Name   | Country | Team leader | Leader email
 *             |         | member      |
 *             |         | member      |
 *             |         | member      |
 *
 * Second team | Country | Team leader | Leader email
 *             |         | member      |
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not defined in .env");
  process.exit(1);
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

async function exportNonSuspendedTeams() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    // Fetch all non-suspended (non-disqualified) teams
    const teamsRes = await client.query(
      `SELECT t.*, e.title as "eventTitle", e.code as "eventCode"
       FROM team t
       LEFT JOIN event e ON t."eventId" = e.id
       WHERE t.status != 'DISQUALIFIED'
       ORDER BY t."createdAt" ASC`
    );

    const teams = teamsRes.rows;
    console.log(`Found ${teams.length} non-suspended teams.`);

    const headers = ["Team", "Country", "Team leader", "Leader email"];
    const rows = [];

    for (const team of teams) {
      // Fetch all members with their user info
      const membersRes = await client.query(
        `SELECT tm.role, tm."userId", u.name, u.email, u.country
         FROM "team_member" tm
         JOIN "user" u ON tm."userId" = u.id
         WHERE tm."teamId" = $1
         ORDER BY CASE WHEN tm.role = 'LEADER' OR tm.role = 'leader' THEN 0 ELSE 1 END, u.name ASC`,
        [team.id]
      );

      const members = membersRes.rows;

      // Identify the squad leader
      const leader = members.find(
        (m) =>
          m.role === "LEADER" ||
          m.role === "leader" ||
          m.userId === team.leaderId
      );

      const country = leader?.country || members.find((m) => m.country)?.country || "";
      const leaderName = leader?.name || team.leaderContact || "Unassigned";
      const leaderEmail = leader?.email || "";

      // Leader row (Team Name, Country, Team Leader, Leader Email)
      rows.push(
        [
          escapeCsv(team.name),
          escapeCsv(country),
          escapeCsv(leaderName),
          escapeCsv(leaderEmail),
        ].join(",")
      );

      // Remaining member rows: [empty], [empty], member name, member email
      const otherMembers = members.filter(
        (m) => m !== leader && m.userId !== team.leaderId
      );

      for (const member of otherMembers) {
        rows.push(
          [
            escapeCsv(""),
            escapeCsv(""),
            escapeCsv(member.name),
            escapeCsv(member.email || ""),
          ].join(",")
        );
      }
    }

    const csvContent =
      "\uFEFF" + [headers.map((h) => escapeCsv(h)).join(","), ...rows].join("\r\n");

    const outputPath = path.resolve(process.cwd(), "non_suspended_teams.csv");
    fs.writeFileSync(outputPath, csvContent, "utf8");

    console.log(`\nExport complete! File written to: ${outputPath}`);
    console.log(`\n--- CSV Preview ---`);
    console.log(csvContent);
  } finally {
    await client.end();
  }
}

exportNonSuspendedTeams().catch((err) => {
  console.error("Failed to export teams:", err);
  process.exit(1);
});
