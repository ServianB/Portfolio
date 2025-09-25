// Admin Panel JavaScript
function adminPanel() {
    return {
        authenticated: false,
        activeTab: 'projects',
        
        // Login data
        credentials: {
            username: '',
            password: ''
        },
        loginError: '',
        
        // Projects data
        projects: [],
        editingProject: null,
        
        // Project form
        projectForm: {
            id: null,
            title_fr: '',
            title_en: '',
            description_fr: '',
            description_en: '',
            technologies: '',
            github_url: '',
            live_url: '',
            image_url: '',
            category: '',
            featured: false
        },
        
        // Change password form
        passwordForm: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        passwordError: '',
        
        // Messages
        message: '',
        messageType: 'success',
        
        // Image handling
        imageMode: 'upload', // 'upload' ou 'url'
        selectedFile: null,

        // Initialization
        init() {
            // Check if already authenticated (simple session check)
            const authToken = sessionStorage.getItem('admin_auth');
            if (authToken) {
                this.authenticated = true;
                this.loadProjects();
            }
        },

        // Authentication
        async login() {
            try {
                // Validation côté client
                if (!this.credentials.username || !this.credentials.password) {
                    this.loginError = 'Veuillez remplir tous les champs';
                    return;
                }

                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.credentials)
                });

                const data = await response.json();

                if (response.ok) {
                    this.authenticated = true;
                    this.loginError = '';
                    
                    // Stocker le token de session si fourni
                    if (data.token) {
                        sessionStorage.setItem('admin_token', data.token);
                    }
                    sessionStorage.setItem('admin_auth', 'authenticated');
                    sessionStorage.setItem('admin_user', JSON.stringify(data.user));
                    
                    this.loadProjects();
                    this.showMessage('Connexion réussie !', 'success');
                } else {
                    // Gestion des différents types d'erreurs
                    if (response.status === 423) {
                        this.loginError = data.error; // Compte verrouillé
                    } else if (response.status === 429) {
                        this.loginError = data.error; // Rate limiting
                    } else if (response.status === 401) {
                        this.loginError = data.error || 'Identifiants invalides';
                        if (data.attemptsRemaining !== undefined) {
                            this.loginError += ` (${data.attemptsRemaining} tentatives restantes)`;
                        }
                    } else {
                        this.loginError = data.error || 'Erreur de connexion';
                    }
                }
            } catch (error) {
                console.error('Erreur de connexion:', error);
                this.loginError = 'Erreur de connexion au serveur';
            }
        },

        logout() {
            this.authenticated = false;
            sessionStorage.removeItem('admin_auth');
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_user');
            this.credentials = { username: '', password: '' };
            this.showMessage('Déconnexion réussie', 'success');
        },

        // Change password
        async changePassword() {
            try {
                // Validation côté client
                if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
                    this.passwordError = 'Veuillez remplir tous les champs';
                    return;
                }

                if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
                    this.passwordError = 'Les nouveaux mots de passe ne correspondent pas';
                    return;
                }

                if (this.passwordForm.newPassword.length < 8) {
                    this.passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
                    return;
                }

                const user = JSON.parse(sessionStorage.getItem('admin_user') || '{}');
                
                const response = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: user.username,
                        currentPassword: this.passwordForm.currentPassword,
                        newPassword: this.passwordForm.newPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    this.passwordError = '';
                    this.passwordForm = {
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    };
                    this.showMessage('Mot de passe changé avec succès !', 'success');
                } else {
                    this.passwordError = data.error || 'Erreur lors du changement de mot de passe';
                }
            } catch (error) {
                console.error('Erreur lors du changement de mot de passe:', error);
                this.passwordError = 'Erreur de connexion au serveur';
            }
        },

        // Projects management
        async loadProjects() {
            try {
                const response = await fetch('/api/projects');
                const data = await response.json();
                this.projects = data.projects || [];
            } catch (error) {
                console.error('Erreur lors du chargement des projets:', error);
                this.showMessage('Erreur lors du chargement des projets', 'error');
            }
        },

        async saveProject() {
            try {
                const url = this.editingProject ? 
                    `/api/projects/${this.editingProject.id}` : 
                    '/api/projects';
                
                const method = this.editingProject ? 'PUT' : 'POST';
                let requestData;
                let headers = {};

                if (this.imageMode === 'upload' && this.selectedFile) {
                    // Mode upload - utiliser FormData
                    requestData = new FormData();
                    
                    // Ajouter tous les champs du formulaire
                    Object.keys(this.projectForm).forEach(key => {
                        if (key !== 'id' && this.projectForm[key] !== null) {
                            if (key === 'featured') {
                                requestData.append(key, this.projectForm[key] ? '1' : '0');
                            } else {
                                requestData.append(key, this.projectForm[key] || '');
                            }
                        }
                    });
                    
                    // Ajouter le fichier
                    requestData.append('image', this.selectedFile);
                    
                } else {
                    // Mode URL ou pas d'image - utiliser JSON
                    const projectData = { ...this.projectForm };
                    projectData.featured = projectData.featured ? 1 : 0;
                    
                    if (!this.editingProject) {
                        delete projectData.id;
                    }
                    
                    requestData = JSON.stringify(projectData);
                    headers['Content-Type'] = 'application/json';
                }

                const response = await fetch(url, {
                    method: method,
                    headers: headers,
                    body: requestData
                });

                const data = await response.json();

                if (response.ok) {
                    this.showMessage(
                        this.editingProject ? 
                        'Projet mis à jour avec succès !' : 
                        'Projet créé avec succès !', 
                        'success'
                    );
                    this.resetForm();
                    this.loadProjects();
                    this.activeTab = 'projects';
                } else {
                    this.showMessage(data.error || 'Erreur lors de la sauvegarde', 'error');
                }
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                this.showMessage('Erreur lors de la sauvegarde du projet', 'error');
            }
        },

        editProject(project) {
            this.editingProject = project;
            this.projectForm = {
                id: project.id,
                title_fr: project.title_fr,
                title_en: project.title_en,
                description_fr: project.description_fr,
                description_en: project.description_en,
                technologies: project.technologies,
                github_url: project.github_url || '',
                live_url: project.live_url || '',
                image_url: project.image_url || '',
                category: project.category,
                featured: Boolean(project.featured)
            };
            
            // Déterminer le mode d'image basé sur l'URL existante
            if (project.image_url && project.image_url.startsWith('/uploads/')) {
                this.imageMode = 'upload'; // Fichier uploadé précédemment
            } else {
                this.imageMode = 'url'; // URL externe ou pas d'image
            }
            
            this.selectedFile = null;
            this.activeTab = 'add-project';
        },

        async deleteProject(projectId) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
                return;
            }

            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (response.ok) {
                    this.showMessage('Projet supprimé avec succès !', 'success');
                    this.loadProjects();
                } else {
                    this.showMessage(data.error || 'Erreur lors de la suppression', 'error');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                this.showMessage('Erreur lors de la suppression du projet', 'error');
            }
        },

        resetForm() {
            this.editingProject = null;
            this.projectForm = {
                id: null,
                title_fr: '',
                title_en: '',
                description_fr: '',
                description_en: '',
                technologies: '',
                github_url: '',
                live_url: '',
                image_url: '',
                category: '',
                featured: false
            };
            this.imageMode = 'upload';
            this.selectedFile = null;
            
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
        },

        // Image handling methods
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    this.showMessage('Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.', 'error');
                    event.target.value = '';
                    return;
                }

                // Validate file size (5MB max)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    this.showMessage('Le fichier est trop volumineux. Taille maximale : 5MB.', 'error');
                    event.target.value = '';
                    return;
                }

                this.selectedFile = file;
                // Clear URL when file is selected
                this.projectForm.image_url = '';
            }
        },

        clearSelectedFile() {
            this.selectedFile = null;
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = '';
            }
        },

        getImagePreviewUrl() {
            if (this.imageMode === 'upload' && this.selectedFile) {
                return URL.createObjectURL(this.selectedFile);
            } else if (this.imageMode === 'url' && this.projectForm.image_url) {
                return this.projectForm.image_url;
            }
            return null;
        },

        // Utility functions
        showMessage(text, type = 'success') {
            this.message = text;
            this.messageType = type;
            
            setTimeout(() => {
                this.message = '';
            }, 5000);
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .transition-all {
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
        }
        
        /* Custom scrollbar */
        .overflow-x-auto::-webkit-scrollbar {
            height: 6px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        
        /* Form styling improvements */
        input:focus, textarea:focus, select:focus {
            outline: none;
        }
        
        /* Loading state for buttons */
        .loading {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        /* Animation for table rows */
        tbody tr {
            transition: background-color 0.2s ease;
        }
        
        tbody tr:hover {
            background-color: #f8fafc;
        }
    `;
    document.head.appendChild(style);
    
    // Add form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('border-red-500');
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                // This would be handled by Alpine.js in the component
            }
        });
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { adminPanel };
}
