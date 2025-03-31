

document.addEventListener("DOMContentLoaded", function() {
    checkAuth();
    
    // Initialize page functionality
    initializePage();
    
    /**
     * Initialize page based on current content
     */
    function initializePage() {
        // Initialize appropriate functionality based on page content
        const noteForm = document.getElementById("note-form");
        if (noteForm) {
            handleNoteForm();
        }
        
        const noteViewContainer = document.getElementById("note-view-container");
        if (noteViewContainer) {
            loadNoteDetail();
        }
        
        const publicNotesContainer = document.getElementById("public-notes-container");
        if (publicNotesContainer) {
            loadPublicNotes();
        }
        
        // Dashboard notes
        const notesContainer = document.getElementById("notes-container");
        if (notesContainer) {
            loadNotes();
        }
        
        // Add event listeners for search and sort controls
        setupEventListeners();
    }
    
    /**
     * Setup event listeners for search and sorting
     */
    function setupEventListeners() {
        const searchInput = document.getElementById("search-notes");
        const sortSelect = document.getElementById("sort-notes");
        const searchPublicInput = document.getElementById("search-public-notes");
        const sortPublicSelect = document.getElementById("sort-public-notes");
        const searchBtn = document.getElementById("search-btn");
        const searchPublicBtn = document.getElementById("search-public-btn");
        
        if (sortSelect) {
            sortSelect.addEventListener("change", loadNotes);
        }
        
        if (searchBtn) {
            searchBtn.addEventListener("click", loadNotes);
        }
        
        if (searchInput) {
            searchInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    loadNotes();
                }
            });
        }
        
        if (sortPublicSelect) {
            sortPublicSelect.addEventListener("change", loadPublicNotes);
        }
        
        if (searchPublicBtn) {
            searchPublicBtn.addEventListener("click", loadPublicNotes);
        }
        
        if (searchPublicInput) {
            searchPublicInput.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    loadPublicNotes();
                }
            });
        }
        
        // Close dropdowns when clicking elsewhere
        document.addEventListener('click', function() {
            const dropdowns = document.querySelectorAll('.note-menu-dropdown.show');
            dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
        });
    }
    
    
    
    /**
     * Handle note form submission for create/edit
     */
    function handleNoteForm() {
        const pageTitle = document.getElementById('page-title');
        const titleInput = document.getElementById("title");
        const contentInput = document.getElementById("content");
        const visibilityCheckbox = document.getElementById("visibility");
        const saveBtn = document.getElementById("save-btn");
        const noteForm = document.getElementById("note-form");
    
        // Check if editing existing note
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = urlParams.get("id");
        if (noteId) {
            if (pageTitle) pageTitle.textContent = "Edit Note";
            if (saveBtn) saveBtn.textContent = "Update Note";
            loadNoteForEditing(noteId);
        } else {
            if (pageTitle) pageTitle.textContent = "Create New Note";
            if (saveBtn) saveBtn.textContent = "Save Note";
        }
        
        // Create a clone to remove any existing event listeners
        const newNoteForm = noteForm.cloneNode(true);
        noteForm.parentNode.replaceChild(newNoteForm, noteForm);
        
        // Important: Use the newNoteForm variable here instead of noteForm
        // This is the key fix - attach event listener to the cloned form that's actually in the DOM
        newNoteForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("Form submission prevented default");
    
            const titleInput = document.getElementById("title");
            const contentInput = document.getElementById("content");
            const visibilityCheckbox = document.getElementById("visibility");
            
                
            const noteData = {
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                visibility: visibilityCheckbox.checked ? "public" : "private",
            };
            
            console.log("Submitting note data:", noteData);
            
            try {
                showLoading();
                let url = `${API_URL}/notes/`;
                let method = 'POST';
                if (noteId) {
                    url += `${noteId}/`;
                    method = "PUT";
                }
                console.log("Request URL:", url);
                console.log("Request method:", method);
                console.log("Complete request payload:", JSON.stringify(noteData, null, 2));
                
                const response = await fetchWithAuth(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(noteData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Server error response:", errorData); 
                    let errorMessage = "Failed to save note";
                    
                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    } else if (typeof errorData === 'object') {
                        errorMessage = Object.entries(errorData)
                            .map(([field, errors]) => {
                                if (Array.isArray(errors)) {
                                    return `${field}: ${errors.join(", ")}`;
                                } else if (typeof errors === 'object' && errors !== null) {
                                    return `${field}: ${JSON.stringify(errors)}`;
                                } else {
                                    return `${field}: ${errors}`;
                                }
                            })
                            .join("; ");
                    }
                    throw new Error(errorMessage);
                }
                console.log("Note saved successfully");
                showAlert("success", noteId ? "Note updated successfully" : "Note created successfully");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            } catch (error) {
                showAlert("error", error.message);
            } finally {
                hideLoading();
            }
            return false;
        });
        
        // For extra safety, add direct click handler to the save button
        const newSaveBtn = newNoteForm.querySelector("#save-btn");
        if (newSaveBtn) {
            newSaveBtn.addEventListener("click", function() {
                console.log("Save button clicked directly");
            });
        }
    }

    /**
     * Load a note for editing
     */
    async function loadNoteForEditing(noteId) {
        try {
            showLoading();
            const response = await fetchWithAuth(`${API_URL}/notes/${noteId}/`);
            if (!response.ok) {
                throw new Error("Failed to load note");
            }
            
            const note = await response.json();
            console.log("Loaded note for editing:", note);
            
            // Populate form fields
            if (document.getElementById("title")) document.getElementById("title").value = note.title || '';
            if (document.getElementById("content")) document.getElementById("content").value = note.content || '';
            if (document.getElementById("visibility")) document.getElementById("visibility").checked = note.visibility === "public";
            
        } catch (error) {
            console.error("Error loading note:", error);
            showAlert("error", error.message);
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
        } finally {
            hideLoading();
        }
    }

    /**
     * Load note detail for viewing
     */
    async function loadNoteDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const noteId = urlParams.get("id");
        if (!noteId) {
            showAlert("error", "Note ID not provided");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 2000);
            return;
        }
        
        try {
            showLoading();
            const response = await fetchWithAuth(`${API_URL}/notes/${noteId}/`);
            if (!response.ok) {
                throw new Error("Failed to load note");
            }
            const note = await response.json();
            displayNoteDetail(note);
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Display note detail
     */
    function displayNoteDetail(note) {
        const noteViewContainer = document.getElementById("note-view-container");
        if (!noteViewContainer) return;
        
        const createdDate = new Date(note.created_at).toLocaleString();
        const updatedDate = new Date(note.updated_at).toLocaleString();
        
        
        noteViewContainer.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="note-view-header">
                        <h2>${note.title || 'Untitled'}</h2>
                        <span class="note-badge ${note.visibility === 'public' ? 'badge-public' : 'badge-private'}">
                            ${note.visibility || 'private'}
                        </span>
                    </div>
                    
                    <div class="note-view-meta">
                        <div>
                            <p><strong>Created:</strong> ${createdDate}</p>
                            <p><strong>Last Updated:</strong> ${updatedDate}</p>
                        </div>
                        <div>
                            <p><strong>Author:</strong> ${note.author ? note.author.username : 'Unknown'}</p>
                        </div>
                    </div>
                    
                    <div class="note-view-content">
                        ${note.content ? note.content.replace(/\n/g, '<br>') : ''}
                    </div>
                    
                    
                    <div class="note-view-actions">
                        <a href="dashboard.html" class="btn btn-outline-primary">Back to Notes</a>
                        <div>
                            <a href="create-note.html?id=${note.id}" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                            <button id="delete-note-btn" class="btn btn-danger">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const deleteBtn = document.getElementById("delete-note-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", function() {
                deleteNote(note.id);
            });
        }
    }
    /**
     * Delete a note
     */
    async function deleteNote(noteId) {
        if (!confirm("Are you sure you want to delete this note?")) {
            return;
        }
        
        try {
            showLoading();
            const response = await fetchWithAuth(`${API_URL}/notes/${noteId}/`, {
                method: "DELETE"
            });
            
            if (!response.ok) {
                throw new Error("Failed to delete note");
            }
            
            showAlert("success", "Note deleted successfully");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }

    /**
     * Load user's notes for dashboard
     */
    async function loadNotes() {
        try {
            showLoading();
            const searchInput = document.getElementById("search-notes");
            const sortSelect = document.getElementById("sort-notes");
            
            let url = `${API_URL}/notes/`;
            
            // Add search and sort parameters if available
            if (searchInput && sortSelect) {
                const searchTerm = searchInput.value;
                const sortOrder = sortSelect.value;
                
                if (sortOrder) {
                    url += `?ordering=${sortOrder}`;
                }
                
                if (searchTerm) {
                    url += `${sortOrder ? '&' : '?'}search=${encodeURIComponent(searchTerm)}`;
                }
            }
            
            const response = await fetchWithAuth(url);
            
            if (!response.ok) {
                throw new Error("Failed to load notes");
            }
            
            const notes = await response.json();
            displayNotes(notes);
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Display user's notes on dashboard
     */
    function displayNotes(notes) {
        const notesContainer = document.getElementById("notes-container");
        if (!notesContainer) return;
        
        if (!notes || notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note empty-icon"></i>
                    <h2>No notes yet</h2>
                    <p>Create your first note to get started</p>
                    <a href="create-note.html" class="btn btn-primary">Create Note</a>
                </div>
            `;
            return;
        }
        
        notesContainer.innerHTML = "";
        
        notes.forEach(note => {
            const updatedDate = new Date(note.updated_at).toLocaleDateString();
            
            // Truncate content for preview
            const contentPreview = note.content ? 
                (note.content.length > 100 ? note.content.substring(0, 100) + "..." : note.content) : "";
            
            const noteCard = document.createElement("div");
            noteCard.className = "note-card";
            noteCard.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${note.title || 'Untitled'}</h3>
                    <div class="note-menu">
                        <button type="button" class="note-menu-btn" aria-label="Note options">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="note-menu-dropdown">
                            <a href="view-note.html?id=${note.id}" class="note-menu-item">
                                <i class="fas fa-eye"></i> View
                            </a>
                            <a href="create-note.html?id=${note.id}" class="note-menu-item">
                                <i class="fas fa-edit"></i> Edit
                            </a>
                            <a href="#" class="note-menu-item delete" data-id="${note.id}">
                                <i class="fas fa-trash"></i> Delete
                            </a>
                        </div>
                    </div>
                </div>
                <div class="note-content">${contentPreview}</div>
                <div class="note-footer">
                    <span class="note-date">
                        <i class="far fa-calendar-alt"></i> ${updatedDate}
                    </span>
                    <span class="${note.visibility === 'public' ? 'public-badge' : 'private-badge'}">
                        ${note.visibility || 'private'}
                    </span>
                </div>
            `;
            
            notesContainer.appendChild(noteCard);
            
            // Add event listener for note menu toggle
            const menuBtn = noteCard.querySelector('.note-menu-btn');
            const menuDropdown = noteCard.querySelector('.note-menu-dropdown');
            
            if (menuBtn && menuDropdown) {
                menuBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    menuDropdown.classList.toggle('show');
                });
            }
            
            // Add event listener for delete action
            const deleteLink = noteCard.querySelector('.note-menu-item.delete');
            if (deleteLink) {
                deleteLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    deleteNote(note.id);
                });
            }
        });
    }

    /**
     * Load public notes
     */
    async function loadPublicNotes() {
        try {
            showLoading();
            const searchInput = document.getElementById("search-public-notes");
            const sortSelect = document.getElementById("sort-public-notes");
            let url = `${API_URL}/notes/public/`;
            
            if (searchInput && sortSelect) {
                const searchTerm = searchInput.value;
                const sortOrder = sortSelect.value;
                
                if (sortOrder) {
                    url += `?ordering=${sortOrder}`;
                }
                
                if (searchTerm) {
                    url += `${sortOrder ? '&' : '?'}search=${encodeURIComponent(searchTerm)}`;
                }
            }
            
            const response = await fetchWithAuth(url);
            
            if (!response.ok) {
                throw new Error("Failed to load public notes");
            }
            
            const notes = await response.json();
            displayPublicNotes(notes);
        } catch (error) {
            showAlert("error", error.message);
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Display public notes
     */
    function displayPublicNotes(notes) {
        const publicNotesContainer = document.getElementById("public-notes-container");
        if (!publicNotesContainer) return;
        
        if (!notes || notes.length === 0) {
            publicNotesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-globe empty-icon"></i>
                    <h2>No public notes found</h2>
                    <p>Be the first to share a note with the community!</p>
                    <a href="create-note.html" class="btn btn-primary">Create Note</a>
                </div>
            `;
            return;
        }
        
        publicNotesContainer.innerHTML = "";
        
        notes.forEach(note => {
            const date = new Date(note.created_at).toLocaleDateString();
            
            // Truncate content for preview
            const contentPreview = note.content ? 
                (note.content.length > 100 ? note.content.substring(0, 100) + "..." : note.content) : "";
            
            
            const noteCard = document.createElement("div");
            noteCard.className = "card note-card";
            noteCard.innerHTML = `
                <div class="card-body">
                    <div class="note-header">
                        <h3 class="note-title">${note.title || 'Untitled'}</h3>
                    </div>
                    <p class="note-content">${contentPreview}</p>
                    <div class="note-footer">
                        <span>By: ${note.author ? note.author.username : 'Unknown'}</span>
                        <span>${date}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="view-note.html?id=${note.id}" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye"></i> View
                    </a>
                </div>
            `;
            
            publicNotesContainer.appendChild(noteCard);
        });
    }
});