document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:8000/api"; // Adjust to match your backend URL
    // Check if user is authenticated
    checkAuth();
    
    // Initialize page-specific functionality
    initializePage();
    
    // Define API URL
    
    
    /**
     * Initialize page based on content
     */
    function initializePage() {
        // User profile page
        const profileForm = document.getElementById("profile-form");
        const profileContainer = document.getElementById("profile-container");
        
        if (profileForm && profileContainer) {
            loadUserProfile();
            loadUserStats();
        }
        
        // Users list page
        const usersContainer = document.getElementById("users-container");
        if (usersContainer && !profileForm) {
            loadUsers();
            setupUserSearch();
        }
    }
    
    /**
     * Set up event listeners for user search
     */
    function setupUserSearch() {
        const searchInput = document.getElementById("search-users");
        const searchBtn = document.getElementById("search-users-btn");
        
        if (searchBtn) {
            searchBtn.addEventListener("click", loadUsers);
        }
        
        if (searchInput) {
            searchInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    loadUsers();
                }
            });
        }
    }
    
    /**
     * Load current user's profile
     */
    async function loadUserProfile() {
        try {
            showLoading();
            const response = await fetchWithAuth(`${API_URL}/users/me/`);
            
            if (!response.ok) {
                throw new Error("Failed to load profile");
            }
            
            const userData = await response.json();
            displayUserProfile(userData);
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Display user profile and show edit form
     */
    function displayUserProfile(user) {
        const profileForm = document.getElementById("profile-form");
        if (!profileForm) return;
        
        // Fill form fields with user data
        document.getElementById("username").value = user.username || '';
        document.getElementById("email").value = user.email || '';
        
        if (document.getElementById("first_name")) {
            document.getElementById("first_name").value = user.first_name || '';
        }
        
        if (document.getElementById("last_name")) {
            document.getElementById("last_name").value = user.last_name || '';
        }
        
        // Show form and hide loading spinner
        document.getElementById("profile-container").innerHTML = '';
        profileForm.style.display = "block";
        
        // Add event listener for form submission
        profileForm.addEventListener("submit", updateUserProfile);
    }
    
    /**
     * Update user profile
     */
    async function updateUserProfile(e) {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById("email").value;
        const firstName = document.getElementById("first_name")?.value || '';
        const lastName = document.getElementById("last_name")?.value || '';
        const currentPassword = document.getElementById("current_password").value;
        const newPassword = document.getElementById("new_password").value;
        const confirmPassword = document.getElementById("confirm_password").value;
        
        // Validate form
        if (!email) {
            showAlert("error", "Email is required");
            return;
        }
        
        try {
            showLoading();
            
            // First, update user profile data
            const userData = {
                email: email,
                first_name: firstName,
                last_name: lastName
            };
            
            const profileResponse = await fetchWithAuth(`${API_URL}/users/me/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
            
            if (!profileResponse.ok) {
                const errorData = await profileResponse.json();
                console.error("Profile update error:", errorData);
                throw new Error(formatErrorMessage(errorData, "Failed to update profile"));
            }
            
            // If password fields are filled, make a separate request to change password
            if (newPassword && currentPassword) {
                // Validate matching passwords
                if (newPassword !== confirmPassword) {
                    showAlert("error", "New passwords do not match");
                    return;
                }
                
                const passwordData = {
                    old_password: currentPassword,
                    new_password: newPassword,
                    new_password2: newPassword
                };
                
                const passwordResponse = await fetchWithAuth(`${API_URL}/users/password/change/`, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(passwordData)
                });
                
                if (!passwordResponse.ok) {
                    const errorData = await passwordResponse.json().catch(e => "No JSON response");
                    console.error("Password change error:", errorData, "Status:", passwordResponse.status);
                    throw new Error(`Failed to update password: ${JSON.stringify(errorData)}`);
                }
            }
            
            // Clear password fields
            document.getElementById("current_password").value = '';
            document.getElementById("new_password").value = '';
            document.getElementById("confirm_password").value = '';
            
            showAlert("success", "Profile updated successfully");
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }
    
    // Helper function to format error messages
    function formatErrorMessage(errorData, defaultMessage) {
        if (errorData.detail) {
            return errorData.detail;
        } else if (typeof errorData === 'object') {
            return Object.entries(errorData)
                .map(([field, errors]) => {
                    if (Array.isArray(errors)) {
                        return `${field}: ${errors.join(", ")}`;
                    } else {
                        return `${field}: ${errors}`;
                    }
                })
                .join("; ");
        }
        return defaultMessage;
    }
    
    /**
     * Load user statistics
     */
    async function loadUserStats() {
        try {
            const response = await fetchWithAuth(`${API_URL}/users/stats/me/`);
            
            if (!response.ok) {
                throw new Error("Failed to load user statistics");
            }
            
            const stats = await response.json();
            displayUserStats(stats);
        } catch (error) {
            console.error("Error loading stats:", error);
            document.getElementById("user-stats").innerHTML = `
                <div class="alert alert-error">
                    Failed to load statistics
                </div>
            `;
        }
    }
    
    /**
     * Display user statistics
     */
    function displayUserStats(stats) {
        const statsContainer = document.getElementById("user-stats");
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-sticky-note stat-icon"></i>
                    <div class="stat-content">
                        <h3>${stats.total_notes || 0}</h3>
                        <p>Total Notes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-globe stat-icon"></i>
                    <div class="stat-content">
                        <h3>${stats.public_notes || 0}</h3>
                        <p>Public Notes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-lock stat-icon"></i>
                    <div class="stat-content">
                        <h3>${stats.private_notes || 0}</h3>
                        <p>Private Notes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar-alt stat-icon"></i>
                    <div class="stat-content">
                        <h3>${stats.days_registered || 0}</h3>
                        <p>Days Registered</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Load all users
     */
    async function loadUsers() {
        try {
            showLoading();
            const searchInput = document.getElementById("search-users");
            let url = `${API_URL}/users/`;
            
            // Add search parameter if available
            if (searchInput && searchInput.value) {
                url += `?search=${encodeURIComponent(searchInput.value)}`;
            }
            
            const response = await fetchWithAuth(url);
            
            if (!response.ok) {
                throw new Error("Failed to load users");
            }
            
            const users = await response.json();
            displayUsers(users.results || users);
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Display users list
     */
    function displayUsers(users) {
        const usersContainer = document.getElementById("users-container");
        if (!usersContainer) return;
        
        console.log("Displaying users:", users);
        
        // Handle different API response structures
        if (!users) {
            console.error("No users data received");
            usersContainer.innerHTML = `
                <div class="alert alert-error">Error loading users data</div>
            `;
            return;
        }
        
        // Handle array in results property (common in DRF pagination)
        const usersList = Array.isArray(users) ? users : 
                         (users.results && Array.isArray(users.results)) ? users.results : [];
        
        if (usersList.length === 0) {
            usersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users empty-icon"></i>
                    <h2>No users found</h2>
                    <p>Try a different search term</p>
                </div>
            `;
            return;
        }
        
        usersContainer.innerHTML = `
            <div class="users-grid">
                ${usersList.map(user => `
                    <div class="user-card">
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-info">
                            <h3>${user.username || 'Unknown User'}</h3>
                            <p>${user.first_name || ''} ${user.last_name || ''}</p>
                        </div>
                        <div class="user-stats">
                            <span><i class="fas fa-sticky-note"></i> ${user.notes_count || 0}</span>
                            <span><i class="fas fa-globe"></i> ${user.public_notes_count || 0}</span>
                        </div>
                        <div class="user-actions">
                            <a href="user-detail.html?id=${user.id}" class="btn btn-outline-primary btn-sm">
                                <i class="fas fa-eye"></i> View Profile
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Show loading spinner
     */
    function showLoading() {
        const existingSpinner = document.querySelector('.loading-overlay');
        if (existingSpinner) return;
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-overlay';
        spinner.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div>';
        document.body.appendChild(spinner);
    }
    
    /**
     * Hide loading spinner
     */
    function hideLoading() {
        const spinner = document.querySelector('.loading-overlay');
        if (spinner) {
            spinner.remove();
        }
    }
    
    /**
     * Show alert message
     */
    function showAlert(type, message) {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;
        
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;
        
        // Auto-dismiss alert
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
});