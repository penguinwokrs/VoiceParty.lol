# VoiceParty.lol Project Analysis

## Project Overview

**VoiceParty.lol** (formerly LoBump) is a real-time voice chat application integrated with Riot Games authentication. It uses **Cloudflare Workers/Pages** for the backend and **React (Vite)** for the frontend. Real-time voice features are powered by **Cloudflare RealtimeKit**.

## Architecture

### Frontend (`src/`)

- **Framework**: React 18, Vite.
- **UI**: Material UI (MUI).
- **Routing**: React Router DOM.
- **State/Logic**: Custom hooks (`useRealtime.ts` for WebRTC/Voice).
- **Authentication**: Stores User ID in `localStorage` (`vp_user_id`), relies on Backend sessions.

### Backend (`functions/api/`)

- **Platform**: Cloudflare Pages Functions (Hono framework).
- **Database**: Cloudflare KV (`VC_SESSIONS`).
- **Realtime**: Cloudflare RealtimeKit API (REST API for room creation/token generation).
- **Authentication**: Riot Games OAuth 2.0 (Authorization Code Flow).
- **Endpoints**:
  - `GET /api/auth/login`: Redirects to Riot Login.
  - `GET /api/auth/callback`: Exchanges code for Riot token.
  - `POST /api/sessions`: Creates random session (Legacy).
  - `POST /api/sessions/:id/join`: Joins or Creates session for Game ID.

### Data Models (KV Schema)

Managed in `VC_SESSIONS` namespace.

1. **Game ID Mapping**
    - Key: `game:{gameID}`
    - Value: `{meetingId}` (String)
    - Purpose: Maps a user-friendly Game ID to the internal RealtimeKit Meeting ID.

2. **Session Data**
    - Key: `session:{meetingId}`
    - Value (JSON):

        ```typescript
        type Session = {
          sessionId: string; // The user-facing Game ID
          meetingId: string; // The RealtimeKit ID
          users: {
            userId: string;
            joinedAt: number;
            iconUrl?: string; // Optional URL
          }[];
          createdAt: number;
        }
        ```

## Key Workflows

### 1. Join/Create Room (Game ID)

1. User enters Game ID (e.g., "game-123") in UI.
2. Frontend requests `POST /api/sessions/game-123/join`.
3. Backend checks `game:game-123` in KV.
    - **If exists**: Gets `meetingId`, retrieves Session from `session:{meetingId}`, adds user, returns Token.
    - **If missing**:
        1. Calls RealtimeKit API to create new Meeting (Name=`game-123`).
        2. Saves mapping `game:game-123` -> `new-meeting-id`.
        3. Saves session data to `session:new-meeting-id`.
        4. Returns Token.

### 2. Mock Mode (Development/Test)

Controlled by `USE_MOCK_REALTIME` environment variable.

- **Backend**: If `USE_MOCK_REALTIME="true"`, API calls to Cloudflare RealtimeKit are skipped. Returns `mock-meeting-{gameId}` and `mock-token`.
- **Frontend**: `useRealtime` hook detects `mock-token`. Instead of connecting to RealtimeKit SDK, it enters a "Simulated Connected" state (UI shows connected, Mic toggle works state-wise, no actual audio).
- **Tests**: `functions/api/index.test.ts` defaults to Mock Mode. Dedicated `Integration Logic` test block verifies API payload construction (Mock=False).

## Directory Structure

- `functions/api/[[route]].ts`: Main Backend logic (Hono app).
- `src/components/VoiceChat/`: Main UI logic.
  - `index.tsx`: Component UI & Session State handling.
  - `useRealtime.ts`: RealtimeKit SDK wrapper & Mock Mode logic.
- `functions/api/index.test.ts`: Backend Tests (Vitest).

## Environment Variables

- `RIOT_CLIENT_ID`, `RIOT_CLIENT_SECRET`: Riot Auth.
- `REALTIME_ORG_ID`, `REALTIME_API_KEY`, `REALTIME_KIT_APP_ID`: RealtimeKit Auth.
- `USE_MOCK_REALTIME`: "true" to enable Mock Mode.

## Storybook Integration

This project is configured with Storybook and the `@storybook/addon-mcp` for AI integration.

### Setup
1. Run Storybook:
   ```bash
   pnpm storybook
   ```
2. The Storybook instance provides an MCP server at `http://localhost:6006/mcp`.

### Cursor Configuration
This project includes a Cursor MCP configuration file at `.cursor/mcp.json` that automatically connects to the Storybook MCP server.

**Automatic Setup (Recommended):**
The project-specific configuration file (`.cursor/mcp.json`) is already set up. Cursor will automatically detect and use this configuration when you open the project.

**Manual Setup (Alternative):**
If you prefer to configure it manually:
1. Open Cursor Settings > Features > MCP.
2. Add a new MCP Server:
   - **Type**: SSE
   - **Name**: storybook
   - **URL**: `http://localhost:6006/mcp`

**Note:** Make sure Storybook is running (`pnpm storybook`) before Cursor tries to connect to the MCP server.

### Development Guidelines
- When creating or modifying UI components, always create or update the corresponding `*.stories.tsx` file.
- Use the Storybook MCP tools to retrieve component usage examples and guidelines.
