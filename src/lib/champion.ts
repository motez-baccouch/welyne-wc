// Shared champion-pick reaction logic (used server + client).
export function championReactionKey(code: string | null | undefined): string {
  if (!code) return "champ.react.default";
  const c = code.toUpperCase();
  if (c === "POR") return "champ.react.POR";
  if (c === "TUN") return "champ.react.TUN";
  if (c === "FRA" || c === "ESP") return "champ.react.predictable";
  return "champ.react.default";
}

export const MAX_CHAMPION_CHANGES = 2;
