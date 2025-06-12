document.addEventListener("DOMContentLoaded", () => {
    // --- STATE & INITIAL DATA ---
    const initialSampleIdeas = [
        { id: "idea1", title: "New Mobile App for Local Artists", status: "New", details: "An app to connect local artists with buyers and event organizers." },
        { id: "idea2", title: "AI-Powered Recipe Generator", status: "Exploring", details: "Generates recipes based on available ingredients and dietary preferences." },
        { id: "idea3", title: "Community Garden Project", status: "New", details: "Start a shared garden space in the neighborhood." },
    ];

    let ideas = [...initialSampleIdeas];

    // --- DOM ELEMENT REFERENCES ---
    const newIdeaTitleInput = document.getElementById("new-idea-title");
    const newIdeaDetailsInput = document.getElementById("new-idea-details");
    const saveIdeaBtn = document.getElementById("save-idea-btn");
    const ideaListContainer = document.getElementById("idea-list-container");
    const noIdeasMessage = document.getElementById("no-ideas-message");

    // --- FUNCTIONS ---

    /**
     * Creates the HTML for a single idea card.
     * @param {object} idea - The idea object.
     * @returns {string} - The HTML string for the card.
     */
    const createIdeaCardHTML = (idea) => {
        const badgeClass = idea.status === "New" ? "badge bg-accent" : "badge variant-secondary";
        
        return `
            <article class="card shadow-md">
                <header class="card-header">
                    <div class="flex-between">
                        <h3 class="card-title font-headline">${idea.title}</h3>
                        <span class="${badgeClass}">${idea.status}</span>
                    </div>
                </header>
                <div class="card-content">
                    <p class="text-sm text-muted-foreground line-clamp-3">${idea.details}</p>
                </div>
                <footer class="card-footer">
                    <button class="btn btn-outline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-mr">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                        Develop
                    </button>
                </footer>
            </article>
        `;
    };

    /**
     * Renders all ideas in the list to the DOM.
     */
    const renderIdeas = () => {
        // Clear the current list
        ideaListContainer.innerHTML = "";

        if (ideas.length === 0) {
            noIdeasMessage.style.display = "block";
            ideaListContainer.style.display = "none";
        } else {
            noIdeasMessage.style.display = "none";
            ideaListContainer.style.display = "grid";
            ideas.forEach(idea => {
                const cardHTML = createIdeaCardHTML(idea);
                ideaListContainer.innerHTML += cardHTML;
            });
        }
    };

    /**
     * Handles the logic for saving a new idea.
     */
    const handleSaveIdea = () => {
        const title = newIdeaTitleInput.value.trim();
        const details = newIdeaDetailsInput.value.trim();

        if (!title) {
            alert("Please enter an idea title."); // Simple validation
            return;
        }

        const newIdea = {
            id: `idea-${Date.now()}`,
            title: title,
            details: details,
            status: "New",
        };

        // Add the new idea to the beginning of the array
        ideas.unshift(newIdea);

        // Re-render the list
        renderIdeas();

        // Clear the input fields
        newIdeaTitleInput.value = "";
        newIdeaDetailsInput.value = "";
    };

    // --- EVENT LISTENERS ---
    saveIdeaBtn.addEventListener("click", handleSaveIdea);
    
    // Add event listener for 'Enter' key on the title input for quick saving
    newIdeaTitleInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents form submission if it were in a <form>
            handleSaveIdea();
        }
    });

    // --- INITIAL RENDER ---
    renderIdeas();
});