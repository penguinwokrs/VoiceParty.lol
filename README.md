# VoiceParty.lol

A real-time voice chat application designed for gamers, featuring "Game ID" based room creation and Riot Games authentication.

## Architecture

The system uses a serverless architecture powered by Cloudflare's ecosystem.

```mermaid
graph TD
    User[User] -->|Browser| Frontend[Frontend (React/Vite)]
    Frontend -->|API Requests| Worker[Backend API (Cloudflare Pages Functions)]
    Frontend -->|WebRTC Voice| Realtime[Cloudflare RealtimeKit]
    
    subgraph Cloudflare Platform
        Worker -->|Manage Sessions| KV[(KV: VC_SESSIONS)]
        Worker -->|Create Rooms/Tokens| RealtimeAPI[RealtimeKit API]
    end

    subgraph External
        Worker -->|OAuth| Riot[Riot Games Auth]
    end

    %% Data Flow
    Frontend -.->|1. Join GameID| Worker
    Worker -.->|2. Check/Create| KV
    Worker -.->|3. Create Mtg| RealtimeAPI
    Worker -.->|4. Return Token| Frontend
    Frontend -.->|5. Connect| Realtime
```

## Tech Stack

-   **Frontend**: React, TypeScript, Vite, Material UI (MUI), Cloudflare RealtimeKit React SDK.
-   **Backend**: Cloudflare Pages Functions (Hono Framework).
-   **Database**: Cloudflare KV (Session persistence).
-   **Realtime**: Cloudflare RealtimeKit (WebRTC Audio).
-   **Auth**: Riot Games (OAuth 2.0).

## Features

-   **Game ID Rooms**: Join or create voice rooms simply by entering a Game ID.
-   **Auto-Creation**: Rooms are automatically created on-demand if they don't exist.
-   **Mock Mode**: Built-in mock mode for development and testing without requiring live API keys.
-   **Riot Auth**: Secure identity verification via Riot Games accounts.

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   pnpm
-   Cloudflare Wrangler CLI

### Installation

```bash
pnpm install
```

### Development (Real Mode)

Requires `wrangler.toml` or `.dev.vars` configured with real API credentials.

```bash
pnpm dev
# Backend runs at http://localhost:8788
# Frontend proxies /api requests to Backend
```

### Development (Mock Mode)

Run without needing RealtimeKit or Riot credentials. Uses simulated voice connection and mocked API.

1.  Set default env var or use `.dev.vars`:
    ```
    USE_MOCK_REALTIME="true"
    ```
2.  Run:
    ```bash
    pnpm dev
    ```

### Testing

Run the test suite (defaults to Mock Mode):

```bash
pnpm test
```

## Developer Guide

For detailed project analysis, directory structure, and internal workflows, see [AGENT.md](./AGENT.md).
