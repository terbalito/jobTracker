// 🔥 auth.js (Frontend)
console.log("🔥 auth.js chargé");

// Instance Firebase
const authInstance = window.auth;

// DOM
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const switchAuth = document.getElementById("switch-auth");
const authTitle = document.getElementById("auth-title");
const passwordConfirm = document.getElementById("password-confirm");
const authError = document.getElementById("auth-error");
const authScreen = document.getElementById("auth-screen");

// State
let mode = "login";


// 🔧 Fonction utilitaire loader bouton
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add("btn-loading");
        button.disabled = true;
    } else {
        button.classList.remove("btn-loading");
        button.disabled = false;
    }
}

// 🔧 Animation shake
function triggerShake() {
    authScreen.classList.add("shake");
    setTimeout(() => {
        authScreen.classList.remove("shake");
    }, 400);
}

// SWITCH LOGIN / SIGNUP
switchAuth.addEventListener("click", () => {
    if (mode === "login") {
        mode = "signup";
        loginBtn.classList.add("hidden");
        signupBtn.classList.remove("hidden");
        passwordConfirm.classList.remove("hidden");
        authTitle.textContent = "Créer un compte";
        switchAuth.textContent = "Déjà un compte ? Se connecter";
    } else {
        mode = "login";
        loginBtn.classList.remove("hidden");
        signupBtn.classList.add("hidden");
        passwordConfirm.classList.add("hidden");
        authTitle.textContent = "Se connecter";
        switchAuth.textContent = "Pas encore de compte ? S'inscrire";
    }

    authError.textContent = "";
});


// ==========================
// 🚀 SIGNUP
// ==========================

signupBtn.addEventListener("click", async () => {

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("password-confirm").value;

    authError.textContent = "";

    if (!email || !password || !confirm) {
        authError.textContent = "Remplis tous les champs !";
        triggerShake();
        return;
    }

    if (password !== confirm) {
        authError.textContent = "Les mots de passe ne correspondent pas !";
        triggerShake();
        return;
    }

    setButtonLoading(signupBtn, true);

    try {
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("token", token);

        location.reload();

    } catch (err) {
        console.error(err);

        switch(err.code) {
            case "auth/email-already-in-use":
                authError.textContent = "Cet email est déjà utilisé !";
                break;
            case "auth/invalid-email":
                authError.textContent = "Email invalide !";
                break;
            case "auth/weak-password":
                authError.textContent = "Mot de passe trop faible !";
                break;
            default:
                authError.textContent = "Erreur lors de la création du compte.";
                break;
        }

        triggerShake();

    } finally {
        setButtonLoading(signupBtn, false);
    }
});


// ==========================
// 🔐 LOGIN
// ==========================

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    authError.textContent = "";

    if (!email || !password) {
        authError.textContent = "Remplis tous les champs !";
        triggerShake();
        return;
    }

    setButtonLoading(loginBtn, true);

    try {
        const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("token", token);

        location.reload();

    } catch (err) {
        console.error(err);

        switch(err.code) {
            case "auth/user-not-found":
                authError.textContent = "Utilisateur non trouvé !";
                break;
            case "auth/wrong-password":
            case "auth/invalid-credential":
                authError.textContent = "Mot de passe incorrect !";
                break;
            case "auth/invalid-email":
                authError.textContent = "Email invalide !";
                break;
            default:
                authError.textContent = "Erreur lors de la connexion.";
                break;
        }

        triggerShake();

    } finally {
        setButtonLoading(loginBtn, false);
    }
});
