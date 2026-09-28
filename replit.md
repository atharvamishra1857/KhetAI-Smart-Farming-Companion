# KhetAI

KhetAI is a smart farming companion for Indian farmers, combining crop disease diagnosis with mandi price discovery and scan history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/khetai run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required for crop diagnosis: `GEMINI_API_KEY` — user-provided Gemini API key stored as a workspace secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/khetai/src/App.tsx` — responsive web app shell and product routes
- `artifacts/khetai/src/index.css` — KhetAI earth-tone theme and motion utilities
- `artifacts/api-server/src/routes/khetai.ts` — dashboard, mandi, and scan API routes
- `artifacts/api-server/src/lib/diagnosis.ts` — Gemini Vision request and structured diagnosis parsing
- `artifacts/api-server/src/lib/mandi.ts` — AGMARKNET adapter with explicit reference-rate fallback
- `lib/db/src/schema/scans.ts` — persisted scan result schema
- `lib/api-spec/openapi.yaml` — source of truth for API contracts

## Architecture decisions

- Scan history stores structured diagnoses in PostgreSQL; raw uploaded image bytes are not retained.
- Crop diagnosis uses the direct Gemini API with `GEMINI_API_KEY` because the managed AI integration was not available on the current account.
- Mandi data attempts AGMARKNET first and returns clearly labeled reference rates when the government feed is unreachable.

## Product

- Bilingual Hindi/English landing dashboard for crop decisions
- Mobile-friendly photo upload and camera capture for crop disease diagnosis
- Mandi price search with commodity, district, and state filters
- Persistent scan history and detail views

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
