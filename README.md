# Shift Management Module

University course group swap management system prototype for Moodle integration.

## Overview

ShiftModule is a pnpm monorepo with:

- `apps/server`: NestJS API with in-memory mock repositories and Swagger docs
- `apps/client`: React 19 + Vite frontend
- `packages/types`: shared enums, DTOs, and domain models

The current implementation supports:

- student swap requests in solo and paired flows
- professor approval, rejection, and manual request review
- admin course, group, student, and study-major management
- request notifications surfaced through backend console logging

## Quick Start

### Prerequisites

- Node.js 18 or newer
- pnpm 9 or newer

### Install

```bash
pnpm install
```

### Run

```bash
# Start both apps
pnpm dev

# Or run them separately:
cd apps/server && pnpm dev
cd apps/client && pnpm dev
```

### Access

- Frontend: http://localhost:5173
- API: http://localhost:3000
- API docs: http://localhost:3000/api/docs

## Configuration

Backend environment variables are documented in `apps/server/README.md`.
Frontend environment variables are documented in `apps/client/README.md`.

## Verification

See `apps/server/README.md` for backend test commands, including the swap-request concurrency e2e spec.
