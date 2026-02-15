# Nura Space Code Challange

- Demo URL: https://nuraspace.duckdns.org
- admin / admin123 (can push messages)
- demo / demo123
  
## Matches Requirements

1. Login
- Users log in with a username + password.
- Demo users are stored in-memory on the server.

2. Home Page
- User can search/select a city.
- App shows the current weather for the selected city (Open-Meteo API).

3. Live Messages (WebSockets)
- Clients join a city room.
- Server can push realtime popups to that city.
- There is an HTTP endpoint to push a message to a target city.
- Server can periodically refetch weather and push updates to connected clients over WebSockets.

## Tech Stack

- Frontend: React + Vite + MUI + React Query + Socket.IO client
- Backend: Node.js + Express + Socket.IO + Zod
- Storage: in-memory 
- Weather API: Open-Meteo

## Run Locally (Dev)

In one terminal at repo root:
- npm install
- npm run dev

Client: http://localhost:5173
Server: http://localhost:4000

## Environment Variables (Server)

File: server/.env

- PORT=4000
- JWT_SECRET=...
- CORS_ORIGIN=http://localhost:5173   
- WS_WEATHER_ENABLED=true|false       
- WS_WEATHER_INTERVAL_MS=60000


