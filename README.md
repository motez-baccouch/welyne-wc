# ⚽ Welyne · World Cup 2026 Predictions

A full-stack Next.js prediction game for the Welyne team. Predict every match of the FIFA World
Cup 2026, earn points, climb the leaderboard, pick the champion, and follow the groups & knockout
bracket — all in the Welyne dark-orange theme.

- **Stack:** Next.js 14 (App Router) · Prisma · PostgreSQL (Neon) · custom JWT-cookie auth
- **Data:** all 48 teams, 12 groups and the full 104-match schedule are bundled (accurate as of the
  real draw). Live results sync from the free [football-data.org](https://www.football-data.org) API,
  and admins can also enter scores by hand.
- **Hosting:** Vercel + Vercel's built-in Neon Postgres — 100% free, no third-party service.

---

## 🎮 How the game works

| Outcome of your prediction | Points |
| --- | --- |
| Exact score (e.g. you said 2–1, it ended 2–1) | **5** |
| Correct goal difference (right winner + same margin) | **3** |
| Correct outcome only (right winner / draw) | **2** |
| Wrong outcome | 0 |
| Knockout matches | base × **1.5** |
| Correctly picking the tournament champion | **+15** |

- Predictions **lock** automatically at kick-off.
- Group standings, the knockout bracket and the leaderboard all update as results arrive.
- Each member predicts a **champion** from the Dashboard (worth +15 if correct).

---

## 👥 Accounts (logins)

Every team member already has an account. **Username = first name (lowercase). Password = name + `0*`.**

| Username | Password | Member | Admin |
| --- | --- | --- | --- |
| `mohamed` | `mohamed0*` | Mohamed Ben Arfa | ✅ |
| `imen` | `imen0*` | Imen Badri | ✅ |
| `motez` | `motez0*` | Motez Baccouch | ✅ |
| `sahar` | `sahar0*` | Sahar Sallah | |
| `hayfa` | `hayfa0*` | Hayfa Chouchene | |
| `hassene` | `hassene0*` | Hassene Afif | |
| `amal` | `amal0*` | Amal Bentaleb | |
| `nermine` | `nermine0*` | Nermine Ben Ammar | |
| `ahmed` | `ahmed0*` | Ahmed Ben Aissa | |
| `nour` | `nour0*` | Nour Cheour | |
| `eya` | `eya0*` | Eya Ben Aziza | |

> The password suffix (`0*`) is configurable via the `PASSWORD_SUFFIX` env var. Edit the roster in
> [`src/data/members.json`](src/data/members.json).

---

## 🚀 Deploy on Vercel (free, with the database working)

### 1. Push the code to GitHub
Create a new GitHub repo and push this `welyne-wc` folder to it.

### 2. Import into Vercel
- Go to **vercel.com → Add New → Project** and import the repo.
- If the repo root contains this folder, set **Root Directory = `welyne-wc`**.
- Framework preset: **Next.js** (auto-detected). Don't deploy yet — add the database first.

### 3. Create the free database (no third-party account)
- In your new Vercel project, open the **Storage** tab → **Create Database** → **Neon (Postgres)** → follow the prompts.
- Vercel automatically injects a **`DATABASE_URL`** env var into the project. ✅ That's the whole database setup.

> If a build ever fails on `prisma db push` because the injected URL is a *pooled* connection, copy the
> **unpooled / direct** connection string from the Storage tab and set it as `DATABASE_URL`. For 11
> users you don't need pooling.

### 4. Add the remaining environment variables
In **Settings → Environment Variables**, add:

| Key | Value |
| --- | --- |
| `AUTH_SECRET` | any long random string (e.g. run `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`) |
| `SETUP_SECRET` | another long random string — protects the seeding & sync endpoints |
| `PASSWORD_SUFFIX` | `0*` |
| `FOOTBALL_DATA_TOKEN` | *(optional)* your free token from [football-data.org](https://www.football-data.org/client/register) |
| `CRON_SECRET` | *(optional)* random string — lets the scheduled auto-sync run |

`DATABASE_URL` is already there from step 3.

### 5. Deploy
Click **Deploy**. The build runs `prisma generate && prisma db push` (creates the tables) then builds Next.js.

### 6. Seed the data (one time)
After the first successful deploy, open this URL once (replace the host and your secret):

```
https://YOUR-APP.vercel.app/api/setup?key=YOUR_SETUP_SECRET
```

You'll get `{ "ok": true, "counts": { "teams": 48, "matches": 104, "users": 11 } }`. Done — the
group results already played are loaded and scored. Visit the app and log in. 🎉

> Re-running `/api/setup` is safe: it upserts teams/matches and re-scores, and it never resets a user's
> password or predictions.

---

## 🔄 Keeping results up to date

1. **Automatic (free):** with `FOOTBALL_DATA_TOKEN` + `CRON_SECRET` set, `vercel.json` schedules
   `/api/sync` every 6 hours to pull live scores and recompute points. *(On Vercel's Hobby plan, crons
   run roughly once per day — that's fine; you can always sync manually.)*
2. **Manual sync:** any **admin** sees a **“Sync results”** button on the Dashboard.
3. **By hand:** any **admin** can type a final score directly on each match card (“Admin result → Set FT”).
   This also assigns/decides knockout matches. Great if you don't want to use the API at all.

> Knockout matches start as bracket slots ("Winner Group A", "Best 3rd #1", …). Once the real teams
> are known, the sync (or an admin) fills them in and everyone can predict those ties.

---

## 🧑‍💻 Run it locally

```bash
cp .env.example .env          # then fill in DATABASE_URL + AUTH_SECRET
npm install
npx prisma db push            # create tables
npm run seed                  # load teams, matches, users
npm run dev                   # http://localhost:3000
```

You need a Postgres database for local dev too — the easiest free option is the same Neon database
(copy its connection string into `.env`).

---

## 📁 Project structure

```
src/
  app/
    page.tsx              Dashboard (points, rank, champion pick, predict next, results)
    login/               Sign-in
    matches/             All fixtures by group / knockouts — predict here
    groups/              Live group standings
    bracket/             Knockout bracket
    teams/               48 teams + title odds
    leaderboard/         The Welyne table
    api/                 login, logout, predictions, champion, sync, admin/result, setup
  components/            Nav, MatchCard, ChampionPicker, Avatar, SyncButton, LogoutButton
  lib/                   prisma, auth, password, scoring, scoreEngine, standings, footballData, seed
  data/                  teams.json · fixtures.json · members.json   ← edit these to tweak data
prisma/schema.prisma     User · Team · Match · Prediction
```

Tweak the scoring numbers in [`src/lib/scoring.ts`](src/lib/scoring.ts).

---

Built for Welyne — *there's a **WE** in Welyne.* ⚽🔥
