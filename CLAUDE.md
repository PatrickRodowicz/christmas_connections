# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + client)
npm run install:all

# Run development mode (server + client concurrently)
npm run dev

# Run only the server (port 3001)
npm run dev:server

# Run only the client (port 5173)
npm run dev:client

# Build client for production
npm run build

# Run production server (serves built client)
npm start
```

## Architecture

This is a "Connections" word puzzle game (similar to the NY Times game) with a React frontend and Express backend.

### Server (`server/`)
- `index.js` - Express server on port 3001
- Single API endpoint: `GET /api/puzzle` - returns shuffled puzzle items with group metadata
- Serves static files from `client/dist` in production

### Client (`client/`)
- React 18 + Vite app
- Vite dev server proxies `/api` requests to backend (configured in `vite.config.js`)

### Puzzle Format (`server/puzzles/puzzle.json`)
Puzzles have 4 groups, each with:
- `name`: Group category displayed when solved
- `difficulty`: 1-4 (yellow, green, blue, purple)
- `items`: Array of 4 words belonging to the group

### Game State (in `App.jsx`)
- `items`: Remaining unsolved puzzle items
- `selected`: Currently selected items (max 4)
- `solvedGroups`: Correctly guessed groups (sorted by difficulty)
- `lives`: Mistakes remaining (starts at 4)
