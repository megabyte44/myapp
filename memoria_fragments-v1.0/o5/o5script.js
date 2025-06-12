document.addEventListener("DOMContentLoaded", () => {
    // --- CONSTANTS & STATE ---
    const LOCAL_STORAGE_KEY_TASKS = 'memoriaAppTasks';
    let tasks = [];

    // --- DOM ELEMENT REFERENCES ---
    const loadingState = document.getElementById('loading-state');
    const appContainer = document.getElementById('app-container');
    const newTaskTextInput = document.getElementById('new-task-text');
    const newTaskDateInput = document.getElementById('new-task-date');
    const newTaskPriorityInput = document.getElementById('new-task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListContainer = document.getElementById('task-list-container');
    const emptyStateMessage = document.getElementById('empty-state-message');

    // --- HELPER FUNCTIONS ---

    /**
     * Gets the current date in YYYY-MM-DD format, adjusted for timezone.
     * @returns {string}
     */
    const getCurrentDateISO = () => {
        const today = new Date();
        return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    };

    /**
     * Saves the current tasks array to local storage.
     * @param {Array} updatedTasks - The array of tasks to save.
     */
    const saveTasksToLocalStorage = (updatedTasks) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(updatedTasks));
        } catch (error) {
            console.error("Error saving tasks to localStorage:", error);
            alert("Could not save tasks. Your browser's storage might be full.");
        }
    };

    /**
     * A simple replacement for the original app's toast notification.
     * @param {object} options - Toast options.
     */
    const showToast = (options) => {
        // A simple alert, can be replaced with a more sophisticated modal/toast library
        alert(`${options.title}: ${options.description || ''}`);
    };

    /**
     * A simple replacement for the original app's activity log.
     * @param {string} category - Log category.
     * @param {string} action - Log action.
     * @param {string} details - Log details.
     */
    const addLogEntry = (category, action, details) => {
        console.log(`[LOG] ${category} - ${action}: ${details}`);
    };

    // --- CORE LOGIC ---

    /**
     * Renders all tasks to the DOM.
     */
    const renderTasks = () => {
        taskListContainer.innerHTML = ''; // Clear existing tasks

        if (tasks.length === 0) {
            emptyStateMessage.style.display = 'block';
        } else {
            emptyStateMessage.style.display = 'none';
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item';
                taskElement.setAttribute('data-task-id', task.id);

                const formattedDate = new Date(task.date).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

                taskElement.innerHTML = `
                    <!-- GripVertical Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drag-handle">
                        <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
                    </svg>
                    <input type="checkbox" id="task-${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-text-content">
                        <label for="task-${task.id}" class="task-label ${task.completed ? 'completed' : ''}">${task.text}</label>
                        <p class="task-date">Due: ${formattedDate}</p>
                    </div>
                    <span class="priority-badge badge-${task.priority}">${task.priority}</span>
                    <button class="btn btn-ghost btn-icon delete-btn" title="Delete Task">
                        <!-- Trash2 Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="no-pointer-events">
                            <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                `;
                taskListContainer.appendChild(taskElement);
            });
        }
    };

    /**
     * Adds a new task to the list.
     */
    const handleAddTask = () => {
        const text = newTaskTextInput.value.trim();
        if (!text) {
            alert("Task text cannot be empty");
            return;
        }

        const newTask = {
            id: `task-${Date.now()}`,
            text: text,
            completed: false,
            priority: newTaskPriorityInput.value,
            date: newTaskDateInput.value,
        };

        tasks.unshift(newTask); // Add to the beginning of the array
        saveTasksToLocalStorage(tasks);
        addLogEntry("To-Do List", "Task Added", `"${newTask.text}" (Priority: ${newTask.priority}, Due: ${newTask.date})`);
        
        // Reset form and re-render
        newTaskTextInput.value = '';
        renderTasks();

        showToast({
            title: "Task Added",
            description: `"${newTask.text}" has been added to your list.`,
        });
    };
    
    /**
     * Handles clicks within the task list for toggling or deleting.
     * @param {Event} e The click event.
     */
    const handleTaskListClick = (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.getAttribute('data-task-id');
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        // Handle checkbox toggle
        if (e.target.matches('.task-checkbox')) {
            const task = tasks[taskIndex];
            task.completed = !task.completed;
            const newStatus = task.completed ? "Completed" : "Marked Incomplete";
            
            saveTasksToLocalStorage(tasks);
            addLogEntry("To-Do List", `Task ${newStatus}`, `"${task.text}"`);
            renderTasks(); // Re-render to update styles
        }
        
        // Handle delete button click
        if (e.target.closest('.delete-btn')) {
            const taskToDelete = tasks[taskIndex];
            tasks.splice(taskIndex, 1); // Remove the task
            
            saveTasksToLocalStorage(tasks);
            addLogEntry("To-Do List", "Task Deleted", `"${taskToDelete.text}"`);
            renderTasks();

            showToast({
                title: "Task Deleted",
                description: `"${taskToDelete.text}" has been removed.`,
            });
        }
    };

    // --- INITIALIZATION ---

    const initializeApp = () => {
        try {
            const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
            if (storedTasks) {
                tasks = JSON.parse(storedTasks);
            } else {
                // Initialize with sample tasks if none are stored
                tasks = [
                    { id: "sample-1", text: "Grocery shopping", completed: false, priority: "high", date: getCurrentDateISO() },
                    { id: "sample-2", text: "Book doctor appointment", completed: true, priority: "medium", date: "2023-11-10" },
                ];
                saveTasksToLocalStorage(tasks);
            }
        } catch (error) {
            console.error("Error loading tasks from localStorage:", error);
            tasks = []; // Start with an empty list on error
        }

        // Set default values for the form
        newTaskDateInput.value = getCurrentDateISO();
        newTaskPriorityInput.value = 'medium';

        // Render everything
        renderTasks();

        // Hide loader and show app
        loadingState.style.display = 'none';
        appContainer.style.display = 'block';
    };

    // --- EVENT LISTENERS ---
    addTaskBtn.addEventListener('click', handleAddTask);
    newTaskTextInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });
    taskListContainer.addEventListener('click', handleTaskListClick);


    // Start the application
    initializeApp();
});