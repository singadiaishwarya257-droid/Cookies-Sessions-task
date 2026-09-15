# Harbor: Cookies & Sessions

A small Node.js and Express application that demonstrates authentication with browser cookies and server-side sessions.

## Run it

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser. Create an account, refresh the page to see the session restored from the cookie, then sign out to destroy the session.

## How it works

- User accounts are kept in memory for this learning example.
- A successful registration or login creates a random session ID with Node's `crypto` module.
- The server stores the user data in a `Map` keyed by that ID.
- The browser receives only the ID in an `HttpOnly`, `SameSite=Lax` cookie named `sid`.
- `/api/me` reads the cookie and resolves the current session; `/api/logout` deletes it and clears the cookie.

For production, replace the in-memory maps with a database and a shared session store, hash passwords with a password-hashing library, and use HTTPS with secure cookies.