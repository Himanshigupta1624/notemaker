document.addEventListener("DOMContentLoaded",function(){
    checkAuth();
    const notesContainer=document.getElementById("notes-container");
    const searchInput=document.getElementById("search-notes");
    const searchBtn=document.getElementById("search-btn");
    const sortSelect=document.getElementById("sort-notes");
    loadNotes();

    searchBtn.addEventListener("click",loadNotes);
    sortSelect.addEventListener("change",loadNotes);

    searchInput.addEventListener("input",debounce(function(){
        loadNotes();
    },300));

    async function loadNotes() {
        try{
            showLoading();
            const searchTerm=searchInput.value ;
            const sortOrder =sortSelect.value;

            let url = `${API_URL}/notes/my_notes/?ordering=${sortOrder}`;
            if(searchTerm){
                url+=`&search=${encodeURIComponent(searchTerm)}`;
            }
            const response =await fetchWithAuth(url);
            if (!response.ok){
                throw new Error("Failed to load notes");

            }
            const data=await response.json();
            displayNotes(data);

        }
        catch(error){
            showAlert("error",error.message);
        }
        finally{
            hideLoading();
        }
    }

    function displayNotes(notes){
        notesContainer.innerHTML= "";

        if (!notes || notes.length === 0) {
            notesContainer.innerHTML= `
            <div class="empty-state">
                    <i class="fas fa-book empty-icon"></i>
                    <h2>No notes found</h2>
                    <p>Get started by creating your first note!</p>
                    <a href="create-note.html" class="btn btn-primary">Create Note</a>
                </div>
            `;
            return;
        }
        notes.forEach(note =>{
            const date=new Date(note.updated_at).toLocaleDateString();
            // Truncate content for preview
            const contentPreview=note.content.length >100
            ? note.content.substring(0,100) + "..." :note.content;
            const noteCard=document.createElement("div");
            noteCard.className ="card note-card";
            noteCard.innerHTML = `
            <div class="card-body">
                    <div class="note-header">
                        <h3 class="note-title">${note.title}</h3>
                    </div>
                    <p class="note-content">${contentPreview}</p>
                    <div class="note-footer">
                        <span>${date}</span>
                        <span class="note-badge ${note.visibility === 'public' ? 'badge-public' : 'badge-private'}">
                            ${note.visibility}
                        </span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="note-actions">
                        <a href="view-note.html?id=${note.id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i> View
                        </a>
                        <a href="create-note.html?id=${note.id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <button class="btn btn-sm btn-outline-danger delete-note" data-id="${note.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            const deleteBtn=noteCard.querySelector(".delete-note");
            deleteBtn.addEventListener("click",function(){
                const noteId=this.getAttribute("data-id");
                deleteNote(noteId);
            });
            notesContainer.appendChild(noteCard)

        });
    }
    async function deleteNote(noteId) {
        if (!confirm("Are you sure you want to delete this note ?")){
            return;
        }
        try{
            showLoading();
            const response=await fetchWithAuth(`${API_URL}/notes/${noteId}/`,{
                method : "DELETE"
            });
            if (!response.ok){
                throw new Error("Failed to delete the note");
            }
            showAlert("success","Note deleted suucessfully");
            loadNotes();

        }
        catch(error){
            showAlert("error",error.message);

        }
        finally{
            hideLoading();
        }
    }
    function debounce(func,delay){
        let timeout;
        return function(){
            const context =this;
            const args =arguments;
            clearTimeout(timeout);
            timeout=setTimeout(()=> func.apply(context,args),delay)
        }
    }
})