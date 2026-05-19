# CampusLink

CampusLink is an integrated student communication platform for educational institutions.

## Prerequisites

- Node.js (LTS)
- Docker & Docker Compose (for MySQL)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   npm run install:all
   ```

2. **Database setup:**
   ```bash
   docker-compose up -d
   ```

3. **Environment variables:**
   - Copy `server/.env.example` to `server/.env` and update the values.

4. **Start the application:**
   ```bash
   npm run dev
   ```
   This will start both the Express backend and the Vite frontend concurrently.

## Documentation

- The frontend is located in the `client/` directory.
- The backend is located in the `server/` directory.
