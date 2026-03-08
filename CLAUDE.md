# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project: Petfolio

Pet SNS + lifetime portfolio platform. Monorepo with three frontends and one Cloudflare Workers API.

**Before any implementation, always read all three documents simultaneously:**
1. `documents/PLAN.md` — slice checklist (what's done, what's next)
2. `documents/PRD.md` — product requirements and rules
3. `documents/LLD.md` — DB schema + API spec

**Change order: Document → DB Migration → API → UI**

---

## Local Development Commands

### API (Cloudflare Workers + D1)
```bash
cd services/api
npx wrangler dev --local --port 8787      # start local dev server
npx wrangler types                         # regenerate TS types after wrangler.jsonc changes
npm run build                              # type-check only (tsc --noEmit)
npm run test                               # vitest unit tests
npm run deploy:guarded                     # i18n audit + deploy to Cloudflare
```

> **D1 migrations**: `wrangler d1 migrations apply` fails at 0021 — apply migrations individually:
> ```bash
> npx wrangler d1 execute pet-life-db --local --file=src/db/migrations/<file>.sql
> ```

### Admin Web (React + Vite 5, port 5173)
```bash
cd apps/admin-web
npm run dev
npm run build     # tsc -b && vite build
npm run lint      # ESLint 9
```

### Guardian Web (React + Vite 7, port 5174)
```bash
cd apps/guardian-web
npm run dev
npm run build
```

---

## Architecture

### Monorepo Layout
```
apps/
  admin-web/       React + Vite 5 — Admin + Guardian + Public UI (HashRouter)
  guardian-web/    React + Vite 7 — Guardian web (separate build)
  mobile/          Flutter — Guardian/Provider app (skeleton)
services/
  api/             Cloudflare Workers — single entrypoint (src/index.ts)
documents/         PLAN.md · PRD.md · LLD.md (SSOT)
```

### API (services/api)
Single Cloudflare Worker dispatches by URL prefix. No framework — raw `Request`/`Response`.

**Middleware chain:** `CORS → Rate Limit → JWT Auth → Role Guard → Handler`

Route files in `src/routes/`: `pets.ts`, `feeds.ts`, `master.ts`, `devices.ts`, `i18n.ts`, `auth.ts`, `storage.ts`, `guardians.ts`, `bookings.ts`, `friends.ts`, `petAlbum.ts`, `logs.ts`.

**Public routes** (no auth): `/api/v1/health`, `/api/v1/i18n`, `/api/v1/master`, `/api/v1/countries`, `/api/v1/devices`, `/api/v1/feeds`

**Auth required:** `/api/v1/guardians`, `/api/v1/pets`, `/api/v1/storage`, `/api/v1/bookings`, `/api/v1/friends`, `/api/v1/pet-album`

**Admin only:** `/api/v1/admin/*`

**DB:** Cloudflare D1 (SQLite) locally, migrations in `src/db/migrations/` (0001–0048+). Binding name: `DB`. R2 binding: `R2` (bucket: `pet-life-media`).

**API response shape:** `{ success: boolean, data?: T, error?: string, code?: string }`

### Admin Web (apps/admin-web)
- **Router:** `HashRouter` (paths use `#/`)
- **Auth guards:** `<AuthRoute>` (JWT check) + `<RoleRoute allow={[...]}>` (role check)
- **Roles:** `guardian` → `/guardian`, `provider` → `/supplier`, `admin` → `/admin`
- **i18n:** React Context from `lib/i18n.tsx`. All UI text via `t(key)` — zero hardcoding.
- **API client:** `lib/api.ts` — typed fetch wrapper with JWT injection and 401 refresh
- **Styles:** Pure CSS in `src/index.css`. CSS custom properties for design tokens (`--primary`, `--bg`, `--surface`, `--border`, `--text`). Dark mode via `html[data-theme="dark"]`.
  - `ig-*` classes: Instagram-style public pages (PublicHome, ExplorePage)
  - `gm-*` classes: GuardianMainPage dashboard components

### Key Pages (admin-web)
| Page | Route | Description |
|------|-------|-------------|
| `PublicHome` | `/` | Public SNS feed (Instagram-style 3-col) |
| `ExplorePage` | `/explore` | Search + 3-col grid browse |
| `GuardianMainPage` | `/guardian` | Guardian dashboard (pet header + tabs + 2-col layout) |
| `MasterPage` | `/admin/master` | 6-col master data tree (Category→L1→L2→L3→L4→L5) |
| `DevicePage` | `/admin/devices` | 4-col: Type→Manufacturer→Brand→Model |
| `I18nPage` | `/admin/i18n` | 13-language key management |
| `CountriesPage` | `/admin/countries` | Country + currency management |

---

## Critical Rules (from PRD.md)

**i18n / Hardcoding:**
- All UI text must use `t(key)`. No hardcoded strings in UI.
- Register i18n keys in DB before writing UI code.
- Master dropdown options must display current-locale translation, not raw keys.
- Save `master_item_id` (stable ID), never the translated string.

**Master Data:**
- Dropdown source must always be Master API — never hardcoded arrays.
- `master_item_id`/`master_item_key` is the stable saved value; locale label is computed at render time.

**Advertising:**
- No ads on health/disease record screens (ever).

**Data safety:**
- Never delete or reset existing code/data — modify and extend only.

**Deploy gate:**
- `npm run deploy:guarded` runs i18n audit SQL before deploying. Must pass before release.

---

## i18n System

**13 supported languages (fixed):** `ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar`

Adding a language requires: DB `ALTER` column + API `LANGS` array + `i18n.tsx` `SUPPORTED_LANGS`/`LANG_LABELS` — all three simultaneously.

Fallback order: `current_locale → ko → en → key`

---

## Cloudflare Workers Notes

After changing `wrangler.jsonc` bindings, run `npx wrangler types` to regenerate `worker-configuration.d.ts`.

Consult live Cloudflare docs before working on Workers/D1/R2/KV (knowledge may be outdated):
- https://developers.cloudflare.com/workers/
- Limits: `/workers/platform/limits/`

---

## Deployment (CI/CD)

GitHub Actions on push to `main`:
1. **deploy-admin-web** → Cloudflare Pages (`pet-life-admin`), env `VITE_API_URL`
2. **deploy-api** → applies D1 migrations remotely, then `wrangler deploy` to Workers (`pet-life-api`)

Both jobs have 3-attempt retry with 20s/40s backoff.
