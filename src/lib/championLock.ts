import { prisma } from "./prisma";

/**
 * The champion pick locks once the knockout (playoff) phase begins — i.e.
 * the first non-group match has kicked off. Before that (during the group
 * stage) players can still pick / change their champion.
 */
export async function isChampionLocked(now: number = Date.now()): Promise<boolean> {
  const firstKo = await prisma.match.findFirst({
    where: { stage: { not: "GROUP" } },
    orderBy: { kickoff: "asc" },
    select: { kickoff: true, status: true },
  });
  if (!firstKo) return false;
  if (firstKo.status !== "SCHEDULED") return true; // already live/finished
  return new Date(firstKo.kickoff).getTime() <= now;
}
