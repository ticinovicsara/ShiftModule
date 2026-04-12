# @repo/eslint-config

Shared ESLint configuration package for the ShiftModule workspace.

## Exports

This package exposes three configs from `package.json`:

- `./base` -> `base.js`
- `./next-js` -> `next.js`
- `./react-internal` -> `react-internal.js`

## Purpose

Use these configs to keep lint rules consistent across the monorepo instead of duplicating ESLint setup in each app or package.
