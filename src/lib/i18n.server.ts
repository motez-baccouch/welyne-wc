import { cookies } from "next/headers";
import { Lang, makeT } from "./i18n";

export function getLang(): Lang {
  const c = cookies().get("lang")?.value;
  return c === "fr" ? "fr" : "en";
}

/** Server-side translator bound to the current request's locale. */
export function getT() {
  const lang = getLang();
  return { lang, t: makeT(lang) };
}
