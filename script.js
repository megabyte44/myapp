// PASTE THIS AT THE VERY TOP OF SCRIPT.JS
// AT THE VERY TOP OF SCRIPT.JS

const LOCAL_STORAGE_KEY_TASKS = 'memoriaAppToDoTasks';
const LOCAL_STORAGE_KEY_GYM_COMPLETED = 'memoriaAppGymCompletedWorkouts';
const LOCAL_STORAGE_KEY_GYM_CONFIG = 'memoriaGymCycleConfig';
const LOCAL_STORAGE_KEY_GYM_SPLIT = 'gymCyclicalWorkoutSplit';
const LOCAL_STORAGE_KEY_GYM_FOODS = 'memoriaGymCustomFoods';
const LOCAL_STORAGE_KEY_GYM_PROTEIN = 'memoriaGymProteinIntake';
const LOCAL_STORAGE_KEY_GYM_LOGGED_FOOD = 'memoriaGymLoggedFood';



let tasks = []; // <-- THIS IS THE FIX. Define it here.
// AT THE VERY TOP OF SCRIPT.JS


// --- ADD THESE LINES FOR THE GYM TRACKER ---
let proteinIntakes = [];
let loggedFoodItems = [];
let cyclicalWorkoutSplit = {};
let cycleConfig = {};
let completedWorkouts = {};
let customFoodItems = [];
let proteinTarget = "150";
let currentDisplayMonth = new Date();
// -----------------------------------------
// ... your other global constants and variables ...

// --- END OF NEW VARIABLES ---

// ... other global constants ...
// ADD THIS ENTIRE FUNCTION
function navigateToPage(pageId) {
    const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (link) {
        // De-select all other links
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
        
        // Select and trigger a click on the target link
        link.classList.add('active');
        link.click(); 

        // On mobile, also close the sidebar after navigation
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            const sidebarOverlay = document.querySelector('.sidebar-overlay');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('open');
            }
        }
    } else {
        console.error(`Navigation failed: Link for page "${pageId}" not found.`);
    }
}
function loadScript(src, callback) {
    // This function checks if a script (like Lucide) is already loaded.
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
        // If it's already there, just run the code that needs it.
        if (callback) callback();
        return;
    }

    // If it's not loaded, create a new script tag.
    const script = document.createElement('script');
    script.src = src;

    // IMPORTANT: Wait for the script to finish loading.
    script.onload = () => {
        if (callback) callback();
    };

    // Add the script to the page to start loading it.
    document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {

    // ===================================
    //  CORE NAVIGATION (The "Router")
    //  This part is always active.
    // ===================================
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    const loadPage = (pageId) => {
        const template = document.getElementById(pageId);

        if (template) {
            // Step 1: Inject the HTML from the template into the main content area.
            mainContent.innerHTML = template.innerHTML;

            // Step 2: Call the specific initialization function for that page.
            // This ensures the script runs only AFTER the HTML exists.
            switch (pageId) {
                case 'dashboard-page':
                    initializeDashboardPage();
                    break;
                case 'to-do-list-page':
                    initializeToDoListPage();
                    break;
                case 'expense-tracker-page':
                    initializeExpenseTrackerPage();
                    break;
                case 'daily-planner-page':
                    initializeDailyPlannerPage();
                    break;
                case 'gym-tracker-page':
                    initializeGymTracker();
                    break;
                case 'password-vault-page':
                    initializePasswordVaultPage();
                    break;
                case 'secure-note-page':
                    initializeSecureNotePage();
                    break;
                case 'idea-capture-page':
                    initializeIdeaCapturePage();
                    break;
            }
           if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            mainContent.innerHTML = `<p style="color: red;">Error: Page template with ID "${pageId}" not found.</p>`;
        }
    };

    // Add click listeners to all navigation links in the sidebar
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const pageId = link.getAttribute('data-page');
            loadPage(pageId);
        });
    });

    // --- INITIAL PAGE LOAD ---
    // Load the dashboard by default when the app first starts.
    const initialLink = document.querySelector('.nav-link[data-page="dashboard-page"]');
    if (initialLink) {
        initialLink.classList.add('active');
        loadPage('dashboard-page');
    }
        // --- INITIAL PAGE LOAD ---
    // (Your existing initial page load code is here)


    // ===================================
    //  SIDEBAR TOGGLE LOGIC (NEW)
    // ===================================
    const sidebarToggleBtn = document.querySelector('.sidebar-trigger');
    
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            // On mobile, we use a special class to open it
            if (window.innerWidth <= 768) {
                document.body.classList.toggle('sidebar-open-mobile');
            } else {
                // On desktop, we use the collapsed class
                document.body.classList.toggle('sidebar-collapsed');
            }
        });
    }

    // This handles closing the sidebar when a nav link is clicked on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.body.classList.remove('sidebar-open-mobile');
            }
        });
    });

}); // This is the closing parenthesis of your existing DOMContentLoaded listener




// ==========================================================
//  PAGE INITIALIZATION FUNCTIONS
//  All page-specific code is wrapped in these functions.
// ==========================================================

/**
 * Initializes all functionality for the Dashboard page.
 */
// ==========================================================
//  REPLACE your entire initializeDashboardPage function
//  with this new, live-data version.
// ==========================================================

function initializeDashboardPage() {
    console.log("Initializing Live Dashboard Page...");

    // --- 1. DEFINE STORAGE KEYS & DATA VARIABLES ---
    // These keys must match the ones used in your other pages.
    const LOCAL_STORAGE_KEY_TRANSACTIONS = 'memoriaAppTransactions';
    const LOCAL_STORAGE_KEY_BUDGET = 'memoriaAppMonthlyBudget';
    const LOCAL_STORAGE_KEY_TASKS = 'memoriaAppToDoTasks';
    const LOCAL_STORAGE_KEY_PLANNER = 'weeklySchedule';

    let scheduleItems = [];
    let todoItems = [];
    let financialData = {
        todayExpenses: 0,
        netBalance: 0,
        budgetUsed: 0,
        budgetTotal: 0
    };

    // --- 2. LOAD & PROCESS DATA FROM LOCALSTORAGE ---

    // Load and process data from the Daily Planner
    try {
        const storedSchedule = localStorage.getItem(LOCAL_STORAGE_KEY_PLANNER);
        if (storedSchedule) {
            const weeklySchedule = JSON.parse(storedSchedule);
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayName = daysOfWeek[new Date().getDay()];
            // Get today's schedule items, but only show a maximum of 4 on the dashboard
            scheduleItems = weeklySchedule[todayName] ? weeklySchedule[todayName].slice(0, 4) : [];
        }
    } catch (e) {
        console.error("Dashboard: Failed to load planner data.", e);
    }

    // Load and process data from the To-Do List
    try {
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
        if (storedTasks) {
            // Get all tasks, filter to show only incomplete ones, and limit to the top 5
            todoItems = JSON.parse(storedTasks)
                .filter(task => !task.completed)
                .slice(0, 5);
        }
    } catch (e) {
        console.error("Dashboard: Failed to load To-Do data.", e);
    }

    // Load and process data from the Expense Tracker
    try {
        const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSACTIONS);
        const allTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
        
        const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        financialData.netBalance = totalIncome - totalExpenses;

        const todayStr = new Date().toISOString().split('T')[0];
        financialData.todayExpenses = allTransactions
            .filter(t => t.type === 'expense' && t.date === todayStr)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const storedBudget = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET);
        financialData.budgetTotal = storedBudget ? parseInt(storedBudget, 10) : 0;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        financialData.budgetUsed = allTransactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' &&
                       transactionDate.getMonth() === currentMonth &&
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    } catch (e) {
        console.error("Dashboard: Failed to load financial data.", e);
    }


    // --- 3. DOM ELEMENT REFERENCES ---
    const planTitle = document.getElementById('plan-title');
    const planListContainer = document.getElementById('plan-list-container');
    const todayExpensesEl = document.getElementById('today-expenses');
    const netBalanceEl = document.getElementById('net-balance');
    const budgetUsageTextEl = document.getElementById('budget-usage-text');
    const budgetProgressBar = document.getElementById('budget-progress-bar');
    const todoListContainer = document.getElementById('todo-list-container');


    // --- 4. RENDER FUNCTIONS ---
    const renderGreeting = () => {
        if (!planTitle) return;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        planTitle.textContent = `Hi Punith, here's your plan for ${days[new Date().getDay()]}!`;
    };

    const renderPlan = () => {
        if (!planListContainer) return;
        planListContainer.innerHTML = '';
        if (scheduleItems.length === 0) {
            planListContainer.innerHTML = '<li class="plan-item">No plans for today. Enjoy your day!</li>';
            return;
        }
        scheduleItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'plan-item';
            li.innerHTML = `<span class="time">${item.startTime}</span> <span>${item.title}</span>`;
            planListContainer.appendChild(li);
        });
    };

    const renderFinancials = () => {
        if (!todayExpensesEl) return;
        // The data is stored in paisa/cents, so we divide by 100 for display
        todayExpensesEl.textContent = (financialData.todayExpenses / 100).toFixed(2);
        netBalanceEl.textContent = (financialData.netBalance / 100).toFixed(2);
        budgetUsageTextEl.textContent = `${(financialData.budgetUsed / 100).toFixed(2)} / ${(financialData.budgetTotal / 100).toFixed(2)}`;
        
        const budgetProgress = financialData.budgetTotal > 0 ? (financialData.budgetUsed / financialData.budgetTotal) * 100 : 0;
        budgetProgressBar.style.width = `${Math.min(100, budgetProgress)}%`;
    };

    const renderTodoList = () => {
        if (!todoListContainer) return;
        todoListContainer.innerHTML = '';
        if (todoItems.length === 0) {
            todoListContainer.innerHTML = '<div class="todo-item"><p>No pending tasks. Great job!</p></div>';
            return;
        }
        todoItems.forEach(task => {
            const div = document.createElement('div');
            div.className = 'todo-item';
            // Use a unique ID for the dashboard checkbox to avoid conflicts
            div.innerHTML = `
            <div class="todo-item-main">
                <input type="checkbox" id="dash-task-${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="dash-task-${task.id}" class="${task.completed ? 'completed' : ''}">${task.text}</label>
            </div>
            <span class="priority-badge badge-${task.priority}">${task.priority}</span>
        `;todoListContainer.appendChild(div);
        });
    };
        // --- 4a. EVENT LISTENERS ---
    document.getElementById('view-planner-btn')?.addEventListener('click', () => navigateToPage('daily-planner-page'));
    document.getElementById('view-tracker-btn')?.addEventListener('click', () => navigateToPage('expense-tracker-page'));
    document.getElementById('view-tasks-btn')?.addEventListener('click', () => navigateToPage('to-do-list-page'));
    document.getElementById('fab-quick-idea')?.addEventListener('click', () => navigateToPage('idea-capture-page'));

    // Enable Toggling To-Do Items
    if (todoListContainer) {
        todoListContainer.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                const taskId = e.target.id.replace('dash-task-', '');
                
                // We need the full task list, not just the filtered dashboard one
                const allTasks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TASKS) || '[]');
                const masterTaskIndex = allTasks.findIndex(t => t.id === taskId);
                
                if (masterTaskIndex > -1) {
                    allTasks[masterTaskIndex].completed = e.target.checked;
                    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(allTasks));
                }

                // Refresh just the todo list on the dashboard
                const updatedTodoItems = allTasks.filter(task => !task.completed).slice(0, 5);
                todoItems = updatedTodoItems; // Update the local state
                renderTodoList(); // Re-render only this component
            }
        });
    }
    // --- 5. INITIALIZATION CALLS ---
    renderGreeting();
    renderPlan();
    renderFinancials();
    renderTodoList();
}

/**
 * Initializes all functionality for the To-Do List page.
 */
function initializeToDoListPage() {

    const loadingState = document.getElementById('loading-state');
    const appContainer = document.getElementById('app-container');
    const newTaskTextInput = document.getElementById('new-task-text');
    const newTaskDateInput = document.getElementById('new-task-date');
    const newTaskPriorityInput = document.getElementById('new-task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListContainer = document.getElementById('task-list-container');
    const emptyStateMessage = document.getElementById('empty-state-message');


    console.log("Initializing To-Do List Page...");

     const getCurrentDateISO = () => {
        const today = new Date();
        return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    };

    /**
     * Saves the current tasks array to local storage.
     * @param {Array} updatedTasks - The array of tasks to save.
     */
   // Make sure this function exists inside initializeToDoListPage

    const saveTasksToLocalStorage = (updatedTasks) => {
    try {
        // We use a specific key to avoid conflicts with other app data
        localStorage.setItem('memoriaAppToDoTasks', JSON.stringify(updatedTasks));
        console.log("SUCCESS: To-Do list saved to localStorage.");
    } catch (error) {
        console.error("Error saving tasks to localStorage:", error);
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
    taskListContainer.innerHTML = '';
    if (tasks.length === 0) {
        emptyStateMessage.style.display = 'block';
    } else {
        emptyStateMessage.style.display = 'none';
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.setAttribute('data-task-id', task.id);

            const formattedDate = new Date(task.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            // This HTML includes a 'completed' class on the label if task.completed is true
            taskElement.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drag-handle"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                <input type="checkbox" id="task-${task.id}" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-text-content">
                    <label for="task-${task.id}" class="task-label ${task.completed ? 'completed' : ''}">${task.text}</label>
                    <p class="task-date">Due: ${formattedDate}</p>
                </div>
                <span class="priority-badge badge-${task.priority}">${task.priority}</span>
                <button class="btn btn-ghost btn-icon delete-btn" title="Delete Task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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

    // --- Action 1: Handle Checkbox Click ---
    if (e.target.matches('.task-checkbox')) {
        const task = tasks[taskIndex];
        // Toggle the completed status
        task.completed = !task.completed;
        // Save the change
        saveTasksToLocalStorage(tasks);
        // Re-render the list to apply the 'completed' class and strikethrough style
        renderTasks(); 
    }
    
    // --- Action 2: Handle Delete Button Click ---
    if (e.target.closest('.delete-btn')) {
        const taskToDelete = tasks[taskIndex];
        // Remove the task from the data array
        tasks.splice(taskIndex, 1);
        // Save the change
        saveTasksToLocalStorage(tasks);
        addLogEntry("To-Do List", "Task Deleted", `"${taskToDelete.text}"`);
        // Re-render the list to show the item is gone
        renderTasks();
        showToast({ title: "Task Deleted", description: `"${taskToDelete.text}" removed.` });
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

    // The entire content of your `o5script.js` would go here.
    // Make sure to remove its `DOMContentLoaded` wrapper.
}

/**
 * Initializes all functionality for the Expense Tracker page.
 */
function initializeExpenseTrackerPage() {
    console.log("Initializing Expense Tracker Page...");

    const LOCAL_STORAGE_KEY_BUDGET = 'memoriaAppMonthlyBudget';
    const LOCAL_STORAGE_KEY_TRANSACTIONS = 'memoriaAppTransactions';
    const DEFAULT_MONTHLY_BUDGET_PAISA = 1000000; // 2000.00
    const transactionCategories = ["Food", "Transport", "Shopping", "Utilities", "Health", "Entertainment", "Income", "Other"];

    let transactions = [];
    let monthlyBudgetPaisa = DEFAULT_MONTHLY_BUDGET_PAISA;
    let editingTransactionId = null;
    // --- DOM ELEMENT SELECTORS ---
    const loadingStateEl = document.getElementById('loading-state');
    const mainContentEl = document.getElementById('expense-tracker-page');

    // Summary Cards
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const monthlyBudgetEl = document.getElementById('monthly-budget');
    const remainingBudgetEl = document.getElementById('remaining-budget');

    // Budget Section
    const budgetDescriptionEl = document.getElementById('budget-description');
    const progressBarEl = document.getElementById('progress-bar');
    const progressTextEl = document.getElementById('progress-text');
    const monthlyBudgetInput = document.getElementById('monthly-budget-input');
    const setBudgetBtn = document.getElementById('set-budget-btn');

    // Transactions Table
    const transactionsTableBody = document.getElementById('transactions-table-body');
    
    // Dialog (Modal)
    const addTransactionDialogBtn = document.getElementById('add-transaction-dialog-btn');
    const transactionDialog = document.getElementById('transaction-dialog');
    const cancelTxnBtn = document.getElementById('cancel-txn-btn');
    const saveTxnBtn = document.getElementById('save-txn-btn');
    
    // Dialog Form Fields
    const newTxnDate = document.getElementById('new-txn-date');
    const newTxnDescription = document.getElementById('new-txn-description');
    const newTxnAmount = document.getElementById('new-txn-amount');
    const newTxnCategory = document.getElementById('new-txn-category');
    const newTxnType = document.getElementById('new-txn-type');

    // --- HELPER FUNCTIONS ---
    const formatCurrency = (amountInPaisa) => (amountInPaisa / 100).toFixed(2);
    
    const showToast = ({ title, description, variant = 'default' }) => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${variant}`;
        toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-description">${description}</div>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };
    
    // --- DATA HANDLING ---
    const loadData = () => {
        // Load Budget
        const storedBudget = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET);
        monthlyBudgetPaisa = storedBudget ? parseInt(storedBudget, 10) : DEFAULT_MONTHLY_BUDGET_PAISA;
        
        // Load Transactions
        const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSACTIONS);
        transactions = storedTransactions ? JSON.parse(storedTransactions) : [
            { id: "1", date: "2023-11-01", description: "Groceries", category: "Food", amount: -5500, type: "expense" },
            { id: "2", date: "2023-11-01", description: "Salary", category: "Income", amount: 250000, type: "income" },
            { id: "3", date: "2023-11-02", description: "Dinner Out", category: "Food", amount: -3050, type: "expense" },
        ];
    };

    const saveData = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET, monthlyBudgetPaisa.toString());
        localStorage.setItem(LOCAL_STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    };

    // --- RENDERING FUNCTIONS ---
    const renderAll = () => {
        renderSummary();
        renderTransactions();
        renderBudgetProgress();
    };
    
    const renderSummary = () => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const remainingBudget = monthlyBudgetPaisa - totalExpenses;

        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpensesEl.textContent = formatCurrency(totalExpenses);
        monthlyBudgetEl.textContent = formatCurrency(monthlyBudgetPaisa);
        remainingBudgetEl.textContent = formatCurrency(remainingBudget);
        
        remainingBudgetEl.classList.toggle('text-destructive', remainingBudget < 0);
        remainingBudgetEl.classList.toggle('text-green', remainingBudget >= 0);

        monthlyBudgetInput.value = formatCurrency(monthlyBudgetPaisa);
    };

    const renderBudgetProgress = () => {
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const progress = monthlyBudgetPaisa > 0 ? Math.max(0, Math.min(100, (totalExpenses / monthlyBudgetPaisa) * 100)) : 0;
        
        budgetDescriptionEl.textContent = `You've spent ${formatCurrency(totalExpenses)} of your ${formatCurrency(monthlyBudgetPaisa)} budget.`;
        progressBarEl.style.width = `${progress}%`;
        progressTextEl.textContent = `${progress.toFixed(0)}%`;
    };

    const renderTransactions = () => {
        transactionsTableBody.innerHTML = '';
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (sortedTransactions.length === 0) {
            transactionsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions yet.</td></tr>`;
            return;
        }

        sortedTransactions.forEach(t => {
            const row = document.createElement('tr');
            const amountSign = t.type === 'income' ? '+' : '-';
            const amountClass = t.type === 'income' ? 'text-green' : 'text-red';
            const badgeClass = t.type === 'income' ? 'badge-income' : 'badge-expense';

            // This is inside the renderTransactions function in your script.js

    row.innerHTML = `
    <td>${new Date(t.date).toLocaleDateString()}</td>
    <td>${t.description}</td>
    <td><span class="badge ${badgeClass}">${t.category}</span></td>
    <td class="text-right font-medium ${amountClass}">${amountSign}${formatCurrency(Math.abs(t.amount))}</td>
    <td class="text-center">
        <div class="table-actions">
            <!-- EDIT BUTTON with FULL SVG -->
            <button class="button button-ghost edit-btn" data-id="${t.id}" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    <path d="m15 5 4 4"></path>
                </svg>
            </button>

            <!-- DELETE BUTTON with FULL SVG -->
            <button class="button button-ghost delete-btn text-destructive" data-id="${t.id}" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
    </td>
    `;

            transactionsTableBody.appendChild(row);
        });
    };
    
    // --- EVENT HANDLERS ---
    // Add this new function inside initializeExpenseTrackerPage

const startEditingTransaction = (transactionId) => {
    // 1. Find the transaction in our main array
    const transactionToEdit = transactions.find(t => t.id === transactionId);
    if (!transactionToEdit) {
        console.error("Could not find transaction to edit:", transactionId);
        return;
    }

    // 2. Remember that we are now editing this specific transaction
    editingTransactionId = transactionId;

    // 3. Fill the dialog form with the transaction's data
    newTxnDate.value = transactionToEdit.date;
    newTxnDescription.value = transactionToEdit.description;
    // We use Math.abs() because expenses are stored as negative numbers
    newTxnAmount.value = (Math.abs(transactionToEdit.amount) / 100).toFixed(2);
    newTxnCategory.value = transactionToEdit.category;
    newTxnType.value = transactionToEdit.type;

    // 4. Update the dialog's UI to "Edit Mode"
    // (Assuming your dialog has an element with id="dialog-title")
    transactionDialog.querySelector('.dialog-title').textContent = "Edit Transaction";
    saveTxnBtn.textContent = "Update Transaction";

    // 5. Finally, open the dialog
    openDialog();
    };
    const handleSetBudget = () => {
        const budgetValue = parseFloat(monthlyBudgetInput.value);
        if (isNaN(budgetValue) || budgetValue < 0) {
            showToast({ title: "Invalid Budget", description: "Please enter a valid positive number.", variant: "destructive" });
            return;
        }
        monthlyBudgetPaisa = Math.round(budgetValue * 100);
        showToast({ title: "Budget Updated", description: `Monthly budget set to ${formatCurrency(monthlyBudgetPaisa)}.` });
        saveData();
        renderAll();
    };

   // Rename handleAddTransaction to handleSaveTransaction and replace its contents

    const handleSaveTransaction = () => {
    // --- Get all values from the form ---
    const description = newTxnDescription.value.trim();
    const amount = parseFloat(newTxnAmount.value);
    
    if (!description || isNaN(amount)) {
        showToast({ title: "Missing Fields", description: "Please fill in description and amount.", variant: "destructive" });
        return;
    }
    const amountInPaisa = Math.round(amount * 100);

    if (editingTransactionId) {
        // --- UPDATE LOGIC ---
        const transactionIndex = transactions.findIndex(t => t.id === editingTransactionId);
        if (transactionIndex > -1) {
            const transactionToUpdate = transactions[transactionIndex];
            transactionToUpdate.date = newTxnDate.value;
            transactionToUpdate.description = description;
            transactionToUpdate.category = newTxnCategory.value;
            transactionToUpdate.type = newTxnType.value;
            // Set amount based on type (income is positive, expense is negative)
            transactionToUpdate.amount = newTxnType.value === 'expense' ? -Math.abs(amountInPaisa) : Math.abs(amountInPaisa);
            showToast({ title: "Transaction Updated" });
        }
    } else {
        // --- ADD LOGIC (Your original code) ---
        const newTransaction = {
            id: `txn-${Date.now()}`,
            date: newTxnDate.value,
            description: description,
            category: newTxnCategory.value,
            type: newTxnType.value,
            amount: newTxnType.value === 'expense' ? -Math.abs(amountInPaisa) : Math.abs(amountInPaisa),
        };
        transactions.push(newTransaction);
        showToast({ title: "Transaction Added" });
    }

    // --- CLEANUP ---
    saveData();    // Save the new/updated data
    renderAll();   // Re-draw the screen
    closeDialog(); // Close the pop-up
    
    // IMPORTANT: Reset the state back to "add mode" for the next time
    editingTransactionId = null;
    transactionDialog.querySelector('.dialog-title').textContent = "Add New Transaction";
    saveTxnBtn.textContent = "Save Transaction";
};
    
    const handleDeleteTransaction = (id) => {
        transactions = transactions.filter(t => t.id !== id);
        showToast({ title: "Transaction Deleted", description: `Transaction removed.` });
        saveData();
        renderAll();
    };
    
    const handleEditTransaction = (id) => {
        showToast({ title: "Edit Clicked", description: `Editing for transaction ${id} is not yet implemented.` });
    };

    const openDialog = () => {
        // Reset form
        newTxnDate.value = new Date().toISOString().split('T')[0];
        newTxnDescription.value = '';
        newTxnAmount.value = '';
        newTxnCategory.value = 'Food';
        newTxnType.value = 'expense';
        transactionDialog.style.display = 'flex';
    };

    const closeDialog = () => {
        transactionDialog.style.display = 'none';
    };
    
    // --- INITIALIZATION ---
    const init = () => {
        setTimeout(() => {
            loadData();
            
            // Populate category dropdown
            newTxnCategory.innerHTML = transactionCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            
            renderAll();
            
            // Show main content
            loadingStateEl.style.display = 'none';
            mainContentEl.style.display = 'flex';

            // Attach event listeners
            setBudgetBtn.addEventListener('click', handleSetBudget);
            addTransactionDialogBtn.addEventListener('click', openDialog);
            cancelTxnBtn.addEventListener('click', closeDialog);
            saveTxnBtn.addEventListener('click',handleSaveTransaction);
            transactionDialog.addEventListener('click', (e) => {
                if (e.target === transactionDialog) closeDialog();
            });

            transactionsTableBody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-btn');
                const deleteBtn = e.target.closest('.delete-btn');
                if (editBtn) startEditingTransaction(editBtn.dataset.id);
                if (deleteBtn) handleDeleteTransaction(deleteBtn.dataset.id);
            });

        }, 500); // Simulate loading
    };

    init();

    // The entire content of your `o2script.js` would go here.
    // Make sure to remove its `DOMContentLoaded` wrapper.
}

/**
 * Initializes all functionality for the Daily Planner page.
 */
function initializeDailyPlannerPage() {
    console.log("Initializing Daily Planner Page...");

    // --- DOM ELEMENT SELECTORS with Safety Checks ---
    const loadingStateEl = document.getElementById('loading-state'); // Corrected ID from your HTML
    const plannerContentWrapperEl = document.getElementById('planner-content-wrapper'); // Corrected reference
    const scheduleDayTitleEl = document.getElementById('schedule-day-title');
    const addItemTitleEl = document.getElementById('add-item-title');
    const daySelectEl = document.getElementById('day-select');
    const scheduleListEl = document.getElementById('schedule-list');
    
    // Ad-hoc Item Form
    const newItemTitleInput = document.getElementById('new-item-title');
    const newItemStartTimeInput = document.getElementById('new-item-start-time');
    const newItemDurationSelect = document.getElementById('new-item-duration');
    const newItemTagInput = document.getElementById('new-item-tag');
    const newItemAddToAllWeekCheckbox = document.getElementById('new-item-add-to-all-week');
    const addItemBtn = document.getElementById('add-item-btn');

    // Dialog (Modal)
    const editTemplatesBtn = document.getElementById('edit-templates-btn');
    const templateDialog = document.querySelector('#template-dialog'); // Use querySelector for class
    const closeDialogBtn = document.getElementById('close-dialog-btn');
    const templateDaySelect = document.getElementById('template-day-select');
    const templateListEl = document.getElementById('template-list');
    const templateItemsTitleEl = document.getElementById('template-items-title');
    const addTemplateItemTitleEl = document.getElementById('add-template-item-title');

    // Template Item Form
    const templateItemTitleInput = document.getElementById('template-item-title');
    const templateItemStartTimeInput = document.getElementById('template-item-start-time');
    const templateItemDurationSelect = document.getElementById('template-item-duration');
    const templateItemTagInput = document.getElementById('template-item-tag');
    const addTemplateItemBtn = document.getElementById('add-template-item-btn');
    const toastContainer = document.querySelector('.toast-container');


    // --- CRITICAL SAFETY CHECK ---
    // If any of the essential elements are not found, stop the script.
    if (!loadingStateEl || !plannerContentWrapperEl || !daySelectEl || !addItemBtn || !editTemplatesBtn) {
        console.error("Daily Planner Error: One or more essential HTML elements were not found. The script cannot continue.");
        console.error({
            loadingStateEl,
            plannerContentWrapperEl,
            daySelectEl,
            addItemBtn,
            editTemplatesBtn
        });
        return; // Stop execution to prevent crashes.
    }
    
    // --- STATE VARIABLES ---
    let weeklySchedule = {};
    let selectedDay = '';
    let selectedTemplateDay = '';
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const durationOptions = [
        { value: "30", label: "30 minutes" }, { value: "60", label: "1 hour" },
        { value: "90", label: "1.5 hours" },  { value: "120", label: "2 hours" },
        { value: "180", label: "3 hours" },
    ];

    const getCurrentDayName = () => {
        const today = new Date();
        const dayIndex = today.getDay(); // Sunday: 0, Monday: 1, ...
        return daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];
    };

    const parseDurationToMinutes = (durationValue) => parseInt(durationValue, 10) || 30;

    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime) return "00:00";
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        startDate.setMinutes(startDate.getMinutes() + durationMinutes);
        return `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    };
    
    const loadSchedule = () => {
        try {
            const storedSchedule = localStorage.getItem('weeklySchedule');
            weeklySchedule = storedSchedule ? JSON.parse(storedSchedule) : {};
        } catch(e) {
            console.error("Failed to parse weekly schedule from localStorage", e);
            weeklySchedule = {};
        }
        daysOfWeek.forEach(day => {
            if (!weeklySchedule[day]) weeklySchedule[day] = [];
        });
    };

    // Replace your old saveSchedule with this one.

    const saveSchedule = () => {
    try {
        console.log("ACTION: Attempting to save schedule...");
        console.log("DATA:", weeklySchedule); // This shows us the object we are trying to save

        localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));

        console.log("SUCCESS: Schedule saved to localStorage.");
    } catch (error) {
        console.error("CRITICAL ERROR: Failed to stringify or save schedule!", error);
    }
    };

    // Replace your old function with this complete one.

    const renderScheduleList = (day) => {
    // Safety check: if the main list element isn't on the page, do nothing.
    if (!scheduleListEl) return;

    // Clear any old items from the list before drawing new ones.
    scheduleListEl.innerHTML = '';

    const daySchedule = weeklySchedule[day] || [];
    
    // If there are no items for the selected day, show a message and stop.
    if (daySchedule.length === 0) {
        scheduleListEl.innerHTML = `<p class="empty-list-message">No items scheduled for ${day}.</p>`;
        return;
    }

    // *** THE FIX IS HERE: We loop through each item and create its HTML ***
    daySchedule.forEach(item => {
        // 1. Create the main container div for the schedule item.
        const itemElement = document.createElement('div');
        itemElement.className = 'schedule-item';
        // Store the item's unique ID on the element itself for easy access later.
        itemElement.dataset.itemId = item.id;

        // Calculate the end time for display.
        const endTime = calculateEndTime(item.startTime, parseDurationToMinutes(item.duration));

        // 2. Fill the div with the item's details using a template literal.
        itemElement.innerHTML = `
            <div class="time-block">
                <span class="start-time">${item.startTime}</span>
                <span class="separator">-</span>
                <span class="end-time">${endTime}</span>
            </div>
            <div class="details-block">
                <p class="title">${item.title}</p>
                ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
            </div>
            <button class="delete-btn" title="Delete Item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
            </button>
        `;

        // 3. Find the new delete button INSIDE the element we just created.
        const deleteBtn = itemElement.querySelector('.delete-btn');
        if (deleteBtn) {
            // 4. Attach the click listener directly to this specific button.
            deleteBtn.addEventListener('click', () => handleDeleteItem(day, item.id, false));
        }

        // 5. Append the fully built item to the main list on the page.
        scheduleListEl.appendChild(itemElement);
    });
    };

     const renderTemplateList = (day) => {
        templateListEl.innerHTML = '';
        const templateSchedule = weeklySchedule[day] || [];

        if (templateSchedule.length === 0) {
            templateListEl.innerHTML = `<p class="empty-list-message">No items in ${day}'s template.</p>`;
            return;
        }

        templateSchedule.forEach(item => {
             const itemEl = document.createElement('div');
             itemEl.className = 'schedule-item';
             itemEl.innerHTML = `
                <div class="schedule-item-details">
                    <span class="time">${item.startTime} - ${item.endTime}</span>: ${item.title}
                    ${item.tag ? `<span class="schedule-item-tag">${item.tag}</span>` : ''}
                </div>
                <button class="button button-ghost delete-btn" data-item-id="${item.id}" title="Delete item from template">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
            `;
            templateListEl.appendChild(itemEl);
        });

        document.querySelectorAll('#template-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleDeleteItem(day, btn.dataset.itemId, true);
            });
        });
    };
    
    
    const updateUIForSelectedDay = () => {
        if (!scheduleDayTitleEl || !addItemTitleEl) return;
        scheduleDayTitleEl.textContent = `Schedule for ${selectedDay}`;
        addItemTitleEl.textContent = `Add Ad-hoc Item to ${selectedDay}`;
        renderScheduleList(selectedDay);
    };

    const updateUIForSelectedTemplateDay = () => {
        if (!templateItemsTitleEl || !addTemplateItemTitleEl) return;
        templateItemsTitleEl.textContent = `Items for ${selectedTemplateDay}'s Template`;
        addTemplateItemTitleEl.textContent = `Add New Item to ${selectedTemplateDay}'s Template`;
        renderTemplateList(selectedTemplateDay);
    };

    const showToast = ({ title, description, variant = 'default' }) => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${variant}`;
        toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-description">${description}</div>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // Replace the old handleAddItem function with this one

    const handleAddItem = (isTemplate) => {
    // Determine which form fields to use based on the button clicked
    const titleInput = isTemplate ? templateItemTitleInput : newItemTitleInput;
    const startTimeInput = isTemplate ? templateItemStartTimeInput : newItemStartTimeInput;
    const durationSelect = isTemplate ? templateItemDurationSelect : newItemDurationSelect;
    const tagInput = isTemplate ? templateItemTagInput : newItemTagInput;
    const addToAllWeekCheckbox = isTemplate ? null : newItemAddToAllWeekCheckbox; // Only exists for non-template form

    const title = titleInput.value.trim();
    if (!title) {
        showToast({ title: "Title is required", variant: "destructive" });
        return;
    }

    const newItem = {
        id: `item-${Date.now()}`,
        title: title,
        startTime: startTimeInput.value,
        duration: durationSelect.value,
        tag: tagInput.value.trim(),
        isTemplateItem: isTemplate,
    };

    if (isTemplate) {
        // Add to the template for the selected day
        weeklySchedule[selectedTemplateDay].push(newItem);
        showToast({ title: "Template Item Added" });
        // Re-render the list inside the dialog to show the new item
        renderTemplateList(selectedTemplateDay);
    } else {
        // This handles the other "Add Item" button
        if (addToAllWeekCheckbox && addToAllWeekCheckbox.checked) {
            daysOfWeek.forEach(day => weeklySchedule[day].push({ ...newItem }));
            showToast({ title: "Item Added to All Days" });
        } else {
            weeklySchedule[selectedDay].push(newItem);
            showToast({ title: "Item Added" });
        }
        // Re-render the main schedule list
        renderScheduleList(selectedDay);
    }

    // CRITICAL: Save the updated schedule to localStorage
    saveSchedule();

    // Clear the input fields for next use
    titleInput.value = '';
    tagInput.value = '';
    };
   // Replace the empty function with this complete version.

    const handleDeleteItem = (day, itemId, isTemplate) => {
    // Find the specific item in the schedule for that day
    const itemIndex = weeklySchedule[day].findIndex(item => item.id === itemId);

    // If the item exists, remove it
    if (itemIndex > -1) {
        weeklySchedule[day].splice(itemIndex, 1); // This removes the item from the array

        showToast({ title: "Item Deleted", variant: "destructive" });

        // CRITICAL: Save the changes to localStorage
        saveSchedule();

        // Now, update the correct part of the UI
        if (isTemplate) {
            // If we deleted from the template dialog, re-render the template list
            renderTemplateList(day);
        } else {
            // If we deleted from the main page, re-render the main schedule list
            renderScheduleList(day);
        }
    } else {
        console.error(`Could not find item with ID ${itemId} to delete on ${day}.`);
    }
    };
    
    const init = () => {
        // Use a short delay to allow the DOM to update fully before running scripts
        setTimeout(() => {
            loadSchedule();
            selectedDay = getCurrentDayName();
            selectedTemplateDay = selectedDay;

            // Populate dropdowns, checking for element existence first
            if (daySelectEl && templateDaySelect && newItemDurationSelect && templateItemDurationSelect) {
                daysOfWeek.forEach(day => {
                    daySelectEl.innerHTML += `<option value="${day}">${day}</option>`;
                    templateDaySelect.innerHTML += `<option value="${day}">${day}'s Template</option>`;
                });
                durationOptions.forEach(opt => {
                    newItemDurationSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
                    templateItemDurationSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
                });
                daySelectEl.value = selectedDay;
                templateDaySelect.value = selectedDay;
                newItemDurationSelect.value = '60';
                templateItemDurationSelect.value = '60';
            }
            
            updateUIForSelectedDay();

            // --- THE MAIN FIX IS HERE ---
            // Hide loader and show the correct content wrapper
            loadingStateEl.style.display = 'none';
            plannerContentWrapperEl.style.display = 'grid'; // Use the correct variable
        }, 10); // A very small delay is enough.
    };

    // --- EVENT LISTENERS (with safety checks) ---
    if (daySelectEl) daySelectEl.addEventListener('change', (e) => {
        selectedDay = e.target.value;
        updateUIForSelectedDay();
    });
    if (templateDaySelect) templateDaySelect.addEventListener('change', (e) => {
        selectedTemplateDay = e.target.value;
        updateUIForSelectedTemplateDay();
    });
    if (addItemBtn) addItemBtn.addEventListener('click', () => handleAddItem(false));
    if (addTemplateItemBtn) addTemplateItemBtn.addEventListener('click', () => handleAddItem(true));
    if (editTemplatesBtn) editTemplatesBtn.addEventListener('click', () => {
        updateUIForSelectedTemplateDay();
        if (templateDialog) templateDialog.style.display = 'flex';
    });
    if (closeDialogBtn) closeDialogBtn.addEventListener('click', () => {
        if (templateDialog) templateDialog.style.display = 'none';
        updateUIForSelectedDay();
    });
    if (templateDialog) templateDialog.addEventListener('click', (e) => {
        if (e.target === templateDialog) templateDialog.style.display = 'none';
    });

    // Start the application logic
    init();
}

function initializeGymTracker() {
console.log("Initializing Gym Tracker Page...");

    // --- DOM ELEMENT SELECTORS (Corrected Version) ---

    // Elements inside the main gym tracker content
    const pageWrapper = document.querySelector('#main-content .feature-placeholder');

    if (!pageWrapper) {
        console.error("Gym Tracker Fatal Error: The main '.feature-placeholder' container was not found.");
        return;
    }

   // =================================================================
//  COPY AND PASTE THIS ENTIRE CORRECTED BLOCK
// =================================================================

// --- Main Page Content (These are correct) ---
// Change this line
const dialogOverlay = document.getElementById('dialog-overlay'); // CORRECT
const loaderContainer = pageWrapper.querySelector('.loader-container-gym');
const gymMainContent = pageWrapper.querySelector('.page-content-wrapper');
const workoutPlanTitle = pageWrapper.querySelector('#workout-plan-title');
const workoutPlanDescription = pageWrapper.querySelector('#workout-plan-description');
const workoutExercisesContent = pageWrapper.querySelector('#workout-exercises-content');
const toggleWorkoutCompletionBtn = pageWrapper.querySelector('#toggle-workout-completion-btn');
const workoutCard = pageWrapper.querySelector('#workout-card');
const proteinTargetInput = pageWrapper.querySelector('#proteinTarget');
const proteinTargetDesc = pageWrapper.querySelector('#protein-target-description');
const proteinProgressBar = pageWrapper.querySelector('#protein-progress-bar');
const proteinAmountInput = pageWrapper.querySelector('#protein-amount-input');
const logProteinBtn = pageWrapper.querySelector('#log-protein-btn');
const proteinIntakeList = pageWrapper.querySelector('#protein-intake-list');
const quickLogFoodGrid = pageWrapper.querySelector('#quick-log-food-grid');
const loggedFoodList = pageWrapper.querySelector('#logged-food-list');
const calendarGrid = pageWrapper.querySelector('#calendar-grid');
const calendarMonthYear = pageWrapper.querySelector('#calendar-month-year');
const calendarPrevBtn = pageWrapper.querySelector('#calendar-prev-month');
const calendarNextBtn = pageWrapper.querySelector('#calendar-next-month');
const openCycleConfigDialogBtn = pageWrapper.querySelector('#open-cycle-config-dialog');
const openWorkoutPlanDialogBtn = pageWrapper.querySelector('#open-workout-plan-dialog');
const openManageFoodDialogBtn = pageWrapper.querySelector('#open-manage-food-dialog');

// --- Dialogs (These are top-level, so we use document.getElementById) ---
const cycleConfigDialog = document.getElementById('cycle-config-dialog');
const workoutPlanDialog = document.getElementById('workout-plan-dialog');
const manageFoodDialog = document.getElementById('manage-food-dialog'); // FIXED

// --- Elements INSIDE the Cycle Config Dialog ---
const cancelCycleConfigBtn = cycleConfigDialog.querySelector('#cancel-cycle-config');     // FIXED
const saveCycleConfigBtn = cycleConfigDialog.querySelector('#save-cycle-config');         // FIXED
const cycleStartDateInput = cycleConfigDialog.querySelector('#cycle-start-date');       // FIXED
const cycleStartDayKeySelect = cycleConfigDialog.querySelector('#cycle-start-day-key'); // FIXED
const cycleConfigError = cycleConfigDialog.querySelector('#cycle-config-error');        // FIXED
const cycleConfigForm = cycleConfigDialog.querySelector('#cycle-config-form');          // FIXED

// --- Elements INSIDE the Workout Plan Dialog ---
const closeWorkoutPlanDialogBtn = workoutPlanDialog.querySelector('#close-workout-plan-dialog'); // FIXED
const newCycleDayNameInput = workoutPlanDialog.querySelector('#new-cycle-day-name-input');
const addCycleDayBtn = workoutPlanDialog.querySelector('#add-cycle-day-btn');
const cycleDaysList = workoutPlanDialog.querySelector('#cycle-days-list');
const workoutDaySelect = workoutPlanDialog.querySelector('#workout-day-select');
const editDayForm = workoutPlanDialog.querySelector('#edit-day-form');
const dayTitleLabel = workoutPlanDialog.querySelector('#day-title-label');          // FIXED
const dayTitleInput = workoutPlanDialog.querySelector('#day-title-input');          // FIXED
const exerciseList = workoutPlanDialog.querySelector('#exercise-list');
const exercisesForDayTitle = workoutPlanDialog.querySelector('#exercises-for-day-title'); // FIXED
const addExerciseTitle = workoutPlanDialog.querySelector('#add-exercise-title');      // FIXED
const newExerciseNameInput = workoutPlanDialog.querySelector('#new-exercise-name');
const newExerciseSetsInput = workoutPlanDialog.querySelector('#new-exercise-sets');   // FIXED
const newExerciseRepsInput = workoutPlanDialog.querySelector('#new-exercise-reps');   // FIXED
const addExerciseBtn = workoutPlanDialog.querySelector('#add-exercise-btn');

// --- Elements INSIDE the Manage Food Dialog ---
const closeManageFoodDialogBtn = manageFoodDialog.querySelector('#close-manage-food-dialog'); // FIXED
const newCustomFoodItemText = manageFoodDialog.querySelector('#new-custom-food-item-text'); // FIXED
const addCustomFoodItemBtn = manageFoodDialog.querySelector('#add-custom-food-item-btn');   // FIXED
const customFoodItemsList = manageFoodDialog.querySelector('#custom-food-items-list');    // FIXED

    // --- STATE & HELPER FUNCTIONS ---
    let proteinIntakes = [], loggedFoodItems = [], cyclicalWorkoutSplit = {}, cycleConfig = {}, completedWorkouts = {};
    let proteinTarget = "150", customFoodItems = ["Protein Powder", "Creatine", "Oatmeal", "Eggs", "Chicken Breast", "Greek Yogurt"];
    let currentDisplayMonth = new Date();
    const LOCAL_STORAGE_KEY_COMPLETED_WORKOUTS = 'memoriaAppGymCompletedWorkouts';
// --- Add these three helper functions inside initializeGymTracker ---
// Add this new save function inside initializeGymTracker
const saveWorkoutSplit = () => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_GYM_SPLIT, JSON.stringify(cyclicalWorkoutSplit));
        console.log("SUCCESS: Workout split saved to localStorage.");
    } catch (e) {
        console.error("Failed to save workout split.", e);
    }
};
const saveCustomFoodItems = () => {
    try {
        // Use the correct key we defined at the top of the file
        localStorage.setItem(LOCAL_STORAGE_KEY_GYM_FOODS, JSON.stringify(customFoodItems));
        console.log("SUCCESS: Custom food items saved to localStorage.");
    } catch (e) {
        console.error("Failed to save custom food items.", e);
    }
};
// Add this new save function inside initializeGymTracker

const saveProteinIntake = () => {
    try {
        // Use the correct key we defined at the top of the file
        localStorage.setItem(LOCAL_STORAGE_KEY_GYM_PROTEIN, JSON.stringify(proteinIntakes));
        console.log("SUCCESS: Protein intake log saved to localStorage.");
    } catch (e) {
        console.error("Failed to save protein intake log.", e);
    }
};
// Add this new save function inside initializeGymTracker

const saveLoggedFoodItems = () => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_GYM_LOGGED_FOOD, JSON.stringify(loggedFoodItems));
        console.log("SUCCESS: Logged food items saved.");
    } catch (e) {
        console.error("Failed to save logged food items.", e);
    }
};
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const showToast = (message) => {
    alert(message); // A simple placeholder for now
};

    const openDialog = (dialogOverlay,dialogElement) => {
         if (dialogOverlay ) dialogOverlay.classList.remove('hidden'); 
        if (dialogElement) dialogElement.classList.remove('hidden');  
    };
    const closeDialog = (dialogOverlay, dialogElement) => {
    if (dialogOverlay) dialogOverlay.classList.add('hidden');
    if (dialogElement) dialogElement.classList.add('hidden');
    };
// --- Replace your placeholder with this complete function ---

const getWorkoutDayInfoForDate = (date) => {
    if (!cycleConfig.startDate || !cycleConfig.startDayKey || Object.keys(cyclicalWorkoutSplit).length === 0) {
        return { key: "N/A", title: "Cycle Not Configured", exercises: [], isRestDay: true };
    }

    const cycleKeys = Object.keys(cyclicalWorkoutSplit);
    const cycleLength = cycleKeys.length;
    const startDate = new Date(cycleConfig.startDate);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24));

    if (dayDifference < 0) {
        return { key: "N/A", title: "Cycle not yet started", exercises: [], isRestDay: true };
    }

    const startIndex = cycleKeys.indexOf(cycleConfig.startDayKey);
    if (startIndex === -1) {
        return { key: "N/A", title: "Config Error: Start Day Invalid", exercises: [], isRestDay: true };
    }

    const cycleDayIndex = (startIndex + dayDifference) % cycleLength;
    const currentDayKey = cycleKeys[cycleDayIndex];
    const workoutData = cyclicalWorkoutSplit[currentDayKey];

    if (!workoutData) {
        return { key: "N/A", title: "Workout data not found", exercises: [], isRestDay: true };
    }
    
    return {
        key: currentDayKey,
        title: workoutData.title,
        exercises: workoutData.exercises,
        isRestDay: workoutData.exercises.length === 0
    };
};
    
    const createListItem = (text, id, deleteHandler) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.innerHTML = `
            <span>${text}</span>
            <button class="delete-btn" data-id="${id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>`;
        itemDiv.querySelector('.delete-btn').addEventListener('click', () => deleteHandler(id));
        return itemDiv;
    };
    
    // --- RENDER FUNCTIONS ---
    
    const renderProteinTracker = () => {
        const totalProtein = proteinIntakes.reduce((sum, intake) => sum + intake.amount, 0);
        const currentProteinTarget = parseInt(proteinTarget) || 0;
        const proteinProgress = currentProteinTarget > 0 ? Math.min(100, (totalProtein / currentProteinTarget) * 100) : 0;
        
        proteinTargetDesc.textContent = `Target: ${totalProtein}g / ${currentProteinTarget}g`;
        proteinProgressBar.style.width = `${proteinProgress}%`;
        
        proteinIntakeList.innerHTML = '';
        if (proteinIntakes.length > 0) {
            proteinIntakes.forEach(intake => {
                const time = intake.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const item = createListItem(`${intake.amount}g Protein <span style="font-size: 0.75rem; color: #888;">(${time})</span>`, intake.id, handleDeleteProteinIntake);
                proteinIntakeList.appendChild(item);
            });
        } else {
            proteinIntakeList.innerHTML = '<p class="placeholder-text">No protein logged yet.</p>';
        }
    };

    const renderFoodLog = () => {
        const todayKey = formatDate(new Date());
        
        quickLogFoodGrid.innerHTML = '';
        if (customFoodItems.length === 0) {
            quickLogFoodGrid.innerHTML = '<p class="placeholder-text" style="grid-column: span 2;">No quick log items configured.</p>';
        } else {
            customFoodItems.forEach(item => {
                const loggedToday = loggedFoodItems.some(log => log.name === item && formatDate(log.timestamp) === todayKey);
                const btn = document.createElement('button');
                btn.className = 'button';
                btn.innerHTML = `<span>${item}</span> ${loggedToday ? '<span class="check-icon">&#10003;</span>' : ''}`;
                if(loggedToday) {
                    btn.classList.add('logged');
                    btn.disabled = true;
                }
                btn.addEventListener('click', () => handleLogFoodItem(item));
                quickLogFoodGrid.appendChild(btn);
            });
        }
        
        loggedFoodList.innerHTML = '';
        const todaysLoggedItems = loggedFoodItems.filter(log => formatDate(log.timestamp) === todayKey);
        if (todaysLoggedItems.length > 0) {
            todaysLoggedItems.forEach(item => {
                 const time = item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                 const text = `<div><div>${item.name}</div><div style="font-size: 0.75rem; color: #888;">Logged at: ${time}</div></div>`;
                 const listItem = createListItem(text, item.id, handleDeleteLoggedFoodItem);
                 loggedFoodList.appendChild(listItem);
            });
        } else {
            loggedFoodList.innerHTML = '<p class="placeholder-text">No food items logged yet for today.</p>';
        }
    };

    const renderWorkoutPlan = () => {
        const today = getToday();
        const todayKey = formatDate(today);
        const workoutInfo = getWorkoutDayInfoForDate(today);
        const isCompleted = !!completedWorkouts[todayKey];
        
        workoutPlanTitle.textContent = `Workout Plan - ${workoutInfo.key}`;
        workoutPlanDescription.textContent = `Today (${today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }): ${workoutInfo.title}`;
        
        workoutExercisesContent.innerHTML = '';
        if (!cycleConfig.startDate || Object.keys(cyclicalWorkoutSplit).length === 0) {
             workoutExercisesContent.innerHTML = '<p class="placeholder-text">Please configure your workout cycle structure and start date.</p>';
        } else if (workoutInfo.exercises.length > 0) {
            const ul = document.createElement('ul');
            workoutInfo.exercises.forEach(ex => {
                const li = document.createElement('li');
                li.innerHTML = `<p>${ex.name}</p><p>Sets: ${ex.sets}, Reps: ${ex.reps}</p>`;
                ul.appendChild(li);
            });
            workoutExercisesContent.appendChild(ul);
        } else {
            workoutExercisesContent.innerHTML = `<p class="placeholder-text">It's a rest day or no workout scheduled. Enjoy your break!</p>`;
        }
        
        if (cycleConfig.startDate && workoutInfo.exercises.length > 0) {
            toggleWorkoutCompletionBtn.classList.remove('hidden');
            toggleWorkoutCompletionBtn.disabled = false;
            if (isCompleted) {
                toggleWorkoutCompletionBtn.innerHTML = `<span class="icon-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"></path></svg></span> Workout Completed!`;
                toggleWorkoutCompletionBtn.className = 'button w-full secondary';
                workoutCard.classList.add('completed');
            } else {
                toggleWorkoutCompletionBtn.innerHTML = `<span class="icon-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg></span> Mark Today's Workout as Done`;
                toggleWorkoutCompletionBtn.className = 'button w-full';
                workoutCard.classList.remove('completed');
            }
        } else {
            toggleWorkoutCompletionBtn.classList.add('hidden');
        }
    };
    
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const month = currentDisplayMonth.getMonth();
        const year = currentDisplayMonth.getFullYear();

        calendarMonthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday

        const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayHeaders.forEach(header => {
            const dayHeaderDiv = document.createElement('div');
            dayHeaderDiv.className = 'calendar-day-header';
            dayHeaderDiv.textContent = header;
            calendarGrid.appendChild(dayHeaderDiv);
        });
        
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        const today = getToday();

        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = i;
            
            const currentDate = new Date(year, month, i);
            const dateKey = formatDate(currentDate);

            if (formatDate(currentDate) === formatDate(today)) {
                dayCell.classList.add('today');
            }

            const workoutInfo = getWorkoutDayInfoForDate(currentDate);
            if (completedWorkouts[dateKey]) {
                dayCell.classList.add('completed');
            } else if (currentDate < today && !workoutInfo.isRestDay && workoutInfo.key !== 'N/A') {
                 dayCell.classList.add('missed');
            }
            
            calendarGrid.appendChild(dayCell);
        }
    };

    const renderManageWorkoutDialog = () => {
        const cycleWorkoutKeys = Object.keys(cyclicalWorkoutSplit);
        
        // Render Cycle Days List
        cycleDaysList.innerHTML = '';
        if (cycleWorkoutKeys.length > 0) {
            cycleWorkoutKeys.forEach(dayKey => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${dayKey} - ${cyclicalWorkoutSplit[dayKey]?.title || 'Untitled'}</span>`;
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
                deleteBtn.onclick = () => handleDeleteCycleDay(dayKey);
                li.appendChild(deleteBtn);
                cycleDaysList.appendChild(li);
            });
        } else {
             cycleDaysList.innerHTML = '<p class="placeholder-text">No cycle days defined.</p>';
        }

        // Populate Select Dropdown
        workoutDaySelect.innerHTML = '';
        if (cycleWorkoutKeys.length > 0) {
            cycleWorkoutKeys.forEach(dayKey => {
                const option = document.createElement('option');
                option.value = dayKey;
                option.textContent = dayKey;
                workoutDaySelect.appendChild(option);
            });
            document.getElementById('edit-day-section').style.display = 'block';
            renderEditDayForm(workoutDaySelect.value);
        } else {
            document.getElementById('edit-day-section').style.display = 'none';
        }
    };
    
    const renderEditDayForm = (dayKey) => {
        if (!dayKey || !cyclicalWorkoutSplit[dayKey]) {
            editDayForm.classList.add('hidden');
            return;
        }
        editDayForm.classList.remove('hidden');

        const dayData = cyclicalWorkoutSplit[dayKey];
        dayTitleLabel.textContent = `Title for ${dayKey}`;
        dayTitleInput.value = dayData.title;

        exercisesForDayTitle.textContent = `Exercises for ${dayData.title || dayKey}`;
        addExerciseTitle.textContent = `Add New Exercise to ${dayData.title || dayKey}`;

        exerciseList.innerHTML = '';
        if (dayData.exercises.length > 0) {
             dayData.exercises.forEach((ex, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<div><p style="font-weight: 600;">${ex.name}</p><p style="font-size: 0.8rem; color: #555;">Sets: ${ex.sets}, Reps: ${ex.reps}</p></div>`;
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
                deleteBtn.onclick = () => handleDeleteExerciseFromDay(index);
                li.appendChild(deleteBtn);
                exerciseList.appendChild(li);
            });
        } else {
            exerciseList.innerHTML = `<p class="placeholder-text">No exercises for ${dayKey}.</p>`;
        }
    };

    const renderManageFoodDialog = () => {
        customFoodItemsList.innerHTML = '';
        if (customFoodItems.length > 0) {
            customFoodItems.forEach(item => {
                 const li = document.createElement('div');
                 li.className = 'list-item';
                 li.innerHTML = `<span>${item}</span>`;
                 const deleteBtn = document.createElement('button');
                 deleteBtn.className = 'delete-btn';
                 deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
                 deleteBtn.onclick = () => handleDeleteCustomFoodItem(item);
                 li.appendChild(deleteBtn);
                 customFoodItemsList.appendChild(li);
            });
        } else {
            customFoodItemsList.innerHTML = '<p class="placeholder-text">No custom items added yet.</p>';
        }
    };
   


    // --- EVENT HANDLERS ---
    
    // Protein
    const handleLogProtein = () => {
        const amount = parseInt(proteinAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            showToast("Please enter a valid protein amount.", "destructive");
            return;
        }
        proteinIntakes.push({ id: `protein-${Date.now()}`, amount, timestamp: new Date() });
        proteinAmountInput.value = "";
       
        saveProteinIntake();
        renderProteinTracker();
    };
    const handleDeleteProteinIntake = (id) => {
        proteinIntakes = proteinIntakes.filter(p => p.id !== id);
        showToast("Protein entry deleted.");
        saveProteinIntake(); 
        renderProteinTracker();
    };

    // Food
    const handleLogFoodItem = (itemName) => {
        loggedFoodItems.push({ id: `food-${Date.now()}-${itemName.replace(/\s+/g, '')}`, name: itemName, timestamp: new Date() });
         saveLoggedFoodItems();
        renderFoodLog();
    };
    const handleDeleteLoggedFoodItem = (id) => {
        loggedFoodItems = loggedFoodItems.filter(item => item.id !== id);
        showToast("Food entry deleted.");
         saveLoggedFoodItems();
        renderFoodLog();
    };
    
    // Workout Completion
    const handleToggleWorkoutCompletion = () => {
        const todayKey = formatDate(getToday());
        completedWorkouts[todayKey] = !completedWorkouts[todayKey];
        localStorage.setItem(LOCAL_STORAGE_KEY_COMPLETED_WORKOUTS, JSON.stringify(completedWorkouts));
        showToast(completedWorkouts[todayKey] ? "Workout Completed!" : "Workout marked incomplete.");
        renderAll();
    };
    
    // Cycle Config Dialog
    const handleOpenCycleConfigDialog = () => {
        const cycleWorkoutKeys = Object.keys(cyclicalWorkoutSplit);
        if (cycleWorkoutKeys.length === 0) {
            cycleConfigError.classList.remove('hidden');
            cycleConfigForm.classList.add('hidden');
            saveCycleConfigBtn.disabled = true;
        } else {
            cycleConfigError.classList.add('hidden');
            cycleConfigForm.classList.remove('hidden');
            saveCycleConfigBtn.disabled = false;

            cycleStartDateInput.value = cycleConfig.startDate ? formatDate(cycleConfig.startDate) : '';
            cycleStartDayKeySelect.innerHTML = '';
            cycleWorkoutKeys.forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${key} - ${cyclicalWorkoutSplit[key]?.title || 'Untitled'}`;
                cycleStartDayKeySelect.appendChild(option);
            });
            cycleStartDayKeySelect.value = cycleConfig.startDayKey;
        }
        openDialog(cycleConfigDialog);
    };
  const handleSaveCycleConfig = () => {
    const newStartDate = new Date(cycleStartDateInput.value);
    const newStartDayKey = cycleStartDayKeySelect.value;
    // ... your existing validation ...
    
    newStartDate.setMinutes(newStartDate.getMinutes() + newStartDate.getTimezoneOffset());
    
    cycleConfig.startDate = newStartDate;
    cycleConfig.startDayKey = newStartDayKey;

    // --- ADD THIS LINE ---
    localStorage.setItem('memoriaGymCycleConfig', JSON.stringify(cycleConfig));

    showToast("Cycle configuration saved.");
    closeDialog(cycleConfigDialog);
    renderAll();
    };

    // Manage Workout Plan Dialog
    const handleAddCycleDay = () => {
        const newKey = newCycleDayNameInput.value.trim();
        if (!newKey) {
            showToast("Cycle day name cannot be empty.", "destructive");
            return;
        }
        if (cyclicalWorkoutSplit[newKey]) {
            showToast(`"${newKey}" already exists.`, "destructive");
            return;
        }
        cyclicalWorkoutSplit[newKey] = { title: newKey, exercises: [] };
        newCycleDayNameInput.value = '';
        showToast(`Cycle day "${newKey}" added.`);
        renderManageWorkoutDialog();
    };
    const handleDeleteCycleDay = (dayKeyToDelete) => {
        if (Object.keys(cyclicalWorkoutSplit).length <= 1) {
            showToast("Cannot delete the last day.", "destructive");
            return;
        }
        delete cyclicalWorkoutSplit[dayKeyToDelete];
        showToast(`"${dayKeyToDelete}" deleted.`);
        // If the deleted day was selected for editing, reset the selection
        if (workoutDaySelect.value === dayKeyToDelete) {
            workoutDaySelect.value = Object.keys(cyclicalWorkoutSplit)[0] || '';
        }
        renderManageWorkoutDialog();
    };
    const handleWorkoutDayTitleChange = (dayKey, newTitle) => {
        if (cyclicalWorkoutSplit[dayKey]) {
            cyclicalWorkoutSplit[dayKey].title = newTitle;
            renderManageWorkoutDialog();
        }
    };
    const handleAddExerciseToDay = () => {
        const dayKey = workoutDaySelect.value;
        const name = newExerciseNameInput.value.trim();
        const sets = newExerciseSetsInput.value.trim();
        const reps = newExerciseRepsInput.value.trim();
        if (!dayKey || !name || !sets || !reps) {
            showToast("Please fill all exercise fields.", "destructive");
            return;
        }
        cyclicalWorkoutSplit[dayKey].exercises.push({ name, sets, reps });
        newExerciseNameInput.value = '';
        newExerciseSetsInput.value = '';
        newExerciseRepsInput.value = '';
        showToast(`Exercise added to ${dayKey}.`);
        renderEditDayForm(dayKey);
    };
    const handleDeleteExerciseFromDay = (index) => {
        const dayKey = workoutDaySelect.value;
        const exerciseName = cyclicalWorkoutSplit[dayKey].exercises[index].name;
        cyclicalWorkoutSplit[dayKey].exercises.splice(index, 1);
        showToast(`"${exerciseName}" deleted.`);
        renderEditDayForm(dayKey);
    };

    // Manage Food Dialog
    const handleAddCustomFoodItem = () => {
        const newItem = newCustomFoodItemText.value.trim();
        if (!newItem) {
            showToast("Item name cannot be empty.", "destructive");
            return;
        }
        if (customFoodItems.map(i => i.toLowerCase()).includes(newItem.toLowerCase())) {
            showToast("This item already exists.", "destructive");
            return;
        }
        customFoodItems.push(newItem);
        newCustomFoodItemText.value = '';
        showToast(`"${newItem}" added.`);
        saveCustomFoodItems();
        renderManageFoodDialog();
        renderFoodLog();
    };
    const handleDeleteCustomFoodItem = (itemToDelete) => {
        customFoodItems = customFoodItems.filter(item => item !== itemToDelete);
        showToast(`"${itemToDelete}" removed.`);
        saveCustomFoodItems();
        renderManageFoodDialog();
        renderFoodLog();
    };
    
    // --- INITIALIZATION ---
    function renderAll() {
        renderWorkoutPlan();
        renderProteinTracker();
        renderFoodLog();
        renderCalendar();
    }
// --- INITIALIZATION ---
    function init() {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLETED_WORKOUTS);
            if (stored) completedWorkouts = JSON.parse(stored);
            cyclicalWorkoutSplit = JSON.parse(localStorage.getItem('gymCyclicalWorkoutSplit')) || { "Day 1": { title: "Push Day", exercises: [{ name: "Bench Press", sets: "3-4", reps: "8-12" }] }, "Day 2": { title: "Pull Day", exercises: [{ name: "Pull-ups", sets: "3-4", reps: "6-12" }] }, "Day 3": { title: "Leg Day", exercises: [{ name: "Squats", sets: "3-4", reps: "8-12" }] }, "Day 4 (Rest)": { title: "Rest", exercises: [] } };
            
             const storedConfig = localStorage.getItem('memoriaGymCycleConfig');
        if (storedConfig) {
            cycleConfig = JSON.parse(storedConfig);
            // This next line is CRITICAL. It turns the saved text back into a real Date object.
              if (cycleConfig.startDate) {
                cycleConfig.startDate = new Date(cycleConfig.startDate);
            }
        } else {
            cycleConfig = {}; // If nothing is stored, start with an empty config
        }
            
            
            // ... load other data from localStorage ...

           // Load Custom Food Items
        customFoodItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_GYM_FOODS)) || ["Protein Powder", "Creatine"];

        // Load the Protein Intake log
        const storedProtein = localStorage.getItem(LOCAL_STORAGE_KEY_GYM_PROTEIN);
        if (storedProtein) {
            proteinIntakes = JSON.parse(storedProtein).map(intake => ({
                ...intake,
                timestamp: new Date(intake.timestamp) // Convert date strings back to Date objects
            }));
        } else {
            proteinIntakes = [];
        }

        // Load the Logged Food items for the day
        const storedLoggedFood = localStorage.getItem(LOCAL_STORAGE_KEY_GYM_LOGGED_FOOD);
        if (storedLoggedFood) {
            loggedFoodItems = JSON.parse(storedLoggedFood).map(item => ({
                ...item,
                timestamp: new Date(item.timestamp) // Also convert these dates
            }));
        } else {
            loggedFoodItems = [];
        }

        } catch (e) { console.error("Error loading gym data from localStorage", e);
        proteinIntakes = [];
        loggedFoodItems = [];
         }
      // Add these new functions inside initializeGymTracker

const onOpenManageFoodDialog = () => {
    // 1. Refresh the content inside the dialog with the latest data.
    renderManageFoodDialog();
    // 2. Make the dialog visible.
    if (dialogOverlay) dialogOverlay.classList.remove('hidden');
    if (manageFoodDialog) manageFoodDialog.classList.remove('hidden');
};

const onCloseManageFoodDialog = () => {
    // 1. Hide the dialog.
    if (dialogOverlay) dialogOverlay.classList.add('hidden');
    if (manageFoodDialog) manageFoodDialog.classList.add('hidden');
    // 2. CRITICAL: Refresh the main page's food log to show the changes.
    renderFoodLog();
};
// Also add these inside initializeGymTracker

const onOpenWorkoutPlanDialog = () => {
    renderManageWorkoutDialog(); // Refresh dialog content
    if (dialogOverlay) dialogOverlay.classList.remove('hidden');
    if (workoutPlanDialog) workoutPlanDialog.classList.remove('hidden');
};

const onCloseWorkoutPlanDialog = () => {
    saveWorkoutSplit(); // Save any changes made
    if (dialogOverlay) dialogOverlay.classList.add('hidden');
    if (workoutPlanDialog) workoutPlanDialog.classList.add('hidden');
    renderAll(); // Refresh the main page
};

const onOpenCycleConfigDialog = () => {
    handleOpenCycleConfigDialog(); // This function already has the logic to refresh its content
    if (dialogOverlay) dialogOverlay.classList.add('hidden');
    if (cycleConfigDialog) cycleConfigDialog.classList.remove('hidden');
};

const onCloseCycleConfigDialog = () => {
    if (dialogOverlay) dialogOverlay.classList.add('hidden');
    if (cycleConfigDialog) cycleConfigDialog.classList.add('hidden');
};
    // ... define other handlers here if needed, like onOpenCycleConfig ...


    // --- 3. ATTACH EVENT LISTENERS ---
    // Now we connect the buttons to the functions we just defined.
    // We add safety checks to prevent errors if an element is null.
    
    if (openManageFoodDialogBtn) {openManageFoodDialogBtn.addEventListener('click', onOpenManageFoodDialog);
     }
  else {
        console.error("Could not find the 'Open Workout Plan' button to attach listener.");
    }
    if (closeWorkoutPlanDialogBtn) {
     closeManageFoodDialogBtn.addEventListener('click', onCloseManageFoodDialog);
     }
        // --- ATTACH ALL EVENT LISTENERS (with safety checks) ---
        if(logProteinBtn) logProteinBtn.addEventListener('click', handleLogProtein);
        if(proteinTargetInput) proteinTargetInput.addEventListener('change', (e) => { proteinTarget = e.target.value; renderProteinTracker(); });
        if(toggleWorkoutCompletionBtn) toggleWorkoutCompletionBtn.addEventListener('click', handleToggleWorkoutCompletion);
        if(calendarPrevBtn) calendarPrevBtn.addEventListener('click', () => { currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1); renderCalendar(); });
        if(calendarNextBtn) calendarNextBtn.addEventListener('click', () => { currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1); renderCalendar(); });
        if (openCycleConfigDialogBtn) openCycleConfigDialogBtn.addEventListener('click', onOpenCycleConfigDialog);
        if (cancelCycleConfigBtn) cancelCycleConfigBtn.addEventListener('click', onCloseCycleConfigDialog);
        if(saveCycleConfigBtn) saveCycleConfigBtn.addEventListener('click', handleSaveCycleConfig);
        if (openWorkoutPlanDialogBtn) openWorkoutPlanDialogBtn.addEventListener('click', onOpenWorkoutPlanDialog);
        if (closeWorkoutPlanDialogBtn) closeWorkoutPlanDialogBtn.addEventListener('click', onCloseWorkoutPlanDialog);
        if(addCycleDayBtn) addCycleDayBtn.addEventListener('click', handleAddCycleDay);
        if(workoutDaySelect) workoutDaySelect.addEventListener('change', (e) => renderEditDayForm(e.target.value));
        if(dayTitleInput) dayTitleInput.addEventListener('blur', (e) => handleWorkoutDayTitleChange(workoutDaySelect.value, e.target.value));
        if(addExerciseBtn) addExerciseBtn.addEventListener('click', handleAddExerciseToDay);
        if(openManageFoodDialogBtn) openManageFoodDialogBtn.addEventListener('click', () => { openDialog(manageFoodDialog); renderManageFoodDialog(); });
        if(closeManageFoodDialogBtn) closeManageFoodDialogBtn.addEventListener('click', () => closeDialog(manageFoodDialog));
        if(addCustomFoodItemBtn) addCustomFoodItemBtn.addEventListener('click', handleAddCustomFoodItem);

          if (addCycleDayBtn) addCycleDayBtn.addEventListener('click', handleAddCycleDay);
        // --- Hide loader and show content ---
        setTimeout(() => {
            if (loaderContainer) loaderContainer.style.display = 'none';
            if (gymMainContent) gymMainContent.classList.remove('hidden');
            renderAll();
           
        }, 10);
    }

    // Call the init function to start the page logic
    init();
}

/**
 * Initializes all functionality for the Password Vault page.
 */

function initializePasswordVaultPage() {
    console.log("Initializing Password Vault Page...");
    
        // --- STATE MANAGEMENT ---
    const initialSampleAccounts = [
      { id: "acc1", name: "Personal Savings", password: "genericbankpassword", lastUpdated: "2023-10-15", category: "Banking", accountNumber: "123456789012", ifscCode: "BANK0001234", upiPin: "123456", netbankingId: "persavingsNB", mpin:"1122", netbankingPassword: "nbSecurePassword1", transactionPassword: "txnPassSecure1" },
      { id: "acc2", name: "Gmail Account", username: "user@example.com", password: "securegmailpassword", lastUpdated: "2023-09-20", category: "Website", website: "https://mail.google.com" },
      { id: "acc3", name: "Social Media Profile X", username: "@socialuserX", password: "socialXpassword", lastUpdated: "2023-11-01", category: "Social Media" },
      { id: "acc4", name: "Salary Account", password: "anothergenericbankpassword", lastUpdated: "2023-11-05", category: "Banking", accountNumber: "987654321098", ifscCode: "SBIN0005678", upiPin: "654321", netbankingId: "salaryNB", mpin: "3344", netbankingPassword: "nbSecurePassword2", transactionPassword: "txnPassSecure2" },
      { id: "acc5", name: "Streaming Service", username: "subscriber@email.com", password: "streamingservicepass", lastUpdated: "2023-10-25", category: "Website", website: "https://netflix.com" },
    ];
    let accounts = [...initialSampleAccounts];
    let editingAccountId = null;
    const accountCategories = ["Banking", "Social Media", "Website", "Other"];
    
    // Use our new loader to get the Lucide script and wait for it.
    loadScript("https://unpkg.com/lucide@latest", () => {
        
        // --- ALL OF YOUR ORIGINAL PASSWORD VAULT CODE GOES INSIDE HERE ---
        
   
    
        // --- DOM ELEMENT SELECTION ---
    const loader = document.getElementById('loader');
    const vaultContent = document.getElementById('vault-content');
    const accountsListContainer = document.getElementById('accounts-list-container');
    const appContent = document.getElementById('app-content');
    
    // Add Form Elements
    const addAccountBtn = document.getElementById('addAccountBtn');
    const newAccountNameInput = document.getElementById('newAccountName');
    const newAccountCategorySelect = document.getElementById('newAccountCategory');
    const formSectionGeneric = document.getElementById('form-section-generic');
    const formSectionBanking = document.getElementById('form-section-banking');
    const newAccountUsernameInput = document.getElementById('newAccountUsername');
    const newAccountPasswordInput = document.getElementById('newAccountPassword');
    const newAccountWebsiteContainer = document.getElementById('form-website-url-container');
    const newAccountWebsiteInput = document.getElementById('newAccountWebsite');
    // Banking Form Inputs
    const newAccountAccountNumberInput = document.getElementById('newAccountAccountNumber');
    const newAccountIfscCodeInput = document.getElementById('newAccountIfscCode');
    const newAccountUpiPinInput = document.getElementById('newAccountUpiPin');
    const newAccountNetbankingIdInput = document.getElementById('newAccountNetbankingId');
    const newAccountMpinInput = document.getElementById('newAccountMpin');
    const newAccountNetbankingPasswordInput = document.getElementById('newAccountNetbankingPassword');
    const newAccountTransactionPasswordInput = document.getElementById('newAccountTransactionPassword');

        // --- All your other functions like renderAccounts, handleAddAccount etc. go here ---

      // --- UTILITY FUNCTIONS ---
     // --- Add these two new functions inside initializePasswordVaultPage ---

    const saveAccounts = () => {
    try {
        // Save the current 'accounts' array to localStorage
        localStorage.setItem('memoriaVaultAccounts', JSON.stringify(accounts));
         console.log("SUCCESS: Vault accounts saved.");
    } catch (e) {
        console.error("Failed to save accounts to localStorage", e);
    }
    };

    const loadAccounts = () => {
    try {
        const storedAccounts = localStorage.getItem('memoriaVaultAccounts');
        if (storedAccounts) {
            // If data exists, load it
            accounts = JSON.parse(storedAccounts);
        } else {
            // If no data exists, start with the sample data
            accounts = [...initialSampleAccounts]; 
        }
    } catch (e) {
        console.error("Failed to load or parse accounts from localStorage", e);
        accounts = [...initialSampleAccounts]; // On error, fall back to sample data
    }
    };
    

    // Toast Notification Function
    const showToast = (title, description, variant = 'default') => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${variant}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            ${description ? `<div class="toast-description">${description}</div>` : ''}
        `;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };
    
    // Toggle Password Visibility for any input
    const togglePasswordVisibility = (inputElement, buttonElement) => {
        const icon = buttonElement.querySelector('i');
        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            icon.outerHTML = '<i data-lucide="eye-off"></i>';
        } else {
            inputElement.type = 'password';
            icon.outerHTML = '<i data-lucide="eye"></i>';
        }
        lucide.createIcons();
    };


    // --- RENDER FUNCTION ---
   // This is the corrected renderAccounts function.

const renderAccounts = () => {
    // Safety check for the main container
    if (!accountsListContainer) {
        console.error("Vault Error: Cannot find 'accounts-list-container'");
        return; 
    }
    accountsListContainer.innerHTML = ''; 

    if (accounts.length === 0) {
        accountsListContainer.innerHTML = '<p class="empty-state">Your vault is empty.</p>';
        return;
    }
    
    // Group accounts by category (your logic here is good)
    const groupedAccounts = accounts.reduce((acc, account) => {
        const category = account.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(account);
        return acc;
    }, {});
    
    const sortedCategories = Object.keys(groupedAccounts).sort();

    // Loop through each category NAME
    sortedCategories.forEach(category => {
        // Create the container for the entire section (Heading + Grid)
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';

        // Create the heading element
        const categoryHeading = document.createElement('h2');
        categoryHeading.className = 'category-heading';
        categoryHeading.textContent = category;

        // Create the grid container for the cards
        const accountsGrid = document.createElement('div');
        accountsGrid.className = 'accounts-grid'; // Use the class your CSS targets

        // Loop through each ACCOUNT OBJECT in the current category
        groupedAccounts[category].forEach(account => {
            // Your 'createAccountCard' logic is complex, so let's call it here.
            // We assume it's defined elsewhere in your function.
            const card = createAccountCard(account); // This creates the card div
            accountsGrid.appendChild(card); // Append the card to ITS grid
        });

        // *** THE CRITICAL FIX IS HERE ***
        // Append the heading and the grid to the section container
        categorySection.appendChild(categoryHeading);
        categorySection.appendChild(accountsGrid);

        // Append the entire completed section to the main page container
        accountsListContainer.appendChild(categorySection);
    });
    
    // Refresh the icons after all HTML has been added
    lucide.createIcons();
};

// You need a separate 'createAccountCard' function.
// Let's create it from your existing render logic.
const createAccountCard = (account) => {
    const card = document.createElement('div');
    card.className = 'card display-card';
    card.dataset.accountId = account.id;

    const getIcon = (cat) => {
        switch(cat) {
            case 'Banking': return '<i data-lucide="landmark"></i>';
            case 'Website': return '<i data-lucide="globe"></i>';
            case 'Social Media': return '<i data-lucide="users"></i>';
            default: return '<i data-lucide="shield-question"></i>';
        }
    }
    
    const renderSensitiveInput = (fieldName, fieldValue) => `
        <div class="sensitive-input-wrapper">
            <input type="password" class="input" value="••••••••••" readonly data-field-name="${fieldName}">
            <button class="button ghost" data-action="toggle-visibility" data-field="${fieldName}"><i data-lucide="eye"></i></button>
            <button class="button ghost" data-action="copy" data-field="${fieldName}" data-value="${fieldValue || ''}"><i data-lucide="copy"></i></button>
        </div>`;

    card.innerHTML = `
        <div class="card-header">
            <div>
                <h3 class="card-title">${getIcon(account.category)} ${account.name}</h3>
                ${account.category !== 'Banking' && account.username ? `<p class="card-description">Username: ${account.username}</p>` : ''}
                ${account.website ? `<p class="card-description">Website: <a href="${account.website}" target="_blank" rel="noopener noreferrer">${account.website}</a></p>` : ''}
                <p class="card-description">Last Updated: ${account.lastUpdated}</p>
            </div>
        </div>
        <div class="card-content display-card-content">
            ${account.category === 'Banking' ? `
                ${account.accountNumber ? `<p><strong>Acc No:</strong> ${account.accountNumber}</p>` : ''}
                ${account.ifscCode ? `<p><strong>IFSC:</strong> ${account.ifscCode}</p>` : ''}
                ${account.upiPin ? `<div><strong>UPI PIN:</strong>${renderSensitiveInput('upiPin', account.upiPin)}</div>` : ''}
                ${account.netbankingId ? `<p><strong>Netbanking ID:</strong> ${account.netbankingId}</p>` : ''}
                ${account.mpin ? `<div><strong>MPIN:</strong>${renderSensitiveInput('mpin', account.mpin)}</div>` : ''}
                ${account.netbankingPassword ? `<div><strong>NB Password:</strong>${renderSensitiveInput('netbankingPassword', account.netbankingPassword)}</div>` : ''}
                ${account.transactionPassword ? `<div><strong>Txn Password:</strong>${renderSensitiveInput('transactionPassword', account.transactionPassword)}</div>` : ''}
            ` : `
                ${account.password ? `<div><strong>Password:</strong>${renderSensitiveInput('password', account.password)}</div>` : ''}
            `}
        </div>
        <div class="card-footer">
            <button class="button outline" data-action="edit"><i data-lucide="edit"></i> Edit</button>
            <button class="button destructive" data-action="delete"><i data-lucide="trash-2"></i> Delete</button>
        </div>
    `;
    return card;
};

    // --- EVENT HANDLERS ---
    
    // Handle Adding a New Account
    // =================================================================
        //  REPLACE your old handleAddAccount function with this ENTIRE block
        // =================================================================

    const handleSaveAccount = () => {
    // --- 1. Get all values from the form inputs ---
    const name = newAccountNameInput.value.trim();
    const category = newAccountCategorySelect.value;
    const username = newAccountUsernameInput.value.trim();
    const password = newAccountPasswordInput.value;
    const website = newAccountWebsiteInput.value.trim();
    const accountNumber = newAccountAccountNumberInput.value.trim();
    const ifscCode = newAccountIfscCodeInput.value.trim();
    const upiPin = newAccountUpiPinInput.value;
    const netbankingId = newAccountNetbankingIdInput.value.trim();
    const mpin = newAccountMpinInput.value;
    const netbankingPassword = newAccountNetbankingPasswordInput.value;
    const transactionPassword = newAccountTransactionPasswordInput.value;

    // --- 2. Validate the required fields ---
    if (!name) {
        showToast("Missing Field", "Account Name is required.", "destructive");
        return;
    }

    // --- 3. Check if we are in EDIT mode or ADD mode ---
    if (editingAccountId) {
        // --- UPDATE LOGIC ---
        const accountIndex = accounts.findIndex(acc => acc.id === editingAccountId);
        if (accountIndex > -1) {
            // Get the existing account to update it
            const accountToUpdate = accounts[accountIndex];

            // Update all common properties
            accountToUpdate.name = name;
            accountToUpdate.category = category;
            accountToUpdate.lastUpdated = new Date().toISOString().split('T')[0];

            // Update properties based on the selected category
            if (category === 'Banking') {
                accountToUpdate.accountNumber = accountNumber;
                accountToUpdate.ifscCode = ifscCode;
                accountToUpdate.upiPin = upiPin;
                accountToUpdate.netbankingId = netbankingId;
                accountToUpdate.mpin = mpin;
                accountToUpdate.netbankingPassword = netbankingPassword;
                accountToUpdate.transactionPassword = transactionPassword;
            } else {
                accountToUpdate.username = username;
                accountToUpdate.password = password;
                if (category === 'Website') {
                    accountToUpdate.website = website;
                }
            }
            
            showToast("Account Updated", `"${name}" has been updated.`);
        }
    } else {
        // --- ADD LOGIC (Your original logic) ---
        const newAccount = {
            id: `acc-${Date.now()}`,
            name: name,
            lastUpdated: new Date().toISOString().split('T')[0],
            category: category,
        };
        
        if (category === 'Banking') {
            Object.assign(newAccount, { accountNumber, ifscCode, upiPin, netbankingId, mpin, netbankingPassword, transactionPassword });
        } else {
            Object.assign(newAccount, { username, password });
            if (category === 'Website') {
                newAccount.website = website;
            }
        }
        accounts.push(newAccount);
        showToast("Account Added", `"${name}" has been added to your vault.`);
    }

    // --- 4. CLEANUP (This runs for both modes) ---
    
    // Reset the editing state
    editingAccountId = null;
    
    // Save the updated 'accounts' array to localStorage
    saveAccounts();
    
    // Re-draw all the account cards on the screen
    renderAccounts();

    // Reset the form fields to be empty
    newAccountNameInput.value = '';
    newAccountCategorySelect.value = 'Website';
    newAccountUsernameInput.value = '';
    newAccountPasswordInput.value = '';
    newAccountWebsiteInput.value = '';
    newAccountAccountNumberInput.value = '';
    newAccountIfscCodeInput.value = '';
    newAccountUpiPinInput.value = '';
    newAccountNetbankingIdInput.value = '';
    newAccountMpinInput.value = '';
    newAccountNetbankingPasswordInput.value = '';
    newAccountTransactionPasswordInput.value = '';
    
    // Reset the button text back to "Add Credential"
    addAccountBtn.innerHTML = '<i data-lucide="plus-square"></i> Add Credential';
    lucide.createIcons();
    
    // Trigger a change to make sure the correct form section is visible
    newAccountCategorySelect.dispatchEvent(new Event('change'));
    };

    // Handle Category Change in the Form
    newAccountCategorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'Banking') {
            formSectionGeneric.classList.add('hidden');
            formSectionBanking.classList.remove('hidden');
        } else {
            formSectionGeneric.classList.remove('hidden');
            formSectionBanking.classList.add('hidden');
        }

        if (category === 'Website') {
            newAccountWebsiteContainer.classList.remove('hidden');
        } else {
            newAccountWebsiteContainer.classList.add('hidden');
        }
    });
    
    // Handle Clicks within the "Add Credential" form (for toggling password visibility)
    appContent.addEventListener('click', (e) => {
        const toggleButton = e.target.closest('button[data-toggle-password]');
        if (toggleButton) {
            const inputId = toggleButton.dataset.togglePassword;
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                togglePasswordVisibility(inputElement, toggleButton);
            }
        }
    });


    // Event Delegation for all actions on displayed account cards
    accountsListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const card = button.closest('.card.display-card');
        const accountId = card.dataset.accountId;
        const action = button.dataset.action;
        const account = accounts.find(acc => acc.id === accountId);

        switch (action) {
            case 'delete':
                if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
            
                accounts = accounts.filter(acc => acc.id !== accountId);
                saveAccounts();
                renderAccounts();
                showToast("Account Deleted", `${account.name} removed from vault.`);
                }
                      break;
            // This is the corrected code
            case 'edit':
                openEditForm(accountId); // This calls the function to open the editor
                break;
            case 'copy':
                const textToCopy = button.dataset.value;
                const fieldDescription = button.dataset.field;
                if (!textToCopy) {
                    showToast("Nothing to Copy", `${fieldDescription} is empty.`, "destructive");
                    return;
                }
                navigator.clipboard.writeText(textToCopy);
                showToast(`${fieldDescription} Copied!`, `${fieldDescription} copied to clipboard.`);
                break;
            case 'toggle-visibility':
                const fieldName = button.dataset.field;
                const input = card.querySelector(`input[data-field-name="${fieldName}"]`);
                const icon = button.querySelector('i');
                const isVisible = input.type === 'text';

                if (isVisible) {
                    input.type = 'password';
                    input.value = '••••••••••';
                    icon.outerHTML = '<i data-lucide="eye"></i>';
                } else {
                    input.type = 'text';
                    input.value = account[fieldName] || '';
                    icon.outerHTML = '<i data-lucide="eye-off"></i>';
                }
                lucide.createIcons();
                break;
        }
    });

    // Add this new function inside initializePasswordVaultPage

    const openEditForm = (accountId) => {
    
    console.log("Attempting to open edit form for account ID:", accountId);
    const accountToEdit = accounts.find(acc => acc.id === accountId);
    
    if (!accountToEdit) {
        console.error("Could not find account to edit with ID:", accountId);
        return;
    }

    // Set the state to remember which account we are editing
    editingAccountId = accountId;

    // --- Pre-fill the form fields ---
    newAccountNameInput.value = accountToEdit.name;
    newAccountCategorySelect.value = accountToEdit.category;
    
    // IMPORTANT: Trigger a 'change' event so the correct form section (Banking/Generic) appears
    newAccountCategorySelect.dispatchEvent(new Event('change'));

    // Fill the specific fields based on category
    if (accountToEdit.category === 'Banking') {
        newAccountAccountNumberInput.value = accountToEdit.accountNumber || '';
        newAccountIfscCodeInput.value = accountToEdit.ifscCode || '';
        newAccountUpiPinInput.value = accountToEdit.upiPin || '';
        newAccountNetbankingIdInput.value = accountToEdit.netbankingId || '';
        newAccountMpinInput.value = accountToEdit.mpin || '';
        newAccountNetbankingPasswordInput.value = accountToEdit.netbankingPassword || '';
        newAccountTransactionPasswordInput.value = accountToEdit.transactionPassword || '';
    } else {
        newAccountUsernameInput.value = accountToEdit.username || '';
        newAccountPasswordInput.value = accountToEdit.password || '';
        if (accountToEdit.category === 'Website') {
            newAccountWebsiteInput.value = accountToEdit.website || '';
        }
    }
    
    // --- Update the UI ---
        console.log("Is the addAccountBtn element found?", addAccountBtn);

    addAccountBtn.innerHTML = '<i data-lucide="save"></i> Save Changes';
    lucide.createIcons();
    addAccountBtn.scrollIntoView({ behavior: 'smooth' }); // Scroll to the form
    };

   
        // ... (The code for these functions does not need to change) ...

        // --- INITIALIZATION ---
        function initializeApp() {

            loadAccounts(); 

            setTimeout(() => {
                if(loader) loader.classList.add('hidden');
                if(vaultContent) vaultContent.classList.remove('hidden');
                if(typeof renderAccounts === 'function') renderAccounts();
                if(addAccountBtn) addAccountBtn.addEventListener('click', handleSaveAccount);
                if(newAccountCategorySelect) newAccountCategorySelect.dispatchEvent(new Event('change'));
            }, 750);
        }

        initializeApp();
    });
}

/**
 * Initializes all functionality for the Secure Notes page.
 */
function initializeSecureNotePage() {
    console.log("Initializing Secure Notes Page...");

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


    // The entire content of your `o6script.js` would go here.
    // Also, you will need to add the lucide script dynamically if needed.
    const lucideScript = document.createElement('script');
    lucideScript.src = "https://unpkg.com/lucide@latest";
    lucideScript.onload = () => {
        lucide.createIcons();
    };
    document.body.appendChild(lucideScript);
}

/**
 * =================================================================
 *  INITIALIZE: IDEA CAPTURE & HUB PAGE
 * =================================================================
 * All the code for the Idea Capture feature is contained here.
 */
function initializeIdeaCapturePage() {
    console.log("Initializing Idea Capture & Hub Page...");

    // --- 1. CONSTANTS & STATE VARIABLES ---
    const LOCAL_STORAGE_KEYS = {
        ideas: 'ideaHubApp_ideas',
        implemented: 'ideaHubApp_implementedIdeas'
    };
    let ideas = [];
    let implementedIdeas = [];
    let editingIdeaId = null;

    // --- 2. DOM ELEMENT REFERENCES ---
    const ideasGrid = document.getElementById("ideas-grid");
    const implementedIdeasGrid = document.getElementById("implemented-ideas-grid");
    const newIdeaTitleInput = document.getElementById("new-idea-title");
    const newIdeaDetailsInput = document.getElementById("new-idea-details");
    const newIdeaTagsInput = document.getElementById("new-idea-tags");
    const saveIdeaBtn = document.getElementById("save-idea-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const hubEmptyState = document.getElementById("hub-empty-state");
    const ideasEmptyState = document.getElementById("ideas-empty-state");
    const formCard = document.getElementById("idea-form-card");
    const formTitle = document.getElementById("form-title");

    // --- 3. HELPER FUNCTIONS ---
    const refreshIcons = () => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    };

    const saveState = () => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ideas, JSON.stringify(ideas));
            localStorage.setItem(LOCAL_STORAGE_KEYS.implemented, JSON.stringify(implementedIdeas));
            console.log("State saved to localStorage.");
        } catch (e) {
            console.error("Failed to save state to localStorage:", e);
        }
    };

    const loadState = () => {
        // [THE FIX IS HERE] Make sure these variables are always declared at the top of the function.
        const storedIdeasJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.ideas);
        const storedImplementedJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.implemented);
        
        const initialSampleIdeas = [
            { id: `idea-${Date.now() + 1}`, title: "New Mobile App for Local Artists", status: "New", details: "An app to connect local artists with buyers and event organizers.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), tags: ["app", "community", "art"] },
            { id: `idea-${Date.now() + 2}`, title: "AI-Powered Recipe Generator", status: "Exploring", details: "Generates recipes based on available ingredients and dietary preferences.", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), tags: ["ai", "food", "tech"] },
        ];

        if (storedIdeasJSON === null) {
            ideas = initialSampleIdeas;
        } else {
            try {
                ideas = JSON.parse(storedIdeasJSON);
            } catch (e) {
                console.error("Could not parse 'ideas' from localStorage. Resetting to sample data.", e);
                ideas = initialSampleIdeas;
            }
        }
        if (storedImplementedJSON === null) {
            implementedIdeas = [];
        } else {
            try {
                implementedIdeas = JSON.parse(storedImplementedJSON);
            } catch (e) {
                console.error("Could not parse 'implementedIdeas' from localStorage. Resetting to empty.", e);
                implementedIdeas = [];
            }
        }
    };

    const formatDate = (isoString) => new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    const getStatusBadgeClass = (status) => ({ "New": "badge-default", "Exploring": "badge-secondary", "In Hub": "badge-outline" })[status] || "badge-default";
    
    const showToast = (title, description, variant = 'default') => {
        const container = document.getElementById('toast-container');
        if (!container) return; // Add safety check
        const toast = document.createElement('div');
        toast.className = `toast ${variant}`;
        toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-description">${description}</div>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 4000);
    };

    // --- 4. CORE LOGIC (RENDERING & ACTIONS) ---
  const createIdeaCardHTML = (idea, isInHub = false) => {
    const tagsHTML = (idea.tags && idea.tags.length > 0) ? `<div class="tags-container">${idea.tags.map(tag => `<span class="badge badge-secondary">${tag}</span>`).join('')}</div>` : '';

    // This is the logic we are fixing.
    // If the card is NOT in the hub, it creates the "Move to Hub" button.
    // If the card IS in the hub, it will now create nothing, removing the "Develop" button.
    const hubButton = !isInHub
        ? `<button class="button button-outline" data-action="move-to-hub" data-id="${idea.id}"><i data-lucide="send" class="button-icon"></i> Move to Hub</button>`
        : ''; // When in the hub, this is now an empty string, removing the button.

    return `
        <div class="card idea-card" id="idea-${idea.id}">
            <div class="card-header">
                <div class="card-header-flex">
                    <h3 class="card-title">${idea.title}</h3>
                    <span class="badge ${getStatusBadgeClass(idea.status)}">${idea.status}</span>
                </div>
                <div class="card-description">
                    <p>Updated: ${formatDate(idea.updatedAt)}</p>
                </div>
            </div>
            <div class="card-content">
                <p class="idea-details">${idea.details || "No details provided."}</p>
                ${tagsHTML}
            </div>
            <div class="card-footer">
                <button class="button" data-action="edit" data-id="${idea.id}"><i data-lucide="edit-2" class="button-icon"></i> Edit</button>
                ${hubButton}
                <button class="button button-destructive" data-action="delete" data-id="${idea.id}"><i data-lucide="trash-2" class="button-icon"></i> Delete</button>
            </div>
        </div>`;
};

    const renderAllLists = () => {
        if (!ideasGrid) return; // Safety check
        const sortedIdeas = [...ideas].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const sortedImplemented = [...implementedIdeas].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        ideasGrid.innerHTML = sortedIdeas.map(idea => createIdeaCardHTML(idea, false)).join('');
        implementedIdeasGrid.innerHTML = sortedImplemented.map(idea => createIdeaCardHTML(idea, true)).join('');
        ideasEmptyState.style.display = ideas.length === 0 ? 'block' : 'none';
        hubEmptyState.style.display = implementedIdeas.length === 0 ? 'block' : 'none';
        lucide.createIcons();
    };

    const resetForm = () => {
        editingIdeaId = null;
        newIdeaTitleInput.value = ""; newIdeaDetailsInput.value = ""; newIdeaTagsInput.value = "";
        formTitle.textContent = "Capture a New Idea";
        saveIdeaBtn.querySelector('span').textContent = "Save Idea";
        saveIdeaBtn.querySelector('i').setAttribute('data-lucide', 'plus-square');
        cancelEditBtn.style.display = 'none'; saveIdeaBtn.style.flexGrow = '1';
        formCard.classList.remove('editing');
        refreshIcons();
    };

    const handleSaveOrUpdateIdea = () => {
        if (!newIdeaTitleInput) return; // Safety check
        const title = newIdeaTitleInput.value.trim();
        if (!title) { showToast("Title Missing", "Please provide a title for your idea.", "destructive"); return; }
        const now = new Date().toISOString();
        const tags = newIdeaTagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean);
        const details = newIdeaDetailsInput.value.trim();
        if (editingIdeaId) {
            let ideaToUpdate = ideas.find(i => i.id === editingIdeaId) || implementedIdeas.find(i => i.id === editingIdeaId);
            if (ideaToUpdate) {
                ideaToUpdate.title = title; ideaToUpdate.details = details;
                ideaToUpdate.tags = tags.length > 0 ? tags : undefined;
                ideaToUpdate.updatedAt = now;
                showToast("Idea Updated!", `"${title}" has been successfully updated.`);
            }
        } else {
            const newIdea = { id: `idea-${Date.now()}`, title, details, tags: tags.length > 0 ? tags : undefined, status: "New", createdAt: now, updatedAt: now };
            ideas.push(newIdea);
            showToast("Idea Saved!", `"${title}" has been captured.`);
        }
        resetForm(); saveState(); renderAllLists();
    };

    const handleStartEditing = (ideaId) => {
        const ideaToEdit = ideas.find(i => i.id === ideaId) || implementedIdeas.find(i => i.id === ideaId);
        if (!ideaToEdit || !formCard) return;
        editingIdeaId = ideaId;
        newIdeaTitleInput.value = ideaToEdit.title; newIdeaDetailsInput.value = ideaToEdit.details;
        newIdeaTagsInput.value = (ideaToEdit.tags || []).join(', ');
        formTitle.textContent = "Editing Idea";
        saveIdeaBtn.querySelector('span').textContent = "Update Idea";
        saveIdeaBtn.querySelector('i').setAttribute('data-lucide', 'check-circle');
        cancelEditBtn.style.display = 'flex'; saveIdeaBtn.style.flexGrow = '0';
        formCard.classList.add('editing');
        refreshIcons();
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleMoveToHub = (ideaId) => {
        const ideaIndex = ideas.findIndex(i => i.id === ideaId);
        if (ideaIndex === -1) return;
        const [ideaToMove] = ideas.splice(ideaIndex, 1);
        ideaToMove.status = "In Hub"; ideaToMove.updatedAt = new Date().toISOString();
        implementedIdeas.push(ideaToMove);
        showToast("Idea Moved", `"${ideaToMove.title}" is now in the Implementation Hub.`);
        saveState(); renderAllLists();
    };

    const handleDeleteIdea = (ideaId) => {
        let ideaTitle = '';
        const ideaIndex = ideas.findIndex(i => i.id === ideaId);
        if (ideaIndex !== -1) {
            ideaTitle = ideas[ideaIndex].title; ideas.splice(ideaIndex, 1);
        } else {
            const implementedIndex = implementedIdeas.findIndex(i => i.id === ideaId);
            if (implementedIndex !== -1) {
                ideaTitle = implementedIdeas[implementedIndex].title; implementedIdeas.splice(implementedIndex, 1);
            }
        }
        if (ideaTitle) {
            showToast("Idea Deleted", `"${ideaTitle}" has been removed.`, "destructive");
            saveState(); renderAllLists();
        }
    };

    // --- 5. EVENT LISTENERS ---
    if(saveIdeaBtn) saveIdeaBtn.addEventListener("click", handleSaveOrUpdateIdea);
    if(cancelEditBtn) cancelEditBtn.addEventListener("click", resetForm);
    
    // This listener is safe because it's on a static parent element
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const { action, id } = button.dataset;
            if (!action || !id) return;
            switch (action) {
                case 'edit': handleStartEditing(id); break;
                case 'delete': if (confirm("Are you sure you want to delete this idea? This cannot be undone.")) { handleDeleteIdea(id); } break;
                case 'move-to-hub': handleMoveToHub(id); break;
            }
            lucide.createIcons();
        });
    }

    // --- 6. INITIALIZATION ---
    loadState();
    renderAllLists();
    refreshIcons();
}
