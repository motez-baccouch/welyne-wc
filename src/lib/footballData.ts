import { prisma } from "./prisma";
import { scoreMatch, recomputeAllTotals } from "./scoreEngine";

/**
 * Map football-data.org team names to our internal team codes.
 * football-data uses some different spellings — handle the common variants.
 */
const NAME_TO_CODE: Record<string, string> = {
  mexico: "MEX",
  "south africa": "RSA",
  "korea republic": "KOR",
  "south korea": "KOR",
  czechia: "CZE",
  "czech republic": "CZE",
  canada: "CAN",
  "bosnia and herzegovina": "BIH",
  bosnia: "BIH",
  qatar: "QAT",
  switzerland: "SUI",
  brazil: "BRA",
  morocco: "MAR",
  haiti: "HAI",
  scotland: "SCO",
  "united states": "USA",
  usa: "USA",
  paraguay: "PAR",
  australia: "AUS",
  turkey: "TUR",
  "türkiye": "TUR",
  germany: "GER",
  "curacao": "CUW",
  "curaçao": "CUW",
  "ivory coast": "CIV",
  "cote d'ivoire": "CIV",
  "côte d'ivoire": "CIV",
  ecuador: "ECU",
  netherlands: "NED",
  japan: "JPN",
  sweden: "SWE",
  tunisia: "TUN",
  belgium: "BEL",
  egypt: "EGY",
  iran: "IRN",
  "ir iran": "IRN",
  "new zealand": "NZL",
  spain: "ESP",
  "cape verde": "CPV",
  "cabo verde": "CPV",
  "saudi arabia": "KSA",
  uruguay: "URU",
  france: "FRA",
  senegal: "SEN",
  iraq: "IRQ",
  norway: "NOR",
  argentina: "ARG",
  algeria: "ALG",
  austria: "AUT",
  jordan: "JOR",
  portugal: "POR",
  "dr congo": "COD",
  "congo dr": "COD",
  "democratic republic of congo": "COD",
  uzbekistan: "UZB",
  colombia: "COL",
  england: "ENG",
  croatia: "CRO",
  ghana: "GHA",
  panama: "PAN",
};

function codeFromName(name: string | undefined | null): string | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  return NAME_TO_CODE[key] ?? null;
}

function mapStatus(s: string): "SCHEDULED" | "LIVE" | "FINISHED" {
  if (s === "FINISHED") return "FINISHED";
  if (s === "IN_PLAY" || s === "PAUSED") return "LIVE";
  return "SCHEDULED";
}

export type SyncResult = {
  ok: boolean;
  message: string;
  fetched: number;
  updated: number;
  finished: number;
};

/**
 * Pull World Cup matches from football-data.org and update our DB.
 * Requires FOOTBALL_DATA_TOKEN. If absent or the request fails, returns ok:false
 * with a message — the app keeps working on bundled data.
 */
export async function syncFromFootballData(): Promise<SyncResult> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return {
      ok: false,
      message:
        "No FOOTBALL_DATA_TOKEN set. Add one (free at football-data.org) to enable live sync, or enter results manually.",
      fetched: 0,
      updated: 0,
      finished: 0,
    };
  }

  let data: any;
  try {
    const res = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `football-data.org returned ${res.status}. The World Cup competition may not be on your plan's tier.`,
        fetched: 0,
        updated: 0,
        finished: 0,
      };
    }
    data = await res.json();
  } catch (e: any) {
    return { ok: false, message: `Fetch failed: ${e?.message ?? e}`, fetched: 0, updated: 0, finished: 0 };
  }

  const apiMatches: any[] = data?.matches ?? [];
  const teams = await prisma.team.findMany();
  const codeToId = new Map(teams.map((t) => [t.code, t.id]));

  let updated = 0;
  let finished = 0;

  for (const am of apiMatches) {
    const homeCode = codeFromName(am?.homeTeam?.name);
    const awayCode = codeFromName(am?.awayTeam?.name);
    if (!homeCode || !awayCode) continue;
    const homeId = codeToId.get(homeCode);
    const awayId = codeToId.get(awayCode);
    if (!homeId || !awayId) continue;

    const match = await prisma.match.findFirst({
      where: { homeTeamId: homeId, awayTeamId: awayId },
    });
    if (!match) continue;

    const status = mapStatus(am?.status ?? "SCHEDULED");
    const hs = am?.score?.fullTime?.home;
    const as = am?.score?.fullTime?.away;

    await prisma.match.update({
      where: { id: match.id },
      data: {
        status,
        homeScore: typeof hs === "number" ? hs : match.homeScore,
        awayScore: typeof as === "number" ? as : match.awayScore,
      },
    });
    updated++;

    if (status === "FINISHED" && typeof hs === "number" && typeof as === "number") {
      await scoreMatch(match.id);
      finished++;
    }
  }

  await recomputeAllTotals();

  return {
    ok: true,
    message: `Synced ${apiMatches.length} matches from football-data.org.`,
    fetched: apiMatches.length,
    updated,
    finished,
  };
}
