document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONSTANTS ---
    const LOCAL_STORAGE_KEY_SECURE_NOTES = 'memoriaAppSecureNotes';
    let notes = [];
    let editingNote = null;

    // --- DOM ELEMENT SELECTORS ---
    const loader = document.getElementById('loader');
    const emptyState = document.getElementById('empty-state');
    const notesGrid = document.getElementById('notes-grid');
    const addNewNoteBtn = document.getElementById('add-new-note-btn');
    
    // Dialog elements
    const dialogOverlay = document.getElementById('dialog-overlay');
    const dialogContent = document.getElementById('dialog-content');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogDescription = document.getElementById('dialog-description');
    const noteForm = document.getElementById('note-form');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');

    // Toast container
    const toastContainer = document.getElementById('toast-container');

    // --- HELPER FUNCTIONS ---

    /**
     * Formats an ISO date string into a more readable format.
     * Example: "Dec 5, 2023 at 2:30 PM"
     * @param {string} isoString - The ISO date string to format.
     * @returns {string} The formatted date string.
     */
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(' at ', ' at ');
    };

    /**
     * Saves the current notes array to localStorage.
     */
    const saveNotesToLocalStorage = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY_SECURE_NOTES, JSON.stringify(notes));
    };

    /**
     * Displays a toast notification.
     * @param {{title: string, description: string, variant?: 'default'|'destructive'}} options
     */
    const showToast = ({ title, description, variant = 'default' }) => {
        const toast = document.createElement('div');
        toast.className = `toast ${variant === 'destructive' ? 'toast-destructive' : ''}`;
        
        const toastContent = document.createElement('div');
        toastContent.className = 'toast-content';

        const toastTitle = document.createElement('p');
        toastTitle.className = 'title';
        toastTitle.textContent = title;

        const toastDescription = document.createElement('p');
        toastDescription.className = 'description';
        toastDescription.textContent = description;

        toastContent.appendChild(toastTitle);
        toastContent.appendChild(toastDescription);
        toast.appendChild(toastContent);
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toast-out 0.5s forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
    };

    // --- CORE LOGIC ---

    /**
     * Renders the notes from the `notes` array into the DOM.
     */
    const renderNotes = () => {
        notesGrid.innerHTML = ''; // Clear existing notes
        
        if (notes.length === 0) {
            emptyState.classList.remove('hidden');
            notesGrid.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            notesGrid.classList.remove('hidden');

            notes.forEach(note => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.id = note.id;

                card.innerHTML = `
                    <div class="card-header">
                        <h3 class="card-title">${note.title}</h3>
                        <p class="card-description">Last updated: ${formatDate(note.lastUpdated)}</p>
                    </div>
                    <div class="card-content">
                        <p>${note.content}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline btn-edit">
                            <i data-lucide="edit"></i> Edit
                        </button>
                        <button class="btn btn-destructive btn-delete">
                            <i data-lucide="trash-2"></i> Delete
                        </button>
                    </div>
                `;
                notesGrid.appendChild(card);
            });
        }
        lucide.createIcons(); // Re-render icons for new elements
    };

    /**
     * Opens the dialog for creating or editing a note.
     * @param {object|null} note - The note to edit, or null to create a new one.
     */
    const openDialog = (note = null) => {
        editingNote = note;
        noteForm.reset();

        if (note) {
            dialogTitle.textContent = 'Edit Note';
            dialogDescription.textContent = 'Modify your existing note.';
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            saveBtn.textContent = 'Save Changes';
        } else {
            dialogTitle.textContent = 'Add New Note';
            dialogDescription.textContent = 'Create a new secure note. It will be saved locally.';
            saveBtn.textContent = 'Save Note';
        }
        dialogOverlay.classList.remove('hidden');
    };

    /**
     * Closes the dialog.
     */
    const closeDialog = () => {
        dialogOverlay.classList.add('hidden');
        editingNote = null;
    };

    /**
     * Handles the form submission for saving a new or edited note.
     * @param {Event} e - The form submission event.
     */
    const handleSaveNote = (e) => {
        e.preventDefault();
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!title) {
            showToast({ title: "Title Missing", description: "Please provide a title for your note.", variant: "destructive" });
            return;
        }
        if (!content) {
            showToast({ title: "Content Missing", description: "Please provide content for your note.", variant: "destructive" });
            return;
        }

        if (editingNote) {
            // Update existing note
            const noteIndex = notes.findIndex(n => n.id === editingNote.id);
            if (noteIndex > -1) {
                notes[noteIndex] = { ...notes[noteIndex], title, content, lastUpdated: new Date().toISOString() };
                showToast({ title: "Note Updated", description: `"${title}" has been updated.` });
            }
        } else {
            // Create new note
            const newNote = {
                id: `note-${Date.now()}`,
                title,
                content,
                lastUpdated: new Date().toISOString(),
            };
            notes.unshift(newNote); // Add to the beginning of the array
            showToast({ title: "Note Added", description: `"${newNote.title}" has been added.` });
        }
        
        saveNotesToLocalStorage();
        renderNotes();
        closeDialog();
    };

    /**
     * Handles the deletion of a note.
     * @param {string} noteId - The ID of the note to delete.
     */
    const handleDeleteNote = (noteId) => {
        const noteToDelete = notes.find(n => n.id === noteId);
        if (noteToDelete && confirm(`Are you sure you want to delete "${noteToDelete.title}"?`)) {
            notes = notes.filter(n => n.id !== noteId);
            saveNotesToLocalStorage();
            renderNotes();
            showToast({ title: "Note Deleted", description: `"${noteToDelete.title}" has been deleted.`, variant: 'destructive' });
        }
    };


    // --- INITIALIZATION & EVENT LISTENERS ---

    // Initial page load
    const initialize = () => {
        try {
            const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY_SECURE_NOTES);
            if (storedNotes) {
                notes = JSON.parse(storedNotes);
            }
        } catch (error) {
            console.error("Error loading secure notes from localStorage:", error);
            notes = [];
        }
        
        loader.classList.add('hidden'); // Hide loader once done
        renderNotes();
    };

    // Add event listeners
    addNewNoteBtn.addEventListener('click', () => openDialog());
    cancelBtn.addEventListener('click', closeDialog);
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            closeDialog();
        }
    });
    noteForm.addEventListener('submit', handleSaveNote);

    // Event delegation for edit and delete buttons on the grid
    notesGrid.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit');
        const deleteButton = e.target.closest('.btn-delete');
        
        if (editButton) {
            const card = editButton.closest('.card');
            const noteId = card.dataset.id;
            const noteToEdit = notes.find(n => n.id === noteId);
            if (noteToEdit) {
                openDialog(noteToEdit);
            }
        }

        if (deleteButton) {
            const card = deleteButton.closest('.card');
            const noteId = card.dataset.id;
            handleDeleteNote(noteId);
        }
    });

    // Start the application
    initialize();
});