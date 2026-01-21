import { DataManager } from './data.js';

class JobTrackerApp {
    constructor() {
        this.offers = [];
        this.currentFilter = 'all';
        this.notifiedIds = new Set(); // notifications pour cette session

        // DOM Elements
        this.listContainer = document.getElementById('offers-list');
        this.form = document.getElementById('job-form');
        this.toggleBtn = document.getElementById('toggle-form-btn');
        this.cancelBtn = document.getElementById('cancel-form');
        this.emptyState = document.getElementById('empty-state');

        this.init();
    }

    async init() {
        await this.loadOffers();
        this.bindEvents();
        this.render();

        // Surveillance des deadlines toutes les 30s
        setInterval(() => this.checkDeadlines(), 30000);
        this.checkDeadlines(); // premier check
    }

    async loadOffers() {
        try {
            this.offers = await DataManager.loadOffers();
        } catch (err) {
            console.error("Erreur lors du chargement des offres :", err);
            this.offers = [];
        }
    }

    bindEvents() {
        // Toggle Form
        this.toggleBtn.addEventListener('click', () => {
            this.form.classList.toggle('hidden');
            this.toggleBtn.classList.toggle('hidden');
        });

        this.cancelBtn.addEventListener('click', () => {
            this.form.classList.add('hidden');
            this.toggleBtn.classList.remove('hidden');
            this.form.reset();
        });

        // Submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                await this.loadOffers(); // reload depuis le serveur
                this.render();
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const newOffer = {
            titre: document.getElementById('job-title').value,
            entreprise: document.getElementById('job-company').value,
            lien: document.getElementById('job-link').value,
            description: document.getElementById('job-desc').value,
            date_limite: document.getElementById('job-deadline').value
        };

        try {
            this.offers = await DataManager.addOffer(newOffer);
            this.playSound('snd-success');
            this.form.reset();
            this.form.classList.add('hidden');
            this.toggleBtn.classList.remove('hidden');
            this.render();
        } catch (err) {
            console.error("Erreur lors de l'ajout :", err);
        }
    }

    checkDeadlines() {
        const today = new Date();
        let urgentCount = 0;
        let newUrgents = false;

        this.offers.forEach(offer => {
            if (offer.statut === 'postulé') return;

            const deadline = new Date(offer.date_limite);
            const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= 2) {
                urgentCount++;
                if (!this.notifiedIds.has(offer.id)) {
                    this.notifiedIds.add(offer.id);
                    newUrgents = true;
                }
            }
        });

        if (newUrgents) {
            this.showToast(`Vous avez ${urgentCount} offre(s) urgente(s) ! ⚠️`);
            this.playSound('snd-alert');
        }
    }

    isUrgent(dateStr) {
        const deadline = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2;
    }

    render() {
        let filtered = [...this.offers];

        // Supprimer les offres expirées
        filtered = filtered.filter(o => new Date(o.date_limite) >= new Date());

        // Sort: Urgent first, puis date ajout
        filtered.sort((a, b) => {
            const urgentA = this.isUrgent(a.date_limite) && a.statut !== 'postulé';
            const urgentB = this.isUrgent(b.date_limite) && b.statut !== 'postulé';
            if (urgentA && !urgentB) return -1;
            if (!urgentA && urgentB) return 1;
            return new Date(b.date_ajout) - new Date(a.date_ajout);
        });

        // Filtrage
        if (this.currentFilter === 'urgent') {
            filtered = filtered.filter(o => this.isUrgent(o.date_limite) && o.statut !== 'postulé');
        } else if (this.currentFilter === 'postulated') {
            filtered = filtered.filter(o => o.statut === 'postulé');
        }

        this.updateStats();

        if (filtered.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.listContainer.innerHTML = '';
        } else {
            this.emptyState.classList.add('hidden');
            this.listContainer.innerHTML = filtered.map(o => this.createOfferCard(o)).join('');
            this.attachCardEvents();
        }
    }

    createOfferCard(offer) {
        const urgent = this.isUrgent(offer.date_limite) && offer.statut !== 'postulé';
        const statusClass = offer.statut === 'postulé' ? 'status-applied' : 'status-pending';
        const urgentClass = urgent ? 'urgent-card' : '';

        return `
            <article class="offer-card ${urgentClass}" data-id="${offer.id}" title="Cliquez pour ouvrir l'offre">
                <div class="offer-header">
                    <div>
                        <div class="offer-title">${offer.titre} ${urgent ? '⚠️' : ''}</div>
                        <div class="offer-company">${offer.entreprise}</div>
                    </div>
                    <span class="offer-status-badge ${statusClass}">${offer.statut}</span>
                </div>
                <p class="offer-company" style="color: var(--text-beige); opacity: 0.8">${offer.description || 'Pas de description.'}</p>
                <div class="offer-footer">
                    <span class="offer-deadline">Limite : ${offer.date_limite}</span>
                    <div class="action-btns">
                        <a href="${offer.lien}" target="_blank" class="btn-icon" title="Voir l'offre">🔗</a>
                        <button class="btn-icon toggle-status" title="Changer statut">
                            ${offer.statut === 'postulé' ? '⏳' : '✅'}
                        </button>
                        <button class="btn-icon delete-btn" title="Supprimer">🗑️</button>
                    </div>
                </div>
            </article>
        `;
    }

    attachCardEvents() {
        // Toggle statut
        this.listContainer.querySelectorAll('.toggle-status').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = e.target.closest('.offer-card').dataset.id;
                const offer = this.offers.find(o => o.id === id);
                const nextStatus = offer.statut === 'postulé' ? 'non postulé' : 'postulé';
                this.offers = await DataManager.updateOffer(id, { statut: nextStatus });
                this.render();
            });
        });

        // Supprimer
        this.listContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Supprimer cette offre ?')) {
                    const id = e.target.closest('.offer-card').dataset.id;
                    this.offers = await DataManager.deleteOffer(id);
                    this.render();
                }
            });
        });

        // Cliquer sur la carte ouvre le lien
        this.listContainer.querySelectorAll('.offer-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                const offer = this.offers.find(o => o.id === id);
                if (offer && offer.lien) window.open(offer.lien, '_blank');
            });
        });
    }

    updateStats() {
        const total = this.offers.length;
        const postulated = this.offers.filter(o => o.statut === 'postulé').length;
        const pending = total - postulated;
        const urgent = this.offers.filter(o => this.isUrgent(o.date_limite) && o.statut !== 'postulé').length;

        document.querySelector('#stat-total .stat-value').textContent = total;
        document.querySelector('#stat-postulated .stat-value').textContent = postulated;
        document.querySelector('#stat-pending .stat-value').textContent = pending;
        document.querySelector('#stat-urgent .stat-value').textContent = urgent;
    }

    playSound(id) {
        const audio = document.getElementById(id);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio bloqué par le navigateur", e));
        }
    }

    showToast(msg) {
        const toast = document.getElementById('notification-toast');
        toast.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 5000);
    }
}

// Lancement
new JobTrackerApp();
