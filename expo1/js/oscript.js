document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const scheduleItems = [
        { time: "10:00 - 11:30", title: "Modern Literature Seminar", tag: "College" },
        { time: "12:00 - 13:00", title: "Lunch with Friends", tag: "Social" },
        { time: "14:00 - 16:00", title: "Project Work: Team Meeting", tag: "Project" },
        { time: "16:30 - 17:30", title: "Coding Club Meetup", tag: "Club" }
    ];

    const todoItems = [
        { id: "task1", text: "Review dashboard design", priority: "high", completed: false },
        { id: "task2", text: "Call team for update", priority: "medium", completed: true }
    ];

    const financialData = {
        todayExpenses: -4.50,
        netBalance: 2890.50,
        budgetUsed: 59.50,
        budgetTotal: 2000.00
    };

    // --- DOM ELEMENTS ---
    const planTitle = document.getElementById('plan-title');
    const planListContainer = document.getElementById('plan-list-container');
    const todayExpensesEl = document.getElementById('today-expenses');
    const netBalanceEl = document.getElementById('net-balance');
    const budgetUsageTextEl = document.getElementById('budget-usage-text');
    const budgetProgressBar = document.getElementById('budget-progress-bar');
    const todoListContainer = document.getElementById('todo-list-container');


    // --- RENDER FUNCTIONS ---

    function renderGreeting() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const dayName = days[today.getDay()];
        planTitle.textContent = `Hi Punith, here's your plan for ${dayName}!`;
    }

    function renderPlan() {
        planListContainer.innerHTML = ''; // Clear existing items
        scheduleItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'plan-item';
            li.innerHTML = `
                <span class="time">${item.time}:</span>
                <span>${item.title}</span>
                ${item.tag ? `<span class="plan-tag">${item.tag}</span>` : ''}
            `;
            planListContainer.appendChild(li);
        });
    }

    function renderFinancials() {
        todayExpensesEl.textContent = financialData.todayExpenses.toFixed(2);
        netBalanceEl.textContent = financialData.netBalance.toFixed(2);
        budgetUsageTextEl.textContent = `${financialData.budgetUsed.toFixed(2)} / ${financialData.budgetTotal.toFixed(2)}`;

        const budgetProgress = (financialData.budgetUsed / financialData.budgetTotal) * 100;
        budgetProgressBar.style.width = `${Math.min(100, budgetProgress)}%`;
    }

    function renderTodoList() {
        todoListContainer.innerHTML = ''; // Clear existing items
        todoItems.forEach(task => {
            const div = document.createElement('div');
            div.className = 'todo-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = task.id;
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                renderTodoList(); // Re-render to apply strikethrough style
            });

            const label = document.createElement('label');
            label.htmlFor = task.id;
            label.textContent = task.text;

            const badge = document.createElement('span');
            badge.className = `priority-badge ${task.priority}`;
            badge.textContent = task.priority;

            if (task.completed) {
                label.style.textDecoration = 'line-through';
                label.style.color = '#8a8d91';
            }

            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(badge);
            todoListContainer.appendChild(div);
        });
    }

    // --- INITIALIZATION ---
    function initializeDashboard() {
        renderGreeting();
        renderPlan();
        renderFinancials();
        renderTodoList();
    }

    initializeDashboard();
});