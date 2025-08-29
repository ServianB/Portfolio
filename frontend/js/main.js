// Portfolio JavaScript avec Alpine.js
function portfolio() {
    return {
        currentLang: localStorage.getItem('preferred-language') || 'fr',
        scrolled: false,
        mobileMenuOpen: false,
        projects: [],

        // Initialisation
        init() {
            this.loadProjects();
            this.setupScrollAnimations();
            
            // Gestion du scroll pour la navigation
            window.addEventListener('scroll', () => {
                this.scrolled = window.scrollY > 50;
            });
        },

        // Basculer la langue
        toggleLanguage() {
            this.currentLang = this.currentLang === 'fr' ? 'en' : 'fr';
            localStorage.setItem('preferred-language', this.currentLang);
            this.updateProjectsLanguage();
        },

        // Charger les projets depuis l'API
        async loadProjects() {
            try {
                console.log('Chargement des projets featured...');
                // Charger seulement les projets featured pour la page d'accueil
                const response = await fetch('/api/projects?featured=true');
                const data = await response.json();
                console.log('Projets featured reçus:', data.projects);
                this.projects = data.projects.slice(0, 6); // Limiter à 6 projets featured maximum
                this.renderProjects();
            } catch (error) {
                console.error('Erreur lors du chargement des projets:', error);
                this.renderFallbackProjects();
            }
        },

        // Rendu des projets
        renderProjects() {
            const container = document.getElementById('projects-container');
            if (!container) {
                console.error('Container projects-container non trouvé');
                return;
            }

            console.log('Rendu de', this.projects.length, 'projets');
            container.innerHTML = this.projects.map(project => this.createProjectCard(project)).join('');
            this.setupProjectAnimations();
        },

        // Créer une carte de projet
        createProjectCard(project) {
            const title = this.currentLang === 'fr' ? project.title_fr : project.title_en;
            const description = this.currentLang === 'fr' ? project.description_fr : project.description_en;
            const technologies = project.technologies ? project.technologies.split(',') : [];

            return `
                <div class="project-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div class="relative">
                        ${project.image_url ? 
                            `<img src="${project.image_url}" alt="${title}" class="w-full h-48 object-cover">` :
                            `<div class="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                <i class="fas fa-code text-4xl text-white"></i>
                            </div>`
                        }
                        <div class="absolute top-4 right-4">
                            <span class="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                ${project.category || 'Web'}
                            </span>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-secondary-800 mb-3">${title}</h3>
                        <p class="text-secondary-600 mb-4 line-clamp-3">${description}</p>
                        
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${technologies.map(tech => 
                                `<span class="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-md text-sm">${tech.trim()}</span>`
                            ).join('')}
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <a href="/project/${project.id}" class="text-primary-600 hover:text-primary-700 font-medium">
                                ${this.currentLang === 'fr' ? 'Voir le projet' : 'View project'} →
                            </a>
                            <div class="space-x-2">
                                ${project.github_url ? 
                                    `<a href="${project.github_url}" target="_blank" class="text-secondary-400 hover:text-secondary-600">
                                        <i class="fab fa-github text-lg"></i>
                                    </a>` : ''
                                }
                                ${project.live_url ? 
                                    `<a href="${project.live_url}" target="_blank" class="text-secondary-400 hover:text-secondary-600">
                                        <i class="fas fa-external-link-alt text-lg"></i>
                                    </a>` : ''
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        // Projets de fallback si l'API n'est pas disponible
        renderFallbackProjects() {
            const fallbackProjects = [
                {
                    id: 1,
                    title_fr: "Application E-commerce",
                    title_en: "E-commerce Application",
                    description_fr: "Application web complète avec gestion des produits, panier et paiement en ligne.",
                    description_en: "Complete web application with product management, cart and online payment.",
                    technologies: "React, Node.js, MongoDB",
                    category: "Web",
                    github_url: "https://github.com",
                    live_url: "https://demo.com"
                },
                {
                    id: 2,
                    title_fr: "Dashboard Analytics",
                    title_en: "Analytics Dashboard",
                    description_fr: "Interface de visualisation de données avec graphiques interactifs et temps réel.",
                    description_en: "Data visualization interface with interactive and real-time charts.",
                    technologies: "Vue.js, Chart.js, Express",
                    category: "Dashboard",
                    github_url: "https://github.com"
                },
                {
                    id: 3,
                    title_fr: "Application Mobile",
                    title_en: "Mobile Application",
                    description_fr: "Application mobile cross-platform pour la gestion de tâches personnelles.",
                    description_en: "Cross-platform mobile application for personal task management.",
                    technologies: "React Native, Firebase",
                    category: "Mobile",
                    github_url: "https://github.com"
                }
            ];

            this.projects = fallbackProjects;
            this.renderProjects();
        },

        // Mettre à jour la langue des projets
        updateProjectsLanguage() {
            this.renderProjects();
        },

        // Configuration des animations de scroll
        setupScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-slide-up');
                    }
                });
            }, observerOptions);

            // Observer les sections
            document.querySelectorAll('section').forEach(section => {
                observer.observe(section);
            });
        },

        // Configuration des animations pour les projets
        setupProjectAnimations() {
            const projectCards = document.querySelectorAll('.project-card');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 100);
                    }
                });
            }, {
                threshold: 0.1
            });

            projectCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s ease';
                observer.observe(card);
            });
        },

        // Soumission du formulaire de contact
        async submitContact() {
            // Ici vous pourriez ajouter l'envoi vers un service de mail
            alert(this.currentLang === 'fr' ? 
                'Message envoyé ! Je vous répondrai bientôt.' : 
                'Message sent! I will reply to you soon.'
            );
        }
    }
}

// Smooth scroll pour les liens d'ancrage
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer la langue préférée - attendons qu'Alpine soit initialisé
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) {
        // Attendre qu'Alpine soit prêt
        setTimeout(() => {
            const alpineEl = document.querySelector('[x-data]');
            if (alpineEl && alpineEl._x_dataStack) {
                alpineEl._x_dataStack[0].currentLang = savedLang;
            }
        }, 100);
    }

    // Gestion du smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Offset pour la navbar fixe
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Effet de parallaxe subtil pour le hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('#accueil');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
});

// Utility pour truncate le texte
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>
`);
