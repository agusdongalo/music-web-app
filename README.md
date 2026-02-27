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

## Demo account

Use the seeded demo account to sign in:

- Email: `demo@music.app`
- Password: `password123`

If you need to re-seed the database:

```powershell
npm run seed
```
