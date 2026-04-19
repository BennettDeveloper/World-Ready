const USERS_KEY = 'wr_users';
const SESSION_KEY = 'wr_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function register({ username, password, name, email }) {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Username already taken.' };
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered.' };
  }
  const user = {
    id: Date.now().toString(),
    username,
    password,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session = { userId: user.id, username: user.username, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

export function login({ username, password }) {
  const users = getUsers();
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) return { success: false, error: 'Invalid username or password.' };
  const session = { userId: user.id, username: user.username, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}

export function resetPassword(username, email, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(
    u => u.username.toLowerCase() === username.toLowerCase() &&
         u.email.toLowerCase() === email.toLowerCase()
  );
  if (idx === -1) return { success: false, error: 'No account found with that username and email.' };
  users[idx].password = newPassword;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}
