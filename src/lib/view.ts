import type { MatchVM } from "@/components/MatchCard";

type MatchWithTeams = {
  id: number;
  code: string;
  stage: string;
  groupName: string | null;
  kickoff: Date;
  venue: string | null;
  status: string;
  homeTeam: { name: string; flag: string; code: string } | null;
  awayTeam: { name: string; flag: string; code: string } | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
};

export function toMatchVM(m: MatchWithTeams): MatchVM {
  return {
    id: m.id,
    code: m.code,
    stage: m.stage,
    groupName: m.groupName,
    kickoff: m.kickoff.toISOString(),
    venue: m.venue,
    status: m.status,
    homeName: m.homeTeam?.name ?? null,
    homeFlag: m.homeTeam?.flag ?? null,
    homeCode: m.homeTeam?.code ?? null,
    awayName: m.awayTeam?.name ?? null,
    awayFlag: m.awayTeam?.flag ?? null,
    awayCode: m.awayTeam?.code ?? null,
    homePlaceholder: m.homePlaceholder,
    awayPlaceholder: m.awayPlaceholder,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    teamsKnown: m.homeTeamId != null && m.awayTeamId != null,
  };
}
