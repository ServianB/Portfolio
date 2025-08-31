// Portfolio JavaScript avec Navigation Horizontale - Alpine.js
function horizontalPortfolio() {
    return {
        currentLang: localStorage.getItem('preferred-language') || 'fr',
        mobileMenuOpen: false,
        projects: [],
        currentSection: 0,
        totalSections: 5,
        isScrolling: false,
        scrollTimeout: null,

        // Initialisation
        init() {
            this.loadProjects();
            this.setupHorizontalScroll();
            this.setupKeyboardNavigation();
            this.setupTouchNavigation();
            this.setupResponsiveNavigation();
        },

        // Configuration du scroll horizontal avec la molette
        setupHorizontalScroll() {
            let isScrolling = false;
            
            // Écouter les événements de scroll de la molette
            window.addEventListener('wheel', (e) => {
                if (isScrolling) return;
                
                e.preventDefault();
                
                // Déterminer la direction du scroll
                const delta = e.deltaY || e.deltaX;
                
                if (delta > 0 && this.currentSection < this.totalSections - 1) {
                    // Scroll vers la droite (section suivante)
                    this.goToSection(this.currentSection + 1);
                } else if (delta < 0 && this.currentSection > 0) {
                    // Scroll vers la gauche (section précédente)
                    this.goToSection(this.currentSection - 1);
                }
                
                // Empêcher les scrolls trop rapides
                isScrolling = true;
                setTimeout(() => {
                    isScrolling = false;
                }, 800);
            }, { passive: false });
            
            // Empêcher le scroll vertical par défaut
            document.body.style.overflow = 'hidden';
        },

        // Navigation par clavier
        setupKeyboardNavigation() {
            window.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowRight':
                    case ' ': // Espace
                        e.preventDefault();
                        if (this.currentSection < this.totalSections - 1) {
                            this.goToSection(this.currentSection + 1);
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        if (this.currentSection > 0) {
                            this.goToSection(this.currentSection - 1);
                        }
                        break;
                    case 'Home':
                        e.preventDefault();
                        this.goToSection(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        this.goToSection(this.totalSections - 1);
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                        e.preventDefault();
                        const sectionIndex = parseInt(e.key) - 1;
                        if (sectionIndex >= 0 && sectionIndex < this.totalSections) {
                            this.goToSection(sectionIndex);
                        }
                        break;
                }
            });
        },

        // Navigation tactile pour mobile
        setupTouchNavigation() {
            let startX = 0;
            let startY = 0;
            let isTouch = false;

            window.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isTouch = true;
            });

            window.addEventListener('touchmove', (e) => {
                if (!isTouch) return;
                e.preventDefault();
            }, { passive: false });

            window.addEventListener('touchend', (e) => {
                if (!isTouch) return;
                
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;

                // Vérifier si c'est un swipe horizontal
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0 && this.currentSection < this.totalSections - 1) {
                        // Swipe vers la gauche = section suivante
                        this.goToSection(this.currentSection + 1);
                    } else if (diffX < 0 && this.currentSection > 0) {
                        // Swipe vers la droite = section précédente
                        this.goToSection(this.currentSection - 1);
                    }
                }
                
                isTouch = false;
            });
        },

        // Navigation responsive (mobile vertical)
        setupResponsiveNavigation() {
            const checkMobile = () => {
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                    // Sur mobile, permettre le scroll vertical normal
                    document.body.style.overflow = 'auto';
                    const container = document.querySelector('.horizontal-container');
                    if (container) {
                        container.style.flexDirection = 'column';
                        container.style.width = '100vw';
                        container.style.height = 'auto';
                        container.style.transform = 'none';
                    }
                } else {
                    // Sur desktop, garder le comportement horizontal
                    document.body.style.overflow = 'hidden';
                    const container = document.querySelector('.horizontal-container');
                    if (container) {
                        container.style.flexDirection = 'row';
                        container.style.width = '500vw';
                        container.style.height = '100vh';
                    }
                }
            };

            checkMobile();
            window.addEventListener('resize', checkMobile);
        },

        // Aller à une section spécifique
        goToSection(sectionIndex) {
            if (sectionIndex >= 0 && sectionIndex < this.totalSections && sectionIndex !== this.currentSection) {
                this.currentSection = sectionIndex;
                this.animateToSection();
                this.triggerSectionAnimations();
                this.updateURL(sectionIndex);
            }
        },

        // Animation vers la section
        animateToSection() {
            const container = document.querySelector('.horizontal-container');
            if (container && window.innerWidth >= 768) {
                // Animation smooth uniquement sur desktop
                container.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                // La transformation est gérée par Alpine.js via le binding :style
            }

            // Mise à jour via Alpine.js réactive
            this.$nextTick(() => {
                // Déclencher les animations d'entrée des éléments
                this.triggerSectionAnimations();
            });
        },

        // Déclencher les animations spécifiques à chaque section
        triggerSectionAnimations() {
            // Réinitialiser toutes les animations
            const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-in-left, .animate-slide-in-right');
            animatedElements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
            });

            // Délai pour permettre à la section d'être visible
            setTimeout(() => {
                const currentSectionElements = document.querySelectorAll(`.section:nth-child(${this.currentSection + 1}) .animate-fade-in, .section:nth-child(${this.currentSection + 1}) .animate-slide-in-left, .section:nth-child(${this.currentSection + 1}) .animate-slide-in-right`);
                
                currentSectionElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                        el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    }, index * 100);
                });
            }, 100);
        },

        // Mettre à jour l'URL (optionnel, pour le partage)
        updateURL(sectionIndex) {
            const sectionNames = ['intro', 'home', 'about', 'projects', 'contact'];
            const newURL = `${window.location.pathname}#${sectionNames[sectionIndex]}`;
            history.replaceState(null, null, newURL);
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
                if (!response.ok) {
                    throw new Error('API non disponible');
                }
                const data = await response.json();
                console.log('Projets featured reçus:', data.projects);
                this.projects = data.projects.slice(0, 6); // Limiter à 6 projets featured maximum
                this.renderProjects();
            } catch (error) {
                console.error('Erreur lors du chargement des projets:', error);
                this.renderFallbackProjects();
            }
        },

        // Rendu des projets avec animations
        renderProjects() {
            const container = document.getElementById('projects-container');
            if (!container) {
                console.error('Container projects-container non trouvé');
                return;
            }

            if (this.projects.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-folder-open text-6xl text-primary-300 mb-4"></i>
                        <p class="text-lg text-primary-600">
                            ${this.currentLang === 'fr' ? 'Aucun projet en avant trouvé' : 'No featured projects found'}
                        </p>
                        <p class="text-sm text-primary-500 mt-2">
                            ${this.currentLang === 'fr' ? 'Ajoutez des projets via l\'interface admin' : 'Add projects via the admin interface'}
                        </p>
                    </div>
                `;
                return;
            }

            container.innerHTML = this.projects.map((project, index) => {
                // Gestion de la langue pour le titre et la description
                const title = this.currentLang === 'fr' ? 
                    (project.title_fr || project.title || 'Projet sans titre') : 
                    (project.title_en || project.title || 'Untitled Project');
                
                const description = this.currentLang === 'fr' ? 
                    (project.description_fr || project.description || 'Description du projet...') : 
                    (project.description_en || project.description || 'Project description...');

                return `
                    <div class="project-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                         style="animation-delay: ${index * 0.1}s">
                        <div class="relative overflow-hidden">
                            ${project.image_url ? `
                                <img src="${project.image_url}" 
                                     alt="${title}" 
                                     class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                            ` : `
                                <div class="w-full h-48 bg-gradient-accent flex items-center justify-center">
                                    <i class="fas fa-code text-4xl text-white"></i>
                                </div>
                            `}
                            <div class="absolute top-4 right-4">
                                <span class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary-700">
                                    ${project.category || (this.currentLang === 'fr' ? 'Projet' : 'Project')}
                                </span>
                            </div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-primary-900 mb-3 group-hover:text-accent-600 transition-colors">
                                ${title}
                            </h3>
                            <p class="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                ${description}
                            </p>
                            <div class="flex items-center justify-between">
                                <div class="flex space-x-3">
                                    ${project.live_url ? `
                                        <a href="${project.live_url}" 
                                           target="_blank" 
                                           class="flex items-center text-accent-600 hover:text-accent-700 transition-colors text-sm font-medium">
                                            <i class="fas fa-external-link-alt mr-1"></i>
                                            ${this.currentLang === 'fr' ? 'Démo' : 'Demo'}
                                        </a>
                                    ` : ''}
                                    ${project.github_url ? `
                                        <a href="${project.github_url}" 
                                           target="_blank" 
                                           class="flex items-center text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium">
                                            <i class="fab fa-github mr-1"></i>
                                            Code
                                        </a>
                                    ` : ''}
                                </div>
                                <a href="/project.html?id=${project.id}"
                                   class="text-primary-500 hover:text-accent-600 transition-colors">
                                    <i class="fas fa-arrow-right text-lg"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },

        // Projets de démonstration si l'API ne répond pas
        renderFallbackProjects() {
            const container = document.getElementById('projects-container');
            if (!container) return;

            const fallbackProjects = [
                {
                    title: this.currentLang === 'fr' ? 'Portfolio Interactif' : 'Interactive Portfolio',
                    description: this.currentLang === 'fr' ? 'Site portfolio moderne avec navigation horizontale et animations fluides' : 'Modern portfolio site with horizontal navigation and smooth animations',
                    category: 'Web'
                },
                {
                    title: this.currentLang === 'fr' ? 'Application IA' : 'AI Application',
                    description: this.currentLang === 'fr' ? 'Solution d\'intelligence artificielle pour l\'analyse de données' : 'Artificial intelligence solution for data analysis',
                    category: 'AI/ML'
                },
                {
                    title: this.currentLang === 'fr' ? 'Plateforme E-commerce' : 'E-commerce Platform',
                    description: this.currentLang === 'fr' ? 'Plateforme de vente en ligne avec gestion complète' : 'Online sales platform with complete management',
                    category: 'Full Stack'
                }
            ];

            container.innerHTML = fallbackProjects.map((project, index) => `
                <div class="project-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                     style="animation-delay: ${index * 0.1}s">
                    <div class="w-full h-48 bg-gradient-accent flex items-center justify-center">
                        <i class="fas fa-code text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-primary-900 mb-3 group-hover:text-accent-600 transition-colors">
                            ${project.title}
                        </h3>
                        <p class="text-primary-600 text-sm leading-relaxed mb-4">
                            ${project.description}
                        </p>
                        <div class="flex items-center justify-between">
                            <span class="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-xs font-medium">
                                ${project.category}
                            </span>
                            <span class="text-primary-400 text-sm">
                                ${this.currentLang === 'fr' ? 'Bientôt' : 'Coming Soon'}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
        },

        // Mettre à jour la langue des projets
        updateProjectsLanguage() {
            this.renderProjects();
        },

        // Soumettre le formulaire de contact
        async submitContact() {
            // Simulation d'envoi
            alert(this.currentLang === 'fr' ? 
                'Message envoyé avec succès ! Je vous répondrai bientôt.' : 
                'Message sent successfully! I will reply to you soon.');
        }
    }
}

// Fonction pour afficher la modale d'un projet ou rediriger vers la page détail
function showProjectModal(projectId) {
    console.log('Affichage du projet:', projectId);
    // Rediriger vers la page de détail du projet
    window.location.href = `/project.html?id=${projectId}`;
}

// Gestion de l'URL au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio horizontal initialisé');
    
    // Détecter la section depuis l'URL
    const hash = window.location.hash.substring(1);
    const sectionMap = {
        'intro': 0,
        'home': 1,
        'about': 2,
        'projects': 3,
        'contact': 4
    };
    
    if (hash && sectionMap.hasOwnProperty(hash)) {
        // Attendre que Alpine.js soit initialisé
        setTimeout(() => {
            // Chercher l'instance Alpine.js dans le DOM
            const portfolioElement = document.querySelector('[x-data*="horizontalPortfolio"]');
            if (portfolioElement && portfolioElement._x_dataStack) {
                const portfolioInstance = portfolioElement._x_dataStack[0];
                if (portfolioInstance && portfolioInstance.goToSection) {
                    portfolioInstance.goToSection(sectionMap[hash]);
                }
            }
        }, 500);
    }
});

// Exposition globale pour le debugging
window.showProjectModal = showProjectModal;
