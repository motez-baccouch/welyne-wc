import { prisma } from "./prisma";
import { hashPassword } from "./password";
import { rescoreEverything } from "./scoreEngine";
import teams from "../data/teams.json";
import fixtures from "../data/fixtures.json";
import members from "../data/members.json";

type Fixture = {
  code: string;
  stage: string;
  group?: string;
  matchday?: number;
  kickoff: string;
  venue?: string;
  home?: string;
  away?: string;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  homeScore?: number;
  awayScore?: number;
  status?: string;
};

export async function runSeed() {
  const suffix = process.env.PASSWORD_SUFFIX ?? "0*";

  // 1) Teams
  for (const t of teams as any[]) {
    await prisma.team.upsert({
      where: { code: t.code },
      update: { name: t.name, flag: t.flag, groupName: t.group, odds: t.odds },
      create: { code: t.code, name: t.name, flag: t.flag, groupName: t.group, odds: t.odds },
    });
  }

  const allTeams = await prisma.team.findMany();
  const codeToId = new Map(allTeams.map((t) => [t.code, t.id]));

  // 2) Matches
  for (const f of fixtures as Fixture[]) {
    const homeTeamId = f.home ? codeToId.get(f.home) ?? null : null;
    const awayTeamId = f.away ? codeToId.get(f.away) ?? null : null;
    const data = {
      stage: f.stage as any,
      groupName: f.group ?? null,
      matchday: f.matchday ?? null,
      kickoff: new Date(f.kickoff),
      venue: f.venue ?? null,
      status: (f.status ?? "SCHEDULED") as any,
      homeTeamId,
      awayTeamId,
      homePlaceholder: f.homePlaceholder ?? null,
      awayPlaceholder: f.awayPlaceholder ?? null,
      homeScore: f.homeScore ?? null,
      awayScore: f.awayScore ?? null,
    };
    await prisma.match.upsert({
      where: { code: f.code },
      update: data,
      create: { code: f.code, ...data },
    });
  }

  // 3) Users (members) — password = username + suffix
  for (const m of members as any[]) {
    const passwordHash = await hashPassword(m.username + suffix);
    await prisma.user.upsert({
      where: { username: m.username },
      update: { name: m.name, role: m.role, avatar: m.avatar, isAdmin: m.isAdmin },
      // only set passwordHash on create so we don't reset changed passwords on re-seed
      create: {
        username: m.username,
        name: m.name,
        role: m.role,
        avatar: m.avatar,
        isAdmin: m.isAdmin,
        passwordHash,
      },
    });
  }

  // 4) Score anything already finished
  await rescoreEverything();

  const counts = {
    teams: await prisma.team.count(),
    matches: await prisma.match.count(),
    users: await prisma.user.count(),
  };
  return counts;
}
