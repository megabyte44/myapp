// --- NATIVE JAVASCRIPT DATE HELPERS (Replaces date-fns) ---
// This object provides a set of utility functions for date manipulation,
// designed to mimic some functionalities of the date-fns library using native Date objects.
const NativeDateHelpers = {
    /**
     * Resets the time part of a date to the beginning of the day (00:00:00.000).
     * @param {Date} date - The date to modify.
     * @returns {Date} A new Date object set to the start of the day.
     */
    startOfDay: date => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; },
    /**
     * Resets the date to the beginning of the month (first day, 00:00:00.000).
     * @param {Date} date - The date to modify.
     * @returns {Date} A new Date object set to the start of the month.
     */
    startOfMonth: date => { const d = new Date(date); d.setDate(1); return NativeDateHelpers.startOfDay(d); },
    /**
     * Sets the date to the end of the month (last day, 23:59:59.999).
     * @param {Date} date - The date to modify.
     * @returns {Date} A new Date object set to the end of the month.
     */
    endOfMonth: date => { const d = new Date(date); d.setMonth(d.getMonth() + 1, 0); d.setHours(23, 59, 59, 999); return d; },
    /**
     * Adds a specified number of months to a date.
     * @param {Date} date - The starting date.
     * @param {number} amount - The number of months to add.
     * @returns {Date} A new Date object with the months added.
     */
    addMonths: (date, amount) => { const d = new Date(date); d.setMonth(d.getMonth() + amount); return d; },
    /**
     * Subtracts a specified number of months from a date.
     * @param {Date} date - The starting date.
     * @param {number} amount - The number of months to subtract.
     * @returns {Date} A new Date object with the months subtracted.
     */
    subMonths: (date, amount) => { const d = new Date(date); d.setMonth(d.getMonth() - amount); return d; },
    /**
     * Calculates the difference in days between two dates.
     * @param {Date} dateLeft - The first date.
     * @param {Date} dateRight - The second date.
     * @returns {number} The difference in days.
     */
    differenceInDays: (dateLeft, dateRight) => {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const startLeft = NativeDateHelpers.startOfDay(dateLeft).getTime();
        const startRight = NativeDateHelpers.startOfDay(dateRight).getTime();
        return Math.round((startLeft - startRight) / MS_PER_DAY);
    },
    /**
     * Generates an array of dates for each day within a given interval.
     * @param {object} interval - An object with `start` and `end` Date properties.
     * @returns {Date[]} An array of Date objects.
     */
    eachDayOfInterval: interval => {
        const days = []; let currentDate = NativeDateHelpers.startOfDay(interval.start);
        const endDate = NativeDateHelpers.startOfDay(interval.end);
        while (currentDate <= endDate) { days.push(new Date(currentDate)); currentDate.setDate(currentDate.getDate() + 1); }
        return days;
    },
    /**
     * Formats a date into a string based on a specified format string.
     * Supports 'yyyy-MM-dd', 'eeee, MMM d', and 'MMMMítése'.
     * @param {Date} date - The date to format.
     * @param {string} formatStr - The format string.
     * @returns {string} The formatted date string.
     */
    format: (date, formatStr) => {
        const d = new Date(date);
        if (formatStr === 'yyyy-MM-dd') return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (formatStr === 'eeee, MMM d') return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(d);
        if (formatStr === 'MMMMítése') return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
        return d.toLocaleDateString(); // Fallback for unsupported formats
    }
};

// Destructure common functions for easier access
const { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, addMonths, subMonths } = NativeDateHelpers;

// --- STATE MANAGEMENT ---
// Global state object to manage application data.
// This data will be persisted to local storage.
let state = {
    proteinIntakes: [], // Array to store daily protein intake logs (filtered for current day on load)
    loggedFoodItems: [], // Array to store daily logged food items (filtered for current day on load)
    proteinTarget: 150, // User's daily protein target in grams
    customFoodItems: ["Protein Powder", "Creatine", "Oatmeal", "Eggs", "Chicken Breast", "Greek Yogurt"], // Customizable list of quick-log food items
    cyclicalWorkoutSplit: { // Defines the workout routine across multiple days
        "Day 1": { title: "Push Day (Chest, Shoulders, Triceps)", exercises: [{ name: "Bench Press", sets: "3-4", reps: "8-12" }, { name: "Overhead Press", sets: "3", reps: "8-12" }] },
        "Day 2": { title: "Pull Day (Back, Biceps)", exercises: [{ name: "Pull-ups/Lat Pulldowns", sets: "3-4", reps: "6-12" }, { name: "Bent-over Rows", sets: "3", reps: "8-12" }] },
        "Day 3": { title: "Leg Day (Quads, Hamstrings, Calves)", exercises: [{ name: "Squats", sets: "3-4", reps: "8-12" }, { name: "Romanian Deadlifts", sets: "3", reps: "10-12" }] },
        "Day 4 (Rest)": { title: "Rest or Active Recovery", exercises: [] },
    },
    cycleConfig: { // Configuration for the workout cycle (start date and starting day key)
        startDate: startOfDay(new Date()),
        startDayKey: "Day 1",
    },
    completedWorkouts: {}, // Stores completion status for workouts, e.g., { "YYYY-MM-DD": true/false }
    currentDisplayMonth: startOfMonth(new Date()), // The month currently displayed in the calendar
    // UI State for dialogs (moved from React/TSX)
    selectedCycleDayKeyForEdit: null, // The key of the workout day being edited in the dialog
};

// --- LOCAL STORAGE ---
// Prefix for local storage keys to prevent conflicts with other applications.
const LOCAL_STORAGE_KEY_PREFIX = 'memoriaAppGymTracker_';
// Keys for state properties that need to be saved directly (not daily logs)
const stateKeysToSave = ['proteinTarget', 'customFoodItems', 'cyclicalWorkoutSplit', 'cycleConfig', 'completedWorkouts'];

/**
 * Loads application state from local storage.
 * Parses JSON strings back into JavaScript objects and Date objects.
 */
function loadStateFromLocalStorage() {
    stateKeysToSave.forEach(key => {
        const storedValue = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`);
        if (storedValue) {
            const parsed = JSON.parse(storedValue);
            // Special handling for Date objects within cycleConfig
            if (key === 'cycleConfig') {
                state.cycleConfig = { ...parsed, startDate: parsed.startDate ? new Date(parsed.startDate) : startOfDay(new Date()) };
            } else {
                state[key] = parsed;
            }
        }
    });

    // Initialize selected day for editing after loading workout split
    const workoutKeys = Object.keys(state.cyclicalWorkoutSplit);
    state.selectedCycleDayKeyForEdit = workoutKeys.length > 0 ? workoutKeys[0] : null;

    // Load protein and food logs for the current day only (full logs are stored, but state only holds today's)
    const todayKey = format(new Date(), "yyyy-MM-dd");
    ['proteinLog', 'foodLog'].forEach(logKey => {
        const storedLog = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${logKey}`);
        if (storedLog) {
            const targetStateKey = logKey === 'proteinLog' ? 'proteinIntakes' : 'loggedFoodItems';
            state[targetStateKey] = JSON.parse(storedLog)
                .map(item => ({...item, timestamp: new Date(item.timestamp)})) // Convert timestamp strings back to Date objects
                .filter(item => format(item.timestamp, "yyyy-MM-dd") === todayKey); // Filter for today's entries
        }
    });
}

/**
 * Saves core application state to local storage.
 */
function saveStateToLocalStorage() {
    stateKeysToSave.forEach(key => {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${key}`, JSON.stringify(state[key]));
    });
}

/**
 * Saves a single log item (protein or food) to its respective full log in local storage.
 * @param {string} logKey - The local storage key for the log (e.g., 'proteinLog', 'foodLog').
 * @param {object} itemToAdd - The item object to add to the log.
 */
function saveLogToLocalStorage(logKey, itemToAdd) {
    const fullLogKey = `${LOCAL_STORAGE_KEY_PREFIX}${logKey}`;
    const allLogs = JSON.parse(localStorage.getItem(fullLogKey) || '[]');
    allLogs.push(itemToAdd);
    localStorage.setItem(fullLogKey, JSON.stringify(allLogs));
}

/**
 * Deletes a single log item from its respective full log in local storage.
 * @param {string} logKey - The local storage key for the log (e.g., 'proteinLog', 'foodLog').
 * @param {string} id - The ID of the item to delete.
 */
function deleteFromLogLocalStorage(logKey, id) {
    const fullLogKey = `${LOCAL_STORAGE_KEY_PREFIX}${logKey}`;
    let allLogs = JSON.parse(localStorage.getItem(fullLogKey) || '[]');
    allLogs = allLogs.filter(item => item.id !== id);
    localStorage.setItem(fullLogKey, JSON.stringify(allLogs));
}

// --- UI COMPONENTS & RENDERING ---
const dialogOverlay = document.getElementById('dialog-overlay');
const cycleConfigDialog = document.getElementById('cycle-config-dialog');
const workoutPlanDialog = document.getElementById('workout-plan-dialog');
const manageFoodDialog = document.getElementById('manage-food-dialog');
const toastContainer = document.getElementById('toast-container');

/**
 * Opens a specified dialog and displays the overlay.
 * @param {HTMLElement} dialogElement - The dialog HTML element to open.
 */
function openDialog(dialogElement) {
    dialogOverlay.style.display = 'block';
    dialogElement.style.display = 'block';
    // Add a class for animating the dialog if needed
    setTimeout(() => dialogElement.classList.add('show'), 10);
}

/**
 * Closes all dialogs and hides the overlay.
 */
function closeAllDialogs() {
    dialogOverlay.style.display = 'none';
    [cycleConfigDialog, workoutPlanDialog, manageFoodDialog].forEach(dialog => {
        dialog.classList.remove('show');
        dialog.style.display = 'none';
    });
}

/**
 * Creates and displays a toast notification.
 * @param {string} title - The title of the toast.
 * @param {string} description - The description/message of the toast.
 * @param {'default' | 'destructive'} type - The type of toast (default or destructive).
 */
function createToast(title, description, type = 'default') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${description}</div>
    `;
    toastContainer.appendChild(toast);

    // Trigger reflow to ensure animation plays
    void toast.offsetWidth;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4000); // Toast disappears after 4 seconds
}


/**
 * Renders the "Today's Workout" section.
 * Determines the current day's workout based on the cycle configuration and displays it.
 */
function renderTodaysWorkout() {
    const today = startOfDay(new Date());
    const startDate = state.cycleConfig.startDate;
    const dayKeys = Object.keys(state.cyclicalWorkoutSplit);

    let workoutDayKey = "Rest"; // Default to rest if no days are configured

    if (dayKeys.length > 0) {
        const daysSinceStart = differenceInDays(today, startDate);
        const startIndex = dayKeys.indexOf(state.cycleConfig.startDayKey);
        // Handle cases where startDayKey might not be found (e.g., deleted)
        const effectiveStartIndex = startIndex !== -1 ? startIndex : 0;
        const currentDayIndex = (effectiveStartIndex + daysSinceStart) % dayKeys.length;
        workoutDayKey = dayKeys[currentDayIndex];
    } else {
         document.getElementById('todays-workout-title').textContent = "No Workout Plan";
         document.getElementById('todays-workout-description').textContent = "Please add days to your workout split.";
         document.getElementById('todays-workout-content').innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon mb-2"><path d="M14 2c.7-.6 4-2.2 6.1-.6 1.4 1.1 1.7 4.4-.6 6.1-.7.6-4 2.2-6.1.6-1.4-1.1-1.7-4.4.6-6.1Z"/><path d="M22 13V6l-2.4 2.4"/><path d="M14 22V15l-2.4 2.4"/><path d="M12.2 21.8c-.7.6-4 2.2-6.1.6-1.4-1.1-1.7-4.4.6-6.1.7-.6 4-2.2 6.1-.6 1.4 1.1 1.7 4.4-.6 6.1Z"/><path d="M2 11V18l2.4-2.4"/><path d="M9.8 2.2c.7-.6 4-2.2 6.1-.6 1.4 1.1 1.7 4.4-.6 6.1-.7.6-4 2.2-6.1.6-1.4-1.1-1.7-4.4.6-6.1Z"/></svg>
                <p>No workout days defined. Click "Manage Workout Plan" to set it up.</p>
            </div>
         `;
         document.getElementById('todays-workout-footer').innerHTML = ''; // Clear footer content
         return;
    }


    const workoutDay = state.cyclicalWorkoutSplit[workoutDayKey];
    const isCompleted = state.completedWorkouts[format(today, 'yyyy-MM-dd')] === true;
    const isMissed = state.completedWorkouts[format(today, 'yyyy-MM-dd')] === false;

    document.getElementById('todays-workout-title').textContent = workoutDay.title;
    document.getElementById('todays-workout-description').textContent = `Today: ${workoutDayKey}`;

    let workoutContent = '';
    if (workoutDay.exercises.length > 0) {
        workoutContent = `
            <ul class="space-y-3">
                ${workoutDay.exercises.map(ex => `
                    <li class="flex items-center justify-between p-3 bg-muted-50 rounded-md">
                        <div>
                            <span class="block text-sm font-semibold">${ex.name}</span>
                            <span class="text-xs text-muted-foreground">Sets: ${ex.sets}, Reps: ${ex.reps}</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" data-exercise-name="${ex.name}" class="sr-only peer" ${isCompleted ? 'checked disabled' : ''}>
                            <div class="w-9 h-5 bg-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        workoutContent = `
            <div class="flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon mb-2"><path d="M12.2 21.8c-.7.6-4 2.2-6.1.6-1.4-1.1-1.7-4.4.6-6.1.7-.6 4-2.2 6.1-.6 1.4 1.1 1.7 4.4-.6 6.1Z"/><path d="M2 11V18l2.4-2.4"/><path d="M9.8 2.2c.7-.6 4-2.2 6.1-.6 1.4 1.1 1.7 4.4-.6 6.1-.7.6-4 2.2-6.1.6-1.4-1.1-1.7-4.4.6-6.1Z"/></svg>
                <p>This is a rest day. Enjoy your recovery!</p>
            </div>
        `;
    }

    document.getElementById('todays-workout-content').innerHTML = workoutContent;
    document.getElementById('todays-workout-footer').innerHTML = `
        <div class="flex justify-end gap-2">
            <button class="btn btn-secondary ${isCompleted ? 'hidden' : ''}" id="complete-workout-btn" ${workoutDay.exercises.length === 0 ? 'disabled' : ''} title="Mark as Completed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12l2 2 4-4"/></svg>
                Mark as Completed
            </button>
            <button class="btn btn-outline ${isMissed ? 'hidden' : ''}" id="miss-workout-btn" ${isCompleted ? 'hidden' : ''} title="Mark as Missed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Mark as Missed
            </button>
            <button class="btn btn-ghost text-destructive ${!isCompleted && !isMissed ? 'hidden' : ''}" id="reset-workout-status-btn" title="Reset Status">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9c.7 0 1.4 0 2-.1"/><path d="M17 12V3"/><path d="M20.9 5.3l-3.9-3.8-1 1"/><path d="M3.6 15.6l-3.6-3.6 1-1"/></svg>
                Reset
            </button>
        </div>
    `;

    // Apply class to card if workout is completed or missed for subtle visual feedback
    const workoutCard = document.querySelector('.card.lg-col-span-3');
    workoutCard.classList.remove('bg-muted-50'); // Remove previous state
    if (isCompleted || isMissed) {
        workoutCard.classList.add('bg-muted-50');
    }
}

/**
 * Renders the calendar view for tracking workout completion.
 */
function renderCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    const today = startOfDay(new Date());
    const firstDayOfMonth = startOfMonth(state.currentDisplayMonth);
    const lastDayOfMonth = endOfMonth(state.currentDisplayMonth);

    // Get all days for the calendar view (previous month's end, current month, next month's start)
    const startOfWeek = new Date(firstDayOfMonth);
    startOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay()); // Sunday of the first week

    const endOfWeek = new Date(lastDayOfMonth);
    endOfWeek.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay())); // Saturday of the last week

    const daysInMonth = eachDayOfInterval({ start: startOfWeek, end: endOfWeek });

    let calendarHTML = `
        <div class="calendar-header">
            <button class="btn btn-ghost btn-icon" id="prev-month-btn" title="Previous Month">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h3 class="font-semibold">${format(state.currentDisplayMonth, 'MMMMítése')}</h3>
            <button class="btn btn-ghost btn-icon" id="next-month-btn" title="Next Month">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M9 18l6-6-6-6"/></svg>
            </button>
        </div>
        <div class="calendar-grid">
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `<div class="calendar-day-name">${day}</div>`).join('')}
            ${daysInMonth.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                const isOtherMonth = day.getMonth() !== state.currentDisplayMonth.getMonth();
                const isCompleted = state.completedWorkouts[dayKey] === true;
                const isMissed = state.completedWorkouts[dayKey] === false;

                let classes = 'calendar-day';
                if (isToday) classes += ' today';
                if (isOtherMonth) classes += ' other-month';
                if (isCompleted) classes += ' completed';
                if (isMissed) classes += ' missed';

                return `<div class="${classes}">${day.getDate()}</div>`;
            }).join('')}
        </div>
    `;
    calendarContainer.innerHTML = calendarHTML;
}

/**
 * Renders the protein intake tracker section, including current intake, target, and log list.
 */
function renderProteinTracker() {
    const proteinTargetInput = document.getElementById('protein-target-input');
    const proteinTargetDescription = document.getElementById('protein-target-description');
    const proteinProgress = document.getElementById('protein-progress');
    const proteinLogList = document.getElementById('protein-log-list');

    proteinTargetInput.value = state.proteinTarget;

    const totalProtein = state.proteinIntakes.reduce((sum, intake) => sum + intake.amount, 0);
    proteinTargetDescription.textContent = `Target: ${totalProtein}g / ${state.proteinTarget}g`;

    proteinProgress.value = totalProtein;
    proteinProgress.max = state.proteinTarget;
    proteinProgress.style.backgroundColor = totalProtein >= state.proteinTarget ? 'var(--success)' : 'var(--primary)'; // Dynamically change color

    proteinLogList.innerHTML = state.proteinIntakes.map(item => `
        <div class="flex justify-between items-center text-sm p-2 bg-muted-50 rounded-md">
            <div>
                <span class="block">${item.amount}g Protein</span>
                <span class="text-xs text-muted-foreground">Logged at: ${item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <button class="btn btn-ghost btn-icon h-6 w-6 text-destructive" data-id="${item.id}" data-action="delete-protein" title="Delete Protein Log">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    `).join('');

    if (state.proteinIntakes.length === 0) {
        proteinLogList.innerHTML = `<p class="text-xs text-muted-foreground text-center py-4">No protein logged yet for today.</p>`;
    }
}

/**
 * Renders the quick-log buttons and the food log list.
 */
function renderFoodLog() {
    const quickLogButtonsContainer = document.getElementById('quick-log-buttons-container');
    const foodLogList = document.getElementById('food-log-list');

    // Get the names of food items that have already been logged today.
    const loggedTodayNames = state.loggedFoodItems.map(item => item.name);

    quickLogButtonsContainer.innerHTML = state.customFoodItems.map(item => {
        const isLogged = loggedTodayNames.includes(item);
        return `
            <button 
                class="btn btn-secondary w-full" 
                data-action="log-food-item" 
                data-item-name="${item}" 
                title="Log ${item}" 
                ${isLogged ? 'disabled' : ''}
            >
                ${item}
            </button>
        `;
    }).join('');

    if (state.customFoodItems.length === 0) {
        quickLogButtonsContainer.innerHTML = `<p class="text-xs text-muted-foreground text-center col-span-2 py-4">No quick log items configured. Click the settings icon to add some.</p>`;
    }

    foodLogList.innerHTML = state.loggedFoodItems.map(item => `
        <div class="flex justify-between items-center text-sm p-2 bg-muted-50 rounded-md">
            <div>
                <span class="block">${item.name}</span>
                <span class="text-xs text-muted-foreground">Logged at: ${item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <button class="btn btn-ghost btn-icon h-6 w-6 text-destructive" data-id="${item.id}" data-action="delete-food" title="Delete Food Log">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    `).join('');

    if (state.loggedFoodItems.length === 0) {
        foodLogList.innerHTML = `<p class="text-xs text-muted-foreground text-center">No food items logged yet for today.</p>`;
    }
}

/**
 * Renders the manage food items dialog content.
 */
function renderManageFoodDialog() {
    manageFoodDialog.innerHTML = `
        <div class="dialog-header">
            <h3 class="dialog-title">Manage Quick-Log Food Items</h3>
            <p class="dialog-description">Add or remove items for quick logging.</p>
        </div>
        <div class="dialog-body space-y-6">
            <div class="space-y-2">
                <label for="new-food-item-input" class="label">New Food Item</label>
                <div class="flex gap-2">
                    <input type="text" id="new-food-item-input" class="input" placeholder="e.g., Apple, Banana">
                    <button class="btn btn-default btn-icon" id="add-food-item-btn" title="Add Food Item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                    </button>
                </div>
            </div>
            <hr />
            <div class="space-y-2">
                <h4 class="font-semibold text-foreground">Current Quick-Log Items</h4>
                <div id="current-food-items-list" class="space-y-2 max-h-40 overflow-y-auto">
                    ${state.customFoodItems.length > 0 ? state.customFoodItems.map(item => `
                        <div class="flex justify-between items-center p-2 bg-muted-50 rounded-md">
                            <span>${item}</span>
                            <button class="btn btn-ghost btn-icon h-6 w-6 text-destructive" data-item-name="${item}" data-action="remove-custom-food" title="Remove ${item}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    `).join('') : '<p class="text-xs text-muted-foreground text-center py-4">No quick log items configured.</p>'}
                </div>
            </div>
        </div>
        <div class="dialog-footer">
            <button class="btn btn-secondary" id="cancel-manage-food">Close</button>
        </div>
    `;
    const newFoodItemInput = document.getElementById('new-food-item-input');
    document.getElementById('add-food-item-btn').onclick = () => {
        const itemName = newFoodItemInput.value.trim();
        if (itemName && !state.customFoodItems.includes(itemName)) {
            state.customFoodItems.push(itemName);
            saveStateToLocalStorage();
            renderManageFoodDialog(); // Re-render dialog to show new item
            renderFoodLog(); // Update main food log quick buttons
            newFoodItemInput.value = ''; // Clear input
            createToast("Item Added", `${itemName} added to quick log.`);
        } else if (itemName) {
            createToast("Duplicate Item", `${itemName} is already in the quick log.`, 'destructive');
        }
    };
}

/**
 * Renders the workout plan management dialog.
 */
function renderWorkoutPlanDialog() {
    const dayKeys = Object.keys(state.cyclicalWorkoutSplit);
    const selectedDay = state.cyclicalWorkoutSplit[state.selectedCycleDayKeyForEdit];
    const exercisesHtml = selectedDay ? selectedDay.exercises.map((ex, exIndex) => `
        <div class="flex items-center gap-2 p-2 bg-muted-50 rounded-md">
            <input type="text" class="input w-full" value="${ex.name}" data-exercise-index="${exIndex}" data-field="name" data-action="edit-exercise-field" placeholder="Exercise Name">
            <input type="text" class="input w-20" value="${ex.sets}" data-exercise-index="${exIndex}" data-field="sets" data-action="edit-exercise-field" placeholder="Sets">
            <input type="text" class="input w-20" value="${ex.reps}" data-exercise-index="${exIndex}" data-field="reps" data-action="edit-exercise-field" placeholder="Reps">
            <button class="btn btn-ghost btn-icon h-8 w-8 text-destructive" data-exercise-index="${exIndex}" data-action="delete-exercise" title="Delete Exercise">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    `).join('') : '<p class="text-xs text-muted-foreground text-center">Select a day or add a new one.</p>';

    workoutPlanDialog.innerHTML = `
        <div class="dialog-header">
            <h3 class="dialog-title">Manage Workout Plan</h3>
            <p class="dialog-description">Configure your cyclical workout split.</p>
        </div>
        <div class="dialog-body space-y-6">
            <div class="space-y-2">
                <label for="new-day-key-input" class="label">Add New Workout Day</label>
                <div class="flex gap-2">
                    <input type="text" id="new-day-key-input" class="input" placeholder="e.g., Day 4 (Arms & Abs)">
                    <button class="btn btn-default btn-icon" id="add-workout-day-btn" title="Add Workout Day">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                    </button>
                </div>
            </div>

            <hr />

            <div class="space-y-2">
                <label for="select-day-to-edit" class="label">Select Day to Edit</label>
                <div class="flex gap-2">
                    <select id="select-day-to-edit" class="select w-full" data-action="select-day-to-edit">
                        ${dayKeys.length > 0 ? dayKeys.map(key => `<option value="${key}" ${key === state.selectedCycleDayKeyForEdit ? 'selected' : ''}>${key}</option>`).join('') : '<option value="">No days added</option>'}
                    </select>
                    <button class="btn btn-outline btn-icon h-8 w-8 text-destructive" id="delete-selected-day-btn" ${!state.selectedCycleDayKeyForEdit ? 'disabled' : ''} title="Delete Selected Day">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>

            ${state.selectedCycleDayKeyForEdit ? `
                <div class="space-y-4 border p-4 rounded-md">
                    <h4 class="font-semibold text-foreground">${state.selectedCycleDayKeyForEdit} Details</h4>
                    <div class="space-y-2">
                        <label for="edit-day-title-input" class="label">Day Title</label>
                        <input type="text" id="edit-day-title-input" class="input" value="${selectedDay.title}" data-action="edit-day-title" placeholder="e.g., Push Day">
                    </div>
                    <div class="space-y-2">
                        <label class="label">Exercises</label>
                        <div id="exercises-list" class="space-y-2 max-h-40 overflow-y-auto pr-2">
                            ${exercisesHtml}
                        </div>
                        <div class="flex gap-2 mt-3">
                            <input type="text" id="new-exercise-name-input" class="input" placeholder="Exercise Name">
                            <input type="text" id="new-exercise-sets-input" class="input w-20" placeholder="Sets">
                            <input type="text" id="new-exercise-reps-input" class="input w-20" placeholder="Reps">
                            <button class="btn btn-default btn-icon" id="add-exercise-btn" title="Add Exercise">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            ` : `<p class="text-muted-foreground text-center py-4 border border-dashed rounded-md">No day selected for editing.</p>`}
        </div>
        <div class="dialog-footer">
            <button class="btn btn-secondary" id="cancel-workout-plan">Close</button>
        </div>
    `;

    // Event listener for adding a new workout day
    const newDayKeyInput = document.getElementById('new-day-key-input');
    document.getElementById('add-workout-day-btn').onclick = () => {
        const newDayKey = newDayKeyInput.value.trim();
        if (newDayKey && !state.cyclicalWorkoutSplit[newDayKey]) {
            state.cyclicalWorkoutSplit[newDayKey] = { title: newDayKey, exercises: [] };
            state.selectedCycleDayKeyForEdit = newDayKey; // Automatically select the new day
            saveStateToLocalStorage();
            renderWorkoutPlanDialog();
            renderTodaysWorkout(); // Update today's workout in case the cycle changed
            newDayKeyInput.value = '';
            createToast("Day Added", `Workout day "${newDayKey}" added.`);
        } else if (newDayKey) {
            createToast("Duplicate Day", `Workout day "${newDayKey}" already exists.`, 'destructive');
        }
    };

    // Event listener for deleting a workout day
    document.getElementById('delete-selected-day-btn').onclick = () => {
        if (state.selectedCycleDayKeyForEdit && confirm(`Are you sure you want to delete "${state.selectedCycleDayKeyForEdit}"? This cannot be undone.`)) {
            const deletedDayKey = state.selectedCycleDayKeyForEdit;
            delete state.cyclicalWorkoutSplit[deletedDayKey];
            const remainingKeys = Object.keys(state.cyclicalWorkoutSplit);
            state.selectedCycleDayKeyForEdit = remainingKeys.length > 0 ? remainingKeys[0] : null;
            // If the deleted day was the startDayKey, reset it
            if (state.cycleConfig.startDayKey === deletedDayKey && remainingKeys.length > 0) {
                state.cycleConfig.startDayKey = remainingKeys[0];
            } else if (state.cycleConfig.startDayKey === deletedDayKey && remainingKeys.length === 0) {
                state.cycleConfig.startDayKey = null; // No days left
            }
            saveStateToLocalStorage();
            renderWorkoutPlanDialog();
            renderTodaysWorkout(); // Update today's workout
            createToast("Day Deleted", `Workout day "${deletedDayKey}" deleted.`, 'destructive');
        }
    };

    if (state.selectedCycleDayKeyForEdit) {
        // Event listener for adding a new exercise
        document.getElementById('add-exercise-btn').onclick = () => {
            const newExerciseNameInput = document.getElementById('new-exercise-name-input');
            const newExerciseSetsInput = document.getElementById('new-exercise-sets-input');
            const newExerciseRepsInput = document.getElementById('new-exercise-reps-input');

            const name = newExerciseNameInput.value.trim();
            const sets = newExerciseSetsInput.value.trim();
            const reps = newExerciseRepsInput.value.trim();

            if (name && sets && reps) {
                state.cyclicalWorkoutSplit[state.selectedCycleDayKeyForEdit].exercises.push({ name, sets, reps });
                saveStateToLocalStorage();
                renderWorkoutPlanDialog(); // Re-render to show new exercise
                renderTodaysWorkout(); // Update today's workout
                newExerciseNameInput.value = '';
                newExerciseSetsInput.value = '';
                newExerciseRepsInput.value = '';
                createToast("Exercise Added", `${name} added to ${state.selectedCycleDayKeyForEdit}.`);
            } else {
                createToast("Missing Fields", "Please fill all exercise fields.", 'destructive');
            }
        };
    }
}


/**
 * Renders the cycle configuration dialog content.
 */
function renderCycleConfigDialog() {
    const dayKeys = Object.keys(state.cyclicalWorkoutSplit);
    cycleConfigDialog.innerHTML = `
        <div class="dialog-header">
            <h3 class="dialog-title">Configure Workout Cycle</h3>
            <p class="dialog-description">Set your workout cycle start date and starting day.</p>
        </div>
        <div class="dialog-body space-y-4">
            <div class="space-y-2">
                <label for="cycle-start-date" class="label">Cycle Start Date</label>
                <input type="date" id="cycle-start-date" class="input" value="${format(state.cycleConfig.startDate, 'yyyy-MM-dd')}">
            </div>
            <div class="space-y-2">
                <label for="cycle-start-day-key" class="label">Starting Day in Cycle</label>
                <select id="cycle-start-day-key" class="select">
                    ${dayKeys.length > 0 ? dayKeys.map(key => `<option value="${key}" ${key === state.cycleConfig.startDayKey ? 'selected' : ''}>${key}</option>`).join('') : '<option value="">No days added</option>'}
                </select>
            </div>
        </div>
        <div class="dialog-footer">
            <button class="btn btn-secondary" id="cancel-cycle-config">Cancel</button>
            <button class="btn btn-default" id="save-cycle-config">Save</button>
        </div>
    `;
}

/**
 * Updates all relevant UI components.
 * This function should be called after any state change that affects multiple parts of the UI.
 */
function updateAllViews() {
    renderTodaysWorkout();
    renderCalendar();
    renderProteinTracker();
    renderFoodLog();
    // Only render dialogs if they are currently open to avoid unnecessary DOM manipulation
    if (cycleConfigDialog.style.display === 'block') renderCycleConfigDialog();
    if (workoutPlanDialog.style.display === 'block') renderWorkoutPlanDialog();
    if (manageFoodDialog.style.display === 'block') renderManageFoodDialog();
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage(); // Load state as soon as DOM is ready
    updateAllViews(); // Render all UI components based on loaded state

    // Close dialogs when clicking outside
    dialogOverlay.addEventListener('click', closeAllDialogs);

    // Event delegation for clicks on the body
    document.body.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return; // Exit if the click wasn't on or inside a button

        // --- Dialog Buttons ---
        if (button.id === 'cancel-cycle-config' || button.id === 'cancel-workout-plan' || button.id === 'cancel-manage-food') {
            closeAllDialogs();
            return;
        }

        if (button.id === 'save-cycle-config') {
            const cycleStartDateInput = document.getElementById('cycle-start-date');
            const cycleStartDaySelect = document.getElementById('cycle-start-day-key');

            const [year, month, day] = cycleStartDateInput.value.split('-').map(Number);
            state.cycleConfig.startDate = new Date(year, month - 1, day);
            state.cycleConfig.startDayKey = cycleStartDaySelect.value;
            saveStateToLocalStorage();
            createToast("Configuration Saved", "Your workout cycle has been updated.");
            closeAllDialogs();
            renderTodaysWorkout();
            renderCalendar();
            return;
        }

        // --- Today's Workout Section ---
        if (button.id === 'complete-workout-btn') {
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            state.completedWorkouts[todayKey] = true;
            saveStateToLocalStorage();
            renderTodaysWorkout();
            renderCalendar();
            createToast("Workout Completed!", "Great job!");
            return;
        }
        if (button.id === 'miss-workout-btn') {
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            state.completedWorkouts[todayKey] = false;
            saveStateToLocalStorage();
            renderTodaysWorkout();
            renderCalendar();
            createToast("Workout Missed", "It's okay, get back to it tomorrow.", 'destructive');
            return;
        }
        if (button.id === 'reset-workout-status-btn') {
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            delete state.completedWorkouts[todayKey];
            saveStateToLocalStorage();
            renderTodaysWorkout();
            renderCalendar();
            createToast("Workout Status Reset", "Today's workout status has been cleared.");
            return;
        }

        // --- Protein Tracker ---
        if (button.id === 'log-protein-btn') {
            const proteinAmountInput = document.getElementById('protein-amount-input');
            const amount = parseInt(proteinAmountInput.value);
            if (amount > 0) {
                const newIntake = { id: Date.now().toString(), amount, timestamp: new Date() };
                state.proteinIntakes.push(newIntake);
                saveLogToLocalStorage('proteinLog', newIntake);
                renderProteinTracker();
                proteinAmountInput.value = '';
                createToast("Protein Logged", `${amount}g protein logged.`);
            } else {
                createToast("Invalid Amount", "Please enter a valid protein amount.", 'destructive');
            }
            return;
        }
        if (button.dataset.action === 'delete-protein') {
            const idToDelete = button.dataset.id;
            state.proteinIntakes = state.proteinIntakes.filter(item => item.id !== idToDelete);
            deleteFromLogLocalStorage('proteinLog', idToDelete);
            renderProteinTracker();
            createToast("Protein Deleted", "Protein intake entry removed.", 'destructive');
            return;
        }

        // --- Food Log ---
        if (button.dataset.action === 'log-food-item') {
            const itemName = button.dataset.itemName;
            const newFoodItem = { id: Date.now().toString(), name: itemName, timestamp: new Date() };
            state.loggedFoodItems.push(newFoodItem);
            saveLogToLocalStorage('foodLog', newFoodItem);
            renderFoodLog(); // This will re-render the buttons with the correct disabled state.
            createToast("Food Logged", `${itemName} logged.`);
            return;
        }
        if (button.dataset.action === 'delete-food') {
            const idToDelete = button.dataset.id;
            state.loggedFoodItems = state.loggedFoodItems.filter(item => item.id !== idToDelete);
            deleteFromLogLocalStorage('foodLog', idToDelete);
            renderFoodLog(); // Re-renders food log and enables the quick-log button again.
            createToast("Food Deleted", "Food item entry removed.", 'destructive');
            return;
        }

        // --- Manage Food Dialog ---
        if (button.dataset.action === 'remove-custom-food') {
            const itemName = button.dataset.itemName;
            if (confirm(`Are you sure you want to remove "${itemName}" from quick log?`)) {
                state.customFoodItems = state.customFoodItems.filter(item => item !== itemName);
                saveStateToLocalStorage();
                renderManageFoodDialog();
                renderFoodLog();
                createToast("Item Removed", `${itemName} removed from quick log.`, 'destructive');
            }
            return;
        }

        // --- Workout Plan Dialog (delegated events for dynamic elements) ---
        if (button.closest('#workout-plan-dialog')) {
            if (button.dataset.action === 'delete-exercise') {
                const exerciseIndex = parseInt(button.dataset.exerciseIndex);
                if (state.selectedCycleDayKeyForEdit && confirm("Are you sure you want to delete this exercise?")) {
                    state.cyclicalWorkoutSplit[state.selectedCycleDayKeyForEdit].exercises.splice(exerciseIndex, 1);
                    saveStateToLocalStorage();
                    renderWorkoutPlanDialog();
                    renderTodaysWorkout();
                    createToast("Exercise Deleted", "Exercise removed from workout day.", 'destructive');
                }
                return;
            }
        }

        // --- Open Dialog Buttons ---
        if (button.id === 'open-cycle-config-dialog') {
            renderCycleConfigDialog();
            openDialog(cycleConfigDialog);
            return;
        }
        if (button.id === 'open-workout-plan-dialog') {
            const workoutKeys = Object.keys(state.cyclicalWorkoutSplit);
            if (workoutKeys.length === 0) {
                 createToast("No Workout Days", "Please add some workout days first.", "destructive");
                 return;
            }
            if (!state.selectedCycleDayKeyForEdit) {
                state.selectedCycleDayKeyForEdit = workoutKeys[0];
            }
            renderWorkoutPlanDialog();
            openDialog(workoutPlanDialog);
            return;
        }
        if (button.id === 'open-food-dialog') {
            renderManageFoodDialog();
            openDialog(manageFoodDialog);
            return;
        }
    });

    // Event delegation for changes on the body (e.g., input fields, selects)
    document.body.addEventListener('change', e => {
        const target = e.target;

        // Protein Target Input
        if (target.id === 'protein-target-input') {
            state.proteinTarget = parseInt(target.value) || 0;
            saveStateToLocalStorage();
            renderProteinTracker();
            createToast("Target Updated", `Daily protein target set to ${state.proteinTarget}g.`);
            return;
        }

        // Workout Plan Dialog Changes (select and exercise fields)
        if (target.closest('#workout-plan-dialog')) {
            if (target.dataset.action === 'select-day-to-edit') {
                state.selectedCycleDayKeyForEdit = target.value;
                renderWorkoutPlanDialog();
                return;
            }
            if (target.dataset.action === 'edit-day-title') {
                if (state.selectedCycleDayKeyForEdit) {
                    state.cyclicalWorkoutSplit[state.selectedCycleDayKeyForEdit].title = target.value;
                    saveStateToLocalStorage();
                    renderWorkoutPlanDialog();
                    renderTodaysWorkout();
                    createToast("Title Updated", `Day title changed to "${target.value}".`);
                }
                return;
            }
            if (target.dataset.action === 'edit-exercise-field') {
                const exerciseIndex = parseInt(target.dataset.exerciseIndex);
                const field = target.dataset.field;
                if (state.selectedCycleDayKeyForEdit && state.cyclicalWorkoutSplit[state.selectedCycleDayKeyForEdit].exercises[exerciseIndex]) {
                    state.cyclicalWorkoutSplit[state.selectedCycleDayKeyForEdit].exercises[exerciseIndex][field] = target.value;
                    saveStateToLocalStorage();
                    renderTodaysWorkout();
                }
                return;
            }
        }
    });

    // Calendar navigation
    document.getElementById('calendar-container').addEventListener('click', e => {
        const target = e.target.closest('button');
        if (!target) return;
        if (target.id === 'prev-month-btn') state.currentDisplayMonth = subMonths(state.currentDisplayMonth, 1);
        if (target.id === 'next-month-btn') state.currentDisplayMonth = addMonths(state.currentDisplayMonth, 1);
        renderCalendar();
    });
});