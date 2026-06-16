// Client-safe i18n: dictionaries + a tiny interpolating lookup.
// Server-only cookie reading lives in i18n.server.ts.

export type Lang = "en" | "fr";
export const LANGS: Lang[] = ["en", "fr"];

type Dict = Record<string, string>;

const en: Dict = {
  // nav
  "nav.dashboard": "Dashboard",
  "nav.matches": "Matches",
  "nav.groups": "Groups",
  "nav.bracket": "Bracket",
  "nav.teams": "Teams",
  "nav.leaderboard": "Leaderboard",
  "nav.mypicks": "My Picks",
  "nav.signin": "Sign in",
  "nav.pts": "pts",

  // dashboard
  "dash.welcome": "Welcome back",
  "dash.hi": "Hi {name}",
  "dash.lead":
    "Predict every World Cup 2026 match. Exact score = 5 pts · goal difference = 3 · correct outcome = 2. Knockouts count 1.5×.",
  "dash.points": "Your points",
  "dash.rankof": "Rank of {n}",
  "dash.predsmade": "Predictions made",
  "dash.played": "Matches played",
  "dash.predictnext": "⏱ Predict next",
  "dash.allmatches": "All matches →",
  "dash.noopen": "No open matches right now — check back soon or browse all matches.",
  "dash.latest": "📋 Latest results",
  "dash.nofinished": "No matches have finished yet.",

  // champion picker
  "champ.title": "🏆 Your champion pick",
  "champ.sub": "Predict the winner — worth {pts} if you nail it.",
  "champ.locked": "Locked",
  "champ.choose": "Choose…",
  "champ.saved": "Saved ✓",

  // matches
  "matches.eyebrow": "Fixtures & predictions",
  "matches.title": "Matches",
  "matches.lead":
    "Enter a scoreline for each match before kick-off. Predictions lock automatically when the match starts.",
  "matches.group": "Group {g}",
  "matches.knockouts": "🏆 Knockouts",
  "matches.played": "✓ Played",
  "matches.matchday": "Matchday {n}",
  "matches.allplayed": "All played matches",
  "matches.empty": "Nothing here yet. If the app was just deployed, an admin needs to run setup first.",
  "matches.noplayed": "No matches have been played yet.",

  // match card
  "mc.fulltime": "Full time",
  "mc.live": "Live",
  "mc.predict": "Predict",
  "mc.update": "Update",
  "mc.saving": "Saving…",
  "mc.saved": "Saved ✓",
  "mc.locked": "Locked",
  "mc.yourpick": "Your pick {h}-{a}",
  "mc.nopick": "No pick",
  "mc.awaiting": "Awaiting teams",
  "mc.enterboth": "Enter both scores.",
  "mc.couldnotsave": "Could not save.",
  "mc.adminresult": "Admin result",
  "mc.setft": "Set FT",
  "mc.ptsline": "{h}-{a} · {pts} pts",

  // stages
  "stage.GROUP": "Group",
  "stage.R32": "Round of 32",
  "stage.R16": "Round of 16",
  "stage.QF": "Quarter-final",
  "stage.SF": "Semi-final",
  "stage.THIRD": "Third place",
  "stage.FINAL": "Final",
  "stage.QFs": "Quarter-finals",
  "stage.SFs": "Semi-finals",
  "stage.THIRDplay": "Third-place play-off",

  // groups
  "groups.eyebrow": "Live standings",
  "groups.title": "Group stage",
  "groups.lead":
    "Top two of each group qualify (green). The eight best third-placed teams (orange) also advance to the Round of 32. Tables update as results come in.",
  "groups.th.team": "Team",
  "groups.th.p": "P",
  "groups.th.w": "W",
  "groups.th.d": "D",
  "groups.th.l": "L",
  "groups.th.gd": "GD",
  "groups.th.pts": "Pts",

  // teams
  "teams.eyebrow": "48 nations · 12 groups",
  "teams.title": "Teams & title odds",
  "teams.lead":
    "Indicative outright odds to lift the trophy (decimal — lower is more likely). Use them to guide your champion pick on the dashboard.",
  "teams.favourites": "⭐ Favourites",
  "teams.titleodds": "Title odds",

  // bracket
  "bracket.eyebrow": "Knockout phase",
  "bracket.title": "🏆 The road to MetLife",
  "bracket.lead":
    "The bracket fills in as the group stage finishes. Slots show the qualification path until teams are confirmed; once both teams are known you can predict each tie on the Matches page.",
  "bracket.third": "🥉 Third-place play-off",

  // leaderboard
  "lb.eyebrow": "Standings",
  "lb.title": "🏅 Leaderboard",
  "lb.lead":
    "The Welyne table. Points come from match predictions plus a +15 bonus for correctly calling the champion.",
  "lb.you": " · you",
  "lb.picks": "{n} picks",
  "lb.exact": "{n} exact",

  // me
  "me.eyebrow": "Your game",
  "me.title": "My predictions",
  "me.lead": "Every pick you've made, how it scored, and what's still locked in.",
  "me.totalpoints": "Total points",
  "me.predsmade": "Predictions made",
  "me.exactscores": "Exact scores",
  "me.scoringpicks": "Points-scoring picks",
  "me.champ": "🏆 Champion pick:",
  "me.nonepick": "none yet — ",
  "me.pickone": "pick one on the dashboard",
  "me.ifcorrect": "(+15 pts if correct)",
  "me.frommatches": "{n} from matches",
  "me.noneyet": "You haven't made any predictions yet. ",
  "me.startpredicting": "Start predicting →",
  "me.scored": "✅ Scored",
  "me.awaiting": "⏳ Awaiting result",
  "me.account": "⚙️ Account",
  "me.signedinas": "Signed in as {u} ({name}).",
  "me.pick": "PICK",
  "me.ft": "FT {h}-{a}",
  "me.pts": "{n} pts",

  // change password
  "pw.change": "Change password",
  "pw.current": "Current password",
  "pw.new": "New password",
  "pw.newph": "at least 6 characters",
  "pw.confirm": "Confirm new password",
  "pw.save": "Save",
  "pw.saving": "Saving…",
  "pw.cancel": "Cancel",
  "pw.updated": "Password updated ✓",
  "pw.nomatch": "New passwords don't match.",
  "pw.failed": "Could not update password.",

  // login
  "login.title": "WE predict.",
  "login.sub": "Welyne World Cup 2026 prediction game. Sign in with your name.",
  "login.name": "Name (username)",
  "login.nameph": "your name",
  "login.password": "Password",
  "login.kickoff": "Kick off →",
  "login.signingin": "Signing in…",
  "login.failed": "Login failed.",

  // sync
  "sync.button": "Sync live scores",
  "sync.syncing": "Syncing…",
  "sync.logout": "Log out",
};

const fr: Dict = {
  // nav
  "nav.dashboard": "Tableau de bord",
  "nav.matches": "Matchs",
  "nav.groups": "Groupes",
  "nav.bracket": "Tableau final",
  "nav.teams": "Équipes",
  "nav.leaderboard": "Classement",
  "nav.mypicks": "Mes pronostics",
  "nav.signin": "Connexion",
  "nav.pts": "pts",

  // dashboard
  "dash.welcome": "Bon retour",
  "dash.hi": "Salut {name}",
  "dash.lead":
    "Pronostiquez chaque match de la Coupe du Monde 2026. Score exact = 5 pts · différence de buts = 3 · bon résultat = 2. Les matchs à élimination comptent 1,5×.",
  "dash.points": "Vos points",
  "dash.rankof": "Rang sur {n}",
  "dash.predsmade": "Pronostics faits",
  "dash.played": "Matchs joués",
  "dash.predictnext": "⏱ Pronostiquer",
  "dash.allmatches": "Tous les matchs →",
  "dash.noopen": "Aucun match ouvert pour l'instant — revenez bientôt ou parcourez tous les matchs.",
  "dash.latest": "📋 Derniers résultats",
  "dash.nofinished": "Aucun match terminé pour l'instant.",

  // champion picker
  "champ.title": "🏆 Votre champion",
  "champ.sub": "Pronostiquez le vainqueur — vaut {pts} si vous visez juste.",
  "champ.locked": "Verrouillé",
  "champ.choose": "Choisir…",
  "champ.saved": "Enregistré ✓",

  // matches
  "matches.eyebrow": "Calendrier & pronostics",
  "matches.title": "Matchs",
  "matches.lead":
    "Saisissez un score pour chaque match avant le coup d'envoi. Les pronostics se verrouillent au début du match.",
  "matches.group": "Groupe {g}",
  "matches.knockouts": "🏆 Élimination",
  "matches.played": "✓ Joués",
  "matches.matchday": "Journée {n}",
  "matches.allplayed": "Tous les matchs joués",
  "matches.empty":
    "Rien ici pour l'instant. Si l'app vient d'être déployée, un admin doit lancer l'initialisation.",
  "matches.noplayed": "Aucun match n'a encore été joué.",

  // match card
  "mc.fulltime": "Terminé",
  "mc.live": "En direct",
  "mc.predict": "Pronostiquer",
  "mc.update": "Modifier",
  "mc.saving": "Enregistrement…",
  "mc.saved": "Enregistré ✓",
  "mc.locked": "Verrouillé",
  "mc.yourpick": "Votre pari {h}-{a}",
  "mc.nopick": "Pas de pari",
  "mc.awaiting": "Équipes à venir",
  "mc.enterboth": "Saisissez les deux scores.",
  "mc.couldnotsave": "Échec de l'enregistrement.",
  "mc.adminresult": "Résultat admin",
  "mc.setft": "Valider",
  "mc.ptsline": "{h}-{a} · {pts} pts",

  // stages
  "stage.GROUP": "Groupe",
  "stage.R32": "16es de finale",
  "stage.R16": "8es de finale",
  "stage.QF": "Quart de finale",
  "stage.SF": "Demi-finale",
  "stage.THIRD": "Petite finale",
  "stage.FINAL": "Finale",
  "stage.QFs": "Quarts de finale",
  "stage.SFs": "Demi-finales",
  "stage.THIRDplay": "Match pour la 3e place",

  // groups
  "groups.eyebrow": "Classements en direct",
  "groups.title": "Phase de groupes",
  "groups.lead":
    "Les deux premiers de chaque groupe se qualifient (vert). Les huit meilleurs troisièmes (orange) accèdent aussi aux 16es de finale. Les tableaux se mettent à jour avec les résultats.",
  "groups.th.team": "Équipe",
  "groups.th.p": "J",
  "groups.th.w": "G",
  "groups.th.d": "N",
  "groups.th.l": "P",
  "groups.th.gd": "Diff",
  "groups.th.pts": "Pts",

  // teams
  "teams.eyebrow": "48 nations · 12 groupes",
  "teams.title": "Équipes & cotes",
  "teams.lead":
    "Cotes indicatives pour soulever le trophée (décimales — plus c'est bas, plus c'est probable). Servez-vous-en pour choisir votre champion sur le tableau de bord.",
  "teams.favourites": "⭐ Favoris",
  "teams.titleodds": "Cote titre",

  // bracket
  "bracket.eyebrow": "Phase à élimination",
  "bracket.title": "🏆 La route vers MetLife",
  "bracket.lead":
    "Le tableau se remplit à la fin de la phase de groupes. Les emplacements montrent le parcours de qualification jusqu'à confirmation des équipes ; une fois les deux équipes connues, pronostiquez chaque match sur la page Matchs.",
  "bracket.third": "🥉 Match pour la 3e place",

  // leaderboard
  "lb.eyebrow": "Classement",
  "lb.title": "🏅 Classement",
  "lb.lead":
    "Le classement Welyne. Les points viennent des pronostics de matchs plus un bonus de +15 pour avoir trouvé le champion.",
  "lb.you": " · vous",
  "lb.picks": "{n} paris",
  "lb.exact": "{n} exacts",

  // me
  "me.eyebrow": "Votre jeu",
  "me.title": "Mes pronostics",
  "me.lead": "Tous vos paris, leurs points, et ceux encore verrouillés.",
  "me.totalpoints": "Points totaux",
  "me.predsmade": "Pronostics faits",
  "me.exactscores": "Scores exacts",
  "me.scoringpicks": "Paris gagnant des points",
  "me.champ": "🏆 Champion choisi :",
  "me.nonepick": "aucun pour l'instant — ",
  "me.pickone": "choisissez-en un sur le tableau de bord",
  "me.ifcorrect": "(+15 pts si correct)",
  "me.frommatches": "{n} des matchs",
  "me.noneyet": "Vous n'avez encore fait aucun pronostic. ",
  "me.startpredicting": "Commencer à pronostiquer →",
  "me.scored": "✅ Notés",
  "me.awaiting": "⏳ En attente du résultat",
  "me.account": "⚙️ Compte",
  "me.signedinas": "Connecté en tant que {u} ({name}).",
  "me.pick": "PARI",
  "me.ft": "Final {h}-{a}",
  "me.pts": "{n} pts",

  // change password
  "pw.change": "Changer le mot de passe",
  "pw.current": "Mot de passe actuel",
  "pw.new": "Nouveau mot de passe",
  "pw.newph": "au moins 6 caractères",
  "pw.confirm": "Confirmer le nouveau mot de passe",
  "pw.save": "Enregistrer",
  "pw.saving": "Enregistrement…",
  "pw.cancel": "Annuler",
  "pw.updated": "Mot de passe mis à jour ✓",
  "pw.nomatch": "Les mots de passe ne correspondent pas.",
  "pw.failed": "Impossible de mettre à jour le mot de passe.",

  // login
  "login.title": "WE predict.",
  "login.sub": "Le jeu de pronostics Welyne Coupe du Monde 2026. Connectez-vous avec votre nom.",
  "login.name": "Nom (identifiant)",
  "login.nameph": "votre nom",
  "login.password": "Mot de passe",
  "login.kickoff": "Coup d'envoi →",
  "login.signingin": "Connexion…",
  "login.failed": "Échec de la connexion.",

  // sync
  "sync.button": "Synchroniser les scores",
  "sync.syncing": "Synchronisation…",
  "sync.logout": "Déconnexion",
};

const DICTS: Record<Lang, Dict> = { en, fr };

export function tr(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const d = DICTS[lang] ?? en;
  let s = d[key] ?? en[key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
    }
  }
  return s;
}

export function makeT(lang: Lang) {
  return (key: string, vars?: Record<string, string | number>) => tr(lang, key, vars);
}
