// ===============================
// 🌐 DataManager - communication avec le backend
// ===============================
console.log("data.js chargé correctement");
const API_URL = (() => {
    const hostname = window.location.hostname;
    // local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // prod → backend Render
    return 'https://jobtracker-q655.onrender.com';
})();

// Récupérer le token Firebase dans le localStorage
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Non connecté');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
        const res = await fetch(`${API_URL}/offers`, { headers: getAuthHeaders() });
        const data = await handleResponse(res);
        console.log("DATA DU BACKEND :", data);
        return data;
    }, // ✅ VIRGULE MANQUANTE ICI

    // Ajouter une offre
    async addOffer(offer) {
        const res = await fetch(`${API_URL}/offers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(offer)
        });
        return handleResponse(res);
    },

    // Mettre à jour une offre
    async updateOffer(id, updates) {
        const res = await fetch(`${API_URL}/offers/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        return handleResponse(res);
    },

    // Supprimer une offre
    async deleteOffer(id) {
        const res = await fetch(`${API_URL}/offers/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    }
};

