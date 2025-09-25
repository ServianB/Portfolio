// Main JavaScript for Vertical Portfolio
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio vertical initialisé');
    
    // Mobile menu management
    const mobileMenu = document.getElementById('mobile-menu');
    
    window.toggleMobileMenu = () => mobileMenu.classList.toggle('hidden');
    window.closeMobileMenu = () => mobileMenu.classList.add('hidden');
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navigation dot management
    const sections = document.querySelectorAll('section[id]');
    const navDots = document.querySelectorAll('.nav-dot');
    const sectionIds = ['intro', 'home', 'about', 'projects', 'contact'];
    
    function updateActiveDot() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', sectionIds[index] === current);
        });
    }

    // Update active dot on scroll
    window.addEventListener('scroll', updateActiveDot);
    updateActiveDot(); // Initial call

    // Progress bar functionality
    const progressBar = document.getElementById('progress-bar');
    
    function updateProgressBar() {
        if (!progressBar) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        progressBar.style.width = `${scrollPercent}%`;
    }
    
    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar(); // Initial call

    // Load projects dynamically
    async function loadProjects() {
        try {
            const response = await fetch('/api/projects?featured=true');
            if (response.ok) {
                const data = await response.json();
                displayProjects(data.projects || []);
                return;
            }
        } catch (error) {
            console.log('API non disponible:', error);
        }
        displaySampleProjects();
    }

    function displayProjects(projects) {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const createProjectCard = (project) => {
            const imageSection = project.image_url 
                ? `<div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                     <img src="${project.image_url}" alt="${project.title_fr}" class="w-full h-full object-cover">
                   </div>`
                : `<div class="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                     <i class="fas fa-code text-white text-4xl"></i>
                   </div>`;

            const technologies = project.technologies 
                ? project.technologies.split(',').map(tech => 
                    `<span class="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">${tech.trim()}</span>`
                  ).join('')
                : '';

            const links = [
                project.github_url ? `<a href="${project.github_url}" target="_blank" class="flex items-center text-primary-600 hover:text-accent-500 transition-colors">
                                        <i class="fab fa-github mr-1"></i>Code</a>` : '',
                project.live_url ? `<a href="${project.live_url}" target="_blank" class="flex items-center text-primary-600 hover:text-accent-500 transition-colors">
                                      <i class="fas fa-external-link-alt mr-1"></i>Demo</a>` : ''
            ].filter(link => link).join('');

            return `
                <div class="project-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    ${imageSection}
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-primary-900 mb-4">${project.title_fr}</h3>
                        <div class="flex flex-wrap gap-2 mb-4">${technologies}</div>
                        <div class="flex space-x-3">${links}</div>
                    </div>
                </div>
            `;
        };

        container.innerHTML = projects.map(createProjectCard).join('');
    }

    function displaySampleProjects() {
        const sampleProjects = [
            {
                title_fr: "Portfolio Interactif",
                description_fr: "Site portfolio responsive avec animations et design moderne",
                technologies: "HTML, CSS, JavaScript, Tailwind",
                github_url: "#",
                live_url: "#",
                image_url: null
            },
            {
                title_fr: "Application E-commerce", 
                description_fr: "Plateforme de vente en ligne avec panier et gestion des commandes",
                technologies: "React, Node.js, MongoDB",
                github_url: "#",
                live_url: "#",
                image_url: null
            },
            {
                title_fr: "Dashboard Analytics",
                description_fr: "Interface d'administration avec graphiques et métriques en temps réel",
                technologies: "Vue.js, Chart.js, API REST",
                github_url: "#",
                live_url: "#",
                image_url: null
            }
        ];
        displayProjects(sampleProjects);
    }

    // Initialize everything
    loadProjects();
});
