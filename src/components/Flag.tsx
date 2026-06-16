import { flagUrl } from "@/lib/flags";

/**
 * Real flag image (flagcdn). Falls back to the emoji if we don't have a
 * mapping for the code. `w` is the rendered width in px; height auto by ratio.
 */
export default function Flag({
  code,
  emoji,
  w = 26,
  className = "",
}: {
  code: string | null | undefined;
  emoji?: string | null;
  w?: number;
  className?: string;
}) {
  const url = flagUrl(code);
  if (!url) {
    return emoji ? <span className={`flag-emoji ${className}`}>{emoji}</span> : null;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={code ?? ""}
      width={w}
      height={Math.round((w * 3) / 4)}
      className={`flag-img ${className}`}
      loading="lazy"
    />
  );
}
