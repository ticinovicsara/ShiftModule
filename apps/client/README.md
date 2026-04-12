# ShiftModule Web

React 19 + TypeScript + Vite frontend for the ShiftModule swap-management prototype.

## Current Stack

- React 19
- TypeScript
- Vite
- TanStack React Query v5
- Axios
- React Router
- Tailwind CSS v4

## Scripts

From `apps/client`:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## Environment

- `VITE_API_BASE_URL` - backend base URL, default `http://localhost:3000`

## Runtime Behavior

- Auth tokens are stored in `localStorage` under `shiftmodule.access_token`.
- The axios client unwraps `{ data, message, error }` envelopes from the backend.
- Role-based routing is handled through `src/routes/AppRouter.tsx` and `src/routes/ProtectedRoute.tsx`.
- `AppLayout` renders authenticated pages, while `AuthLayout` is used for `/login`.

## Documentation

Implementation details are documented in `apps/client/docs/*.md`.
