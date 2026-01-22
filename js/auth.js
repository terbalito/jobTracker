const API_URL = location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `${location.protocol}//${location.host}`;

async function auth(type) {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm')?.value;

  // ✅ Vérification confirmation avant d'appeler l'API
  if (type === 'signup') {
    if (!passwordConfirm) {
      document.getElementById('auth-error').textContent =
        'Veuillez confirmer le mot de passe';
      return;
    }

    if (password !== passwordConfirm) {
      document.getElementById('auth-error').textContent =
        'Les mots de passe ne correspondent pas';

      const passwordConfirmInput = document.getElementById('password-confirm');
      // Shake et vider le champ
      passwordConfirmInput.classList.remove('shake');
      void passwordConfirmInput.offsetWidth; // trigger reflow
      passwordConfirmInput.classList.add('shake');
      passwordConfirmInput.value = '';

      return; // ⚠️ bloque l'inscription
    }
  }

  // Ici seulement on fait la requête API si tout est ok
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
const passwordConfirmInput = document.getElementById('password-confirm');

let isLogin = true;

switchAuth.addEventListener('click', () => {
  isLogin = !isLogin;
  document.getElementById('auth-error').textContent = '';

  if (isLogin) {
    authTitle.textContent = 'Se connecter';
    loginBtn.classList.remove('hidden');
    signupBtn.classList.add('hidden');
    passwordConfirmInput.classList.add('hidden');
    passwordConfirmInput.value = '';
    switchAuth.textContent = "Pas encore de compte ? S'inscrire";
  } else {
    authTitle.textContent = 'Créer un compte';
    loginBtn.classList.add('hidden');
    signupBtn.classList.remove('hidden');
    passwordConfirmInput.classList.remove('hidden');
    switchAuth.textContent = 'Déjà un compte ? Se connecter';
  }
});
