const authView = document.querySelector('#auth-view');
const accountView = document.querySelector('#account-view');
const authForm = document.querySelector('#auth-form');
const nameField = document.querySelector('#name-field');
const modeToggle = document.querySelector('#mode-toggle');
const message = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
let isRegistering = false;

function setMode(registering) {
  isRegistering = registering;
  nameField.classList.toggle('hidden', !registering);
  document.querySelector('#form-kicker').textContent = registering ? 'New here?' : 'Welcome back';
  document.querySelector('#form-title').textContent = registering ? 'Create your account' : 'Sign in to Harbor';
  document.querySelector('#form-subtitle').textContent = registering ? 'A calmer place to get things done.' : 'Your next good idea is waiting.';
  submitButton.childNodes[0].textContent = registering ? 'Create workspace ' : 'Enter workspace ';
  modeToggle.innerHTML = registering ? 'Already have an account? <strong>Sign in</strong>' : 'Need an account? <strong>Create one</strong>';
  authForm.reset();
  message.textContent = '';
}

async function checkSession() {
  const response = await fetch('/api/me');
  if (response.ok) showAccount((await response.json()).user);
}

function showAccount(user) {
  authView.classList.add('hidden');
  accountView.classList.remove('hidden');
  document.querySelector('#account-title').textContent = `Welcome, ${user.name}`;
  document.querySelector('#account-email').textContent = user.email;
  document.querySelector('#signal-text').textContent = 'Session active';
}

modeToggle.addEventListener('click', () => setMode(!isRegistering));
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  const data = Object.fromEntries(new FormData(authForm));
  const response = await fetch(isRegistering ? '/api/register' : '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) { message.textContent = result.error; return; }
  showAccount(result.user);
});

document.querySelector('#logout-button').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  accountView.classList.add('hidden');
  authView.classList.remove('hidden');
  document.querySelector('#signal-text').textContent = 'Session protected';
  setMode(false);
});

checkSession();