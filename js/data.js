// data.js
let userId = localStorage.getItem('userId');

async function getUserId() {
    if (!userId) {
        try {
            const res = await fetch('http://localhost:3000/create-user', { method: 'POST' });
            const data = await res.json();
            userId = data.userId;
            localStorage.setItem('userId', userId);
        } catch (e) {
            console.error("Erreur lors de la création de l'utilisateur :", e);
        }
    }
    return userId;
}

export const DataManager = {
    async loadOffers() {
        try {
            const id = await getUserId();
            const res = await fetch(`http://localhost:3000/offers/${id}`);
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const offers = await res.json();
            return offers;
        } catch (e) {
            console.error("Erreur lors du chargement des offres :", e);
            return [];
        }
    },

    async addOffer(offer) {
        try {
            const id = await getUserId();
            const res = await fetch(`http://localhost:3000/offers/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offer)
            });
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const offers = await res.json();
            return offers;
        } catch (e) {
            console.error("Erreur lors de l'ajout :", e);
            return [];
        }
    },

    async updateOffer(offerId, updates) {
        try {
            const id = await getUserId();
            const res = await fetch(`http://localhost:3000/offers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: offerId, updates })
            });
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const offers = await res.json();
            return offers;
        } catch (e) {
            console.error("Erreur lors de la mise à jour :", e);
            return [];
        }
    },

    async deleteOffer(offerId) {
        try {
            const id = await getUserId();
            const res = await fetch(`http://localhost:3000/offers/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: offerId })
            });
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const offers = await res.json();
            return offers;
        } catch (e) {
            console.error("Erreur lors de la suppression :", e);
            return [];
        }
    },

    loadNotifiedIds() {
        const stored = localStorage.getItem('jobtracker_notified');
        return new Set(stored ? JSON.parse(stored) : []);
    },

    saveNotifiedIds(set) {
        localStorage.setItem('jobtracker_notified', JSON.stringify([...set]));
    }
};
