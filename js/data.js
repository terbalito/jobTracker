// ===============================
// 🔑 Gestion utilisateur (ID + lien magique)
// ===============================

// Récupération du token depuis l'URL (?token=...)
const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get('token');

// userId = URL > localStorage
let userId = tokenFromUrl || localStorage.getItem('userId');

if (tokenFromUrl) {
    localStorage.setItem('userId', tokenFromUrl);
}

// ===============================
// 🌐 API
// ===============================
const API_URL = 'https://job-tracker-ouli.onrender.com';
// const API_URL = 'http://localhost:3000';

export const DataManager = {
    // -------------------------------
    // 👤 Création / garantie utilisateur
    // -------------------------------
    async ensureUser() {
        if (userId) return userId;

        const response = await fetch(`${API_URL}/create-user`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Erreur création utilisateur');
        }

        const data = await response.json();
        userId = data.userId;
        localStorage.setItem('userId', userId);

        return userId;
    },

    // -------------------------------
    // 📥 Charger les offres
    // -------------------------------
    async loadOffers() {
        const id = await this.ensureUser();

        const response = await fetch(`${API_URL}/offers/${id}`);

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }

        return await response.json();
    },

    // -------------------------------
    // ➕ Ajouter une offre
    // -------------------------------
    async addOffer(offer) {
        const id = await this.ensureUser();

        const response = await fetch(`${API_URL}/offers/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(offer)
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}`);
        }

        return await response.json();
    },

    // -------------------------------
    // 🗑️ Supprimer une offre
    // -------------------------------
    async deleteOffer(idOffer) {
        const id = await this.ensureUser();

        const response = await fetch(`${API_URL}/offers/${id}/${idOffer}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Erreur suppression');
        }
    },

    // -------------------------------
    // 🔄 Toggle postulée
    // -------------------------------
    async togglePostulated(idOffer) {
        const id = await this.ensureUser();

        const response = await fetch(`${API_URL}/offers/${id}/${idOffer}/toggle`, {
            method: 'PATCH'
        });

        if (!response.ok) {
            throw new Error('Erreur mise à jour');
        }
    },

    // -------------------------------
    // 🔗 Lien magique
    // -------------------------------
    getMagicLink() {
        if (!userId) return null;
        return `${window.location.origin}${window.location.pathname}?token=${userId}`;
    }
};
