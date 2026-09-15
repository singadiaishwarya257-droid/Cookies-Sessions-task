const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const sessionCookie = 'sid';
const sessions = new Map();
const users = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readCookie(request, name) {
  const cookies = request.headers.cookie?.split(';') || [];
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
}

function createSession(user) {
  const id = crypto.randomBytes(32).toString('hex');
  sessions.set(id, { user, createdAt: Date.now() });
  return id;
}

function currentSession(request) {
  const id = readCookie(request, sessionCookie);
  return id ? { id, data: sessions.get(id) } : null;
}

function requireSession(request, response, next) {
  const session = currentSession(request);
  if (!session?.data) {
    return response.status(401).json({ error: 'Your session is not active.' });
  }
  request.session = session;
  next();
}

app.post('/api/register', (request, response) => {
  const { name, email, password } = request.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    return response.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return response.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (users.has(normalizedEmail)) {
    return response.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = { name: String(name).trim(), email: normalizedEmail };
  users.set(normalizedEmail, { ...user, password });
  const sessionId = createSession(user);

  response.cookie(sessionCookie, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    path: '/',
  });
  response.status(201).json({ user });
});

app.post('/api/login', (request, response) => {
  const { email, password } = request.body;
  const account = users.get(String(email || '').trim().toLowerCase());

  if (!account || account.password !== password) {
    return response.status(401).json({ error: 'Email or password is incorrect.' });
  }

  const sessionId = createSession({ name: account.name, email: account.email });
  response.cookie(sessionCookie, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    path: '/',
  });
  response.json({ user: { name: account.name, email: account.email } });
});

app.get('/api/me', requireSession, (request, response) => {
  response.json({ user: request.session.data.user });
});

app.post('/api/logout', (request, response) => {
  const sessionId = readCookie(request, sessionCookie);
  if (sessionId) sessions.delete(sessionId);
  response.clearCookie(sessionCookie, { httpOnly: true, sameSite: 'lax', path: '/' });
  response.status(204).end();
});

app.listen(port, () => {
  console.log(`Cookies & Sessions app running at http://localhost:${port}`);
});