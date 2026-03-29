# Shift Management Module

University course group swap management system prototype for Moodle integration.

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 9

### Installation

```bash
pnpm install
```

### Running

```bash
# Start both apps
pnpm dev

# Or separately:
# Terminal 1 - Backend (port 3000)
cd apps/server && pnpm dev

# Terminal 2 - Frontend (port 5173)
cd apps/client && pnpm dev
```

### Access
- Frontend: http://localhost:5173
- API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

### Demo Users
Any password works (mock auth):
- `admin@fesb.hr` - Admin
- `ivan.horvat@fesb.hr` - Professor
- `student1@fesb.hr` - Student

## Project Structure

```
apps/
├── client/     # React frontend
└── server/     # NestJS backend
packages/
├── types/      # Shared TypeScript types
└── ...
```

## Features

- Student group swap requests (SOLO/DIRECT/AUTO modes)
- Professor approval workflow
- Admin management
- Email notifications (console)

## Configuration

See `.env.example` for environment variables.

## Tech Stack

- Backend: NestJS + JWT + Repository pattern
- Frontend: React 19 + Vite + TanStack Query
- Monorepo: Turborepo + pnpm
