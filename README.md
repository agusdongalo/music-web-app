# music-web-app

## Dev servers

Start backend (root):

```powershell
npm run dev
```

Backend runs at `http://localhost:4000`.

Start frontend (in another terminal):

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. If 5173 is in use, Vite will choose another port and print the URL in the terminal.

## Audius (full tracks)

This app uses Audius for full-length playback without Spotify Premium. The backend exposes:

- `GET /audius/search?q=...&limit=...`

Optional env setting (root `.env`):

```
AUDIUS_APP_NAME="music-app"
```

The Search page and Home page both pull Audius results and play full tracks.

## UI notes

- Search uses an in-page dropdown (no page jump), with filters for Songs / Playlists / Artists.
- Albums are hidden in search results (tracks + artists only).
- Now Playing panel is wired to the active track and includes a Queue view.

## Demo account

Use the seeded demo account to sign in:

- Email: `demo@music.app`
- Password: `password123`

If you need to re-seed the database:

```powershell
npm run seed
```
