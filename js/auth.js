const API_URL = location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `${location.protocol}//${location.host}`;

async function auth(type) {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_URL}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById('auth-error').textContent = data.error || 'Erreur inconnue';
      return;
    }

    localStorage.setItem('token', data.token);
    location.reload(); // recharge la page pour afficher l'app
  } catch (err) {
    document.getElementById('auth-error').textContent = 'Erreur réseau';
    console.error(err);
  }
}

document.getElementById('signup-btn').onclick = () => auth('signup');
document.getElementById('login-btn').onclick = () => auth('login');

const switchAuth = document.getElementById('switch-auth');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const authTitle = document.getElementById('auth-title');

let isLogin = true;

switchAuth.addEventListener('click', () => {
    isLogin = !isLogin;

    if (isLogin) {
        authTitle.textContent = 'Se connecter';
        loginBtn.classList.remove('hidden');
        signupBtn.classList.add('hidden');
        switchAuth.textContent = "Pas encore de compte ? S'inscrire";
    } else {
        authTitle.textContent = 'Créer un compte';
        loginBtn.classList.add('hidden');
        signupBtn.classList.remove('hidden');
        switchAuth.textContent = 'Déjà un compte ? Se connecter';
    }
});

