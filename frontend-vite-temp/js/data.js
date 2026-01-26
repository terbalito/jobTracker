// ===============================
// 🌐 DataManager - communication avec le backend
// ===============================
console.log("data.js chargé correctement");

// URL de l'API (gérée par Vite)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log("API utilisée :", API_URL);

// Récupérer le token Firebase dans le localStorage
async function getAuthHeaders() {
    const user = window.auth.currentUser;
    if (!user) {
        throw new Error("Non connecté");
    }

    const token = await user.getIdToken(true); // 🔥 token toujours valide
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// Gestion des réponses
async function handleResponse(res) {
    if (!res.ok) {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            throw new Error(json.error || json.message || 'Erreur API');
        } catch {
            throw new Error(text || 'Erreur API inconnue');
        }
    }
    return res.json();
}

export const DataManager = {
    // Charger toutes les offres
    async loadOffers() {
        const res = await fetch(`${API_URL}/offers`, {
            headers: await getAuthHeaders()
        });
        return handleResponse(res);
    },

    // Ajouter une offre
    async addOffer(offer) {
        const res = await fetch(`${API_URL}/offers`, {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify(offer)
        });
        return handleResponse(res);
    },

    async updateOffer(id, updates) {
        const res = await fetch(`${API_URL}/offers/${id}`, {
            method: 'PATCH',
            headers: await getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        return handleResponse(res);
    },

    async deleteOffer(id) {
        const res = await fetch(`${API_URL}/offers/${id}`, {
            method: 'DELETE',
            headers: await getAuthHeaders()
        });
        return handleResponse(res);
    }
};
