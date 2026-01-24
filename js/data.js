// ===============================
// 🌐 API
// ===============================
const API_URL = import.meta.env.VITE_API_URL || (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost:3000';
  return `${window.location.protocol}//${window.location.host}`;
})();

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Non connecté');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const DataManager = {
  async loadOffers() {
    const response = await fetch(`${API_URL}/offers`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Erreur chargement offres');
    return await response.json();
  },

  async addOffer(offer) {
    const response = await fetch(`${API_URL}/offers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(offer)
    });

    if (!response.ok) throw new Error('Erreur ajout');
    return await response.json();
  },

  async deleteOffer(idOffer) {
    const response = await fetch(`${API_URL}/offers/${idOffer}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Erreur suppression');
    return await response.json();
  },

  async updateOffer(idOffer, updates) {
    const response = await fetch(`${API_URL}/offers`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: idOffer, updates })
    });

    if (!response.ok) throw new Error('Erreur mise à jour');
    return await response.json();
  }
};
