// app.js
import { DataManager } from './data.js';

class JobTrackerApp {
    constructor() {
        this.offers = [];
        this.currentFilter = 'all';
        this.notifiedIds = new Set();

        // DOM Elements
        this.listContainer = document.getElementById('offers-list');
        this.form = document.getElementById('job-form');
        this.toggleBtn = document.getElementById('toggle-form-btn');
        this.cancelBtn = document.getElementById('cancel-form');
        this.emptyState = document.getElementById('empty-state');

        this.init();
    }

    async init() {
        const token = localStorage.getItem('token');
        if (!token) return;

        await this.loadOffers();
        this.bindEvents();
        this.render();

        setInterval(() => this.checkDeadlines(), 30000);
        this.checkDeadlines();
    }

    async loadOffers() {
        try {
            this.offers = await DataManager.loadOffers();
            console.log("OFFRES CHARGEES :", this.offers);
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
                document.querySelector('.filter-btn.active')?.classList.remove('active');
                e.currentTarget.classList.add('active');
                this.currentFilter = e.currentTarget.dataset.filter;
                await this.loadOffers();
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

        if (newUrgents) this.showToast(`Vous avez ${urgentCount} offre(s) urgente(s) ! ⚠️`);
    }

    isUrgent(dateStr) {
        const deadline = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        deadline.setHours(0,0,0,0);
        const diffDays = Math.ceil((deadline - today) / (1000*60*60*24));
        return diffDays >= 0 && diffDays <= 2;
    }

    isExpired(dateStr) {
        const deadline = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        deadline.setHours(0,0,0,0);
        return deadline < today;
    }

    render() {
        let filtered = [...this.offers];

        // Tri urgent > expiré > autres
        filtered.sort((a,b)=>{
            const urgentA = this.isUrgent(a.date_limite) && a.statut!=='postulé';
            const urgentB = this.isUrgent(b.date_limite) && b.statut!=='postulé';
            if(urgentA && !urgentB) return -1;
            if(!urgentA && urgentB) return 1;

            const expiredA = this.isExpired(a.date_limite);
            const expiredB = this.isExpired(b.date_limite);
            if(!expiredA && expiredB) return -1;
            if(expiredA && !expiredB) return 1;

            return new Date(b.date_ajout || 0) - new Date(a.date_ajout || 0);
        });

        // Filtres
        if(this.currentFilter==='urgent'){
            filtered = filtered.filter(o=>this.isUrgent(o.date_limite) && o.statut!=='postulé');
        } else if(this.currentFilter==='postulated'){
            filtered = filtered.filter(o=>o.statut==='postulé');
        } else if(this.currentFilter==='expired'){
            filtered = filtered.filter(o=>this.isExpired(o.date_limite));
        }

        this.updateStats();

        if(filtered.length===0){
            this.emptyState.classList.remove('hidden');
            this.listContainer.innerHTML='';
        } else {
            this.emptyState.classList.add('hidden');
            this.listContainer.innerHTML = filtered.map(o=>this.createOfferCard(o)).join('');
            this.attachCardEvents();
        }
    }

    createOfferCard(offer){
        const urgent = this.isUrgent(offer.date_limite) && offer.statut!=='postulé';
        const expired = this.isExpired(offer.date_limite);
        const statusClass = offer.statut==='postulé' ? 'status-applied':'status-pending';
        const expiredClass = expired ? 'expired-card':'';
        const urgentClass = urgent ? 'urgent-card':'';

        return `
            <article class="offer-card ${urgentClass} ${expiredClass}" data-id="${offer.id}">
                <div class="offer-header">
                    <div>
                        <div class="offer-title">${offer.titre} ${urgent?'⚠️':''}</div>
                        <div class="offer-company">${offer.entreprise}</div>
                    </div>
                    <span class="offer-status-badge ${statusClass}">${offer.statut}</span>
                </div>
                <p class="offer-company" style="opacity: 0.8">
                    ${offer.description||'Pas de description.'}
                </p>
                <div class="offer-footer">
                    <span class="offer-deadline">Limite : ${offer.date_limite}</span>
                    <div class="action-btns">
                        <a href="${offer.lien}" target="_blank" class="btn-icon">
                            <i class="fas fa-link"></i>
                        </a>
                        <button class="btn-icon toggle-status">
                            <i class="${offer.statut==='postulé'?'fas fa-hourglass-half':'fas fa-check'}"></i>
                        </button>
                        <button class="btn-icon delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    attachCardEvents(){
        this.listContainer.querySelectorAll('.toggle-status').forEach(btn=>{
            btn.addEventListener('click', async (e)=>{
                const card = e.target.closest('.offer-card');
                const id = card.dataset.id;
                const offer = this.offers.find(o=>o.id===id);
                const nextStatus = offer.statut==='postulé'?'non postulé':'postulé';
                this.offers = await DataManager.updateOffer(id,{statut:nextStatus});
                this.render();
            });
        });

        this.listContainer.querySelectorAll('.delete-btn').forEach(btn=>{
            btn.addEventListener('click', async (e)=>{
                const id = e.target.closest('.offer-card').dataset.id;
                if(!confirm('Supprimer cette offre ?')) return;
                this.offers = await DataManager.deleteOffer(id);
                this.render();
            });
        });
    }

    updateStats(){
        document.querySelector('#stat-total .stat-value').textContent = this.offers.length;
        document.querySelector('#stat-postulated .stat-value').textContent = this.offers.filter(o=>o.statut==='postulé').length;
        document.querySelector('#stat-pending .stat-value').textContent = this.offers.filter(o=>o.statut!=='postulé').length;
        document.querySelector('#stat-urgent .stat-value').textContent = this.offers.filter(o=>this.isUrgent(o.date_limite)&&o.statut!=='postulé').length;
        // Expirées
        const expiredCount = this.offers.filter(o=>this.isExpired(o.date_limite)).length;
        if(document.querySelector('#stat-expired')) document.querySelector('#stat-expired .stat-value').textContent = expiredCount;
    }

    showToast(msg){
        const toast = document.getElementById('notification-toast');
        toast.textContent = msg;
        toast.classList.remove('hidden');
        setTimeout(()=>toast.classList.add('hidden'),4000);
    }
}

// Boot
if(localStorage.getItem('token')){
    document.getElementById('auth-screen').classList.add('hidden');
    document.querySelector('.auth-wrapper').classList.add('hidden');
    document.querySelector('.app-container').classList.remove('hidden');
    new JobTrackerApp();
}
