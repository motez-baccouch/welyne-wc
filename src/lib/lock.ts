// Single source of truth for "can this match still be predicted?".
// A match is LOCKED (no more predictions) once it is no longer SCHEDULED
// (i.e. live/finished) OR the kickoff instant has been reached.
export function isPredictionLocked(
  match: { status: string; kickoff: Date | string },
  now: number = Date.now()
): boolean {
  if (match.status !== "SCHEDULED") return true;
  return new Date(match.kickoff).getTime() <= now;
}
