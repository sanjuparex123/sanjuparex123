# StockyPro (Shopify Embedded App)

Production-grade Shopify embedded inventory and purchasing platform inspired by Stocky.

## Stack
React + React Router v7 + Vite + Polaris + App Bridge + Zustand + TanStack Query, Node/Express + Prisma/Postgres, GraphQL + REST, Redis + BullMQ, Docker.

## Architecture
- `apps/web`: Embedded admin UI with analytics dashboard and module pages.
- `apps/api`: API gateway, Shopify auth/webhooks, REST+GraphQL, background jobs.
- `packages/shared`: DTOs, enums, validators.
- `prisma`: multi-tenant data model, indexes, soft deletes, audit support.

## Quick Start
1. `cp .env.example .env`
2. `docker compose up -d postgres redis`
3. `npm install`
4. `npm --workspace @stockypro/api run prisma:migrate`
5. `npm run dev`

## Core Modules
Dashboard, Purchase Orders, Suppliers, Vendors, Inventory, Forecasting, Barcode Receiving, Reports, Activity Logs.

## Security
OAuth, CSRF headers, webhook HMAC verification, RBAC middleware, zod validation.

## DevOps
Includes Dockerfiles, compose, CI workflow, migration + seed scripts.
