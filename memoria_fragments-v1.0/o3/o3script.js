document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let proteinIntakes = [];
    let loggedFoodItems = [];
    let proteinTarget = "150";
    let customFoodItems = ["Protein Powder", "Creatine", "Oatmeal", "Eggs", "Chicken Breast", "Greek Yogurt"];
    let cyclicalWorkoutSplit = {
        "Day 1": { title: "Push Day (Chest, Shoulders, Triceps)", exercises: [{ name: "Bench Press", sets: "3-4", reps: "8-12" }, { name: "Overhead Press", sets: "3", reps: "8-12" }, { name: "Incline Dumbbell Press", sets: "3", reps: "10-15" }, { name: "Tricep Dips/Pushdowns", sets: "3", reps: "10-15" }, { name: "Lateral Raises", sets: "3", reps: "12-15" }] },
        "Day 2": { title: "Pull Day (Back, Biceps)", exercises: [{ name: "Pull-ups/Lat Pulldowns", sets: "3-4", reps: "6-12" }, { name: "Bent-over Rows", sets: "3", reps: "8-12" }, { name: "Seated Cable Rows", sets: "3", reps: "10-15" }, { name: "Barbell Curls", sets: "3", reps: "8-12" }, { name: "Face Pulls", sets: "3", reps: "15-20" }] },
        "Day 3": { title: "Leg Day (Quads, Hamstrings, Calves)", exercises: [{ name: "Squats", sets: "3-4", reps: "8-12" }, { name: "Romanian Deadlifts", sets: "3", reps: "10-12" }, { name: "Leg Press", sets: "3", reps: "10-15" }, { name: "Leg Curls", sets: "3", reps: "10-15" }, { name: "Calf Raises", sets: "3", reps: "15-20" }] },
        "Day 4 (Rest)": { title: "Rest or Active Recovery", exercises: [] },
    };
    let cycleConfig = { startDate: new Date(), startDayKey: "Day 1" };
    let completedWorkouts = {};
    let currentDisplayMonth = new Date();
    
    const LOCAL_STORAGE_KEY_COMPLETED_WORKOUTS = 'memoriaAppGymCompletedWorkouts';

    // --- DOM ELEMENTS ---
    const mainContent = document.getElementById('main-content');
    const loaderContainer = document.getElementById('loader-container');
    const toastElement = document.getElementById('toast');
    
    // Workout Plan
    const workoutPlanTitle = document.getElementById('workout-plan-title');
    const workoutPlanDescription = document.getElementById('workout-plan-description');
    const workoutExercisesContent = document.getElementById('workout-exercises-content');
    const toggleWorkoutCompletionBtn = document.getElementById('toggle-workout-completion-btn');
    const workoutCard = document.getElementById('workout-card');
    
    // Protein Tracker
    const proteinTargetInput = document.getElementById('proteinTarget');
    const proteinTargetDesc = document.getElementById('protein-target-description');
    const proteinProgressBar = document.getElementById('protein-progress-bar');
    const proteinAmountInput = document.getElementById('protein-amount-input');
    const logProteinBtn = document.getElementById('log-protein-btn');
    const proteinIntakeList = document.getElementById('protein-intake-list');

    // Food Log
    const quickLogFoodGrid = document.getElementById('quick-log-food-grid');
    const loggedFoodList = document.getElementById('logged-food-list');
    
    // Calendar
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarPrevBtn = document.getElementById('calendar-prev-month');
    const calendarNextBtn = document.getElementById('calendar-next-month');

    // Dialogs
    const dialogOverlay = document.getElementById('dialog-overlay');
    
    // Cycle Config Dialog
    const cycleConfigDialog = document.getElementById('cycle-config-dialog');
    const openCycleConfigDialogBtn = document.getElementById('open-cycle-config-dialog');
    const cancelCycleConfigBtn = document.getElementById('cancel-cycle-config');
    const saveCycleConfigBtn = document.getElementById('save-cycle-config');
    const cycleStartDateInput = document.getElementById('cycle-start-date');
    const cycleStartDayKeySelect = document.getElementById('cycle-start-day-key');
    const cycleConfigError = document.getElementById('cycle-config-error');
    const cycleConfigForm = document.getElementById('cycle-config-form');

    // Manage Workout Plan Dialog
    const workoutPlanDialog = document.getElementById('workout-plan-dialog');
    const openWorkoutPlanDialogBtn = document.getElementById('open-workout-plan-dialog');
    const closeWorkoutPlanDialogBtn = document.getElementById('close-workout-plan-dialog');
    const newCycleDayNameInput = document.getElementById('new-cycle-day-name-input');
    const addCycleDayBtn = document.getElementById('add-cycle-day-btn');
    const cycleDaysList = document.getElementById('cycle-days-list');
    const workoutDaySelect = document.getElementById('workout-day-select');
    const editDayForm = document.getElementById('edit-day-form');
    const dayTitleLabel = document.getElementById('day-title-label');
    const dayTitleInput = document.getElementById('day-title-input');
    const exerciseList = document.getElementById('exercise-list');
    const exercisesForDayTitle = document.getElementById('exercises-for-day-title');
    const addExerciseTitle = document.getElementById('add-exercise-title');
    const newExerciseNameInput = document.getElementById('new-exercise-name');
    const newExerciseSetsInput = document.getElementById('new-exercise-sets');
    const newExerciseRepsInput = document.getElementById('new-exercise-reps');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    
    // Manage Food Dialog
    const manageFoodDialog = document.getElementById('manage-food-dialog');
    const openManageFoodDialogBtn = document.getElementById('open-manage-food-dialog');
    const closeManageFoodDialogBtn = document.getElementById('close-manage-food-dialog');
    const newCustomFoodItemText = document.getElementById('new-custom-food-item-text');
    const addCustomFoodItemBtn = document.getElementById('add-custom-food-item-btn');
    const customFoodItemsList = document.getElementById('custom-food-items-list');


    // --- HELPER FUNCTIONS ---
    const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const getToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };
    
    const showToast = (message, type = 'info') => {
        toastElement.textContent = message;
        toastElement.className = 'toast show';
        if (type === 'destructive') {
            toastElement.classList.add('destructive');
        }
        setTimeout(() => {
            toastElement.className = 'toast';
        }, 3000);
    };
    
    const openDialog = (dialogElement) => {
        dialogOverlay.classList.remove('hidden');
        dialogElement.classList.remove('hidden');
    };
    
    const closeDialog = (dialogElement) => {
        dialogOverlay.classList.add('hidden');
        dialogElement.classList.add('hidden');
    };

    const getWorkoutDayInfoForDate = (date) => {
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const cycleWorkoutKeys = Object.keys(cyclicalWorkoutSplit);
        const cycleLength = cycleWorkoutKeys.length;

        if (!cycleConfig.startDate || !cycleConfig.startDayKey || cycleLength === 0) {
            return { key: "N/A", title: "Cycle Not Configured", exercises: [], isRestDay: false };
        }

        const normalizedStartDate = new Date(cycleConfig.startDate);
        normalizedStartDate.setHours(0, 0, 0, 0);

        const daysSinceStart = Math.floor((normalizedDate - normalizedStartDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStart < 0) {
            return { key: "N/A", title: "Cycle Starts in Future", exercises: [], isRestDay: false };
        }

        let startIndexInCycle = cycleWorkoutKeys.indexOf(cycleConfig.startDayKey);
        if (startIndexInCycle === -1) { 
            return { key: "Error", title: "Invalid Start Day Key", exercises: [], isRestDay: false };
        }

        const currentDayIndexInCycle = (startIndexInCycle + daysSinceStart) % cycleLength;
        const workoutKey = cycleWorkoutKeys[currentDayIndexInCycle];
        const workoutData = cyclicalWorkoutSplit[workoutKey] || { title: "Undefined Workout", exercises: [] };
        const isRestDay = workoutData.exercises.length === 0 || workoutData.title.toLowerCase().includes("rest");

        return { key: workoutKey, ...workoutData, isRestDay };
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
                toggleWorkoutCompletionBtn.innerHTML = `<span class="icon-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></span> Workout Completed!`;
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
        showToast(`${amount}g of protein added.`);
        renderProteinTracker();
    };
    const handleDeleteProteinIntake = (id) => {
        proteinIntakes = proteinIntakes.filter(p => p.id !== id);
        showToast("Protein entry deleted.");
        renderProteinTracker();
    };

    // Food
    const handleLogFoodItem = (itemName) => {
        loggedFoodItems.push({ id: `food-${Date.now()}-${itemName.replace(/\s+/g, '')}`, name: itemName, timestamp: new Date() });
        renderFoodLog();
    };
    const handleDeleteLoggedFoodItem = (id) => {
        loggedFoodItems = loggedFoodItems.filter(item => item.id !== id);
        showToast("Food entry deleted.");
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
        if (!cycleStartDateInput.value || !newStartDayKey) {
            showToast("Please select a start date and day.", "destructive");
            return;
        }
        // Adjust for timezone offset
        newStartDate.setMinutes(newStartDate.getMinutes() + newStartDate.getTimezoneOffset());
        cycleConfig.startDate = newStartDate;
        cycleConfig.startDayKey = newStartDayKey;
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
        renderManageFoodDialog();
        renderFoodLog();
    };
    const handleDeleteCustomFoodItem = (itemToDelete) => {
        customFoodItems = customFoodItems.filter(item => item !== itemToDelete);
        showToast(`"${itemToDelete}" removed.`);
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

    function init() {
        // Load from Local Storage
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY_COMPLETED_WORKOUTS);
            if (stored) {
                completedWorkouts = JSON.parse(stored);
            }
        } catch (error) {
            console.error("Failed to load from localStorage:", error);
            completedWorkouts = {};
        }

        // Add Event Listeners
        logProteinBtn.addEventListener('click', handleLogProtein);
        proteinTargetInput.addEventListener('change', (e) => {
            proteinTarget = e.target.value;
            renderProteinTracker();
        });
        toggleWorkoutCompletionBtn.addEventListener('click', handleToggleWorkoutCompletion);

        // Calendar navigation
        calendarPrevBtn.addEventListener('click', () => {
            currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1);
            renderCalendar();
        });
        calendarNextBtn.addEventListener('click', () => {
            currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1);
            renderCalendar();
        });

        // Dialog Triggers & Handlers
        openCycleConfigDialogBtn.addEventListener('click', handleOpenCycleConfigDialog);
        cancelCycleConfigBtn.addEventListener('click', () => closeDialog(cycleConfigDialog));
        saveCycleConfigBtn.addEventListener('click', handleSaveCycleConfig);
        
        openWorkoutPlanDialogBtn.addEventListener('click', () => {
            renderManageWorkoutDialog();
            openDialog(workoutPlanDialog);
        });
        closeWorkoutPlanDialogBtn.addEventListener('click', () => {
            closeDialog(workoutPlanDialog);
            renderAll(); // Re-render main page in case plan was changed
        });
        addCycleDayBtn.addEventListener('click', handleAddCycleDay);
        workoutDaySelect.addEventListener('change', (e) => renderEditDayForm(e.target.value));
        dayTitleInput.addEventListener('blur', (e) => handleWorkoutDayTitleChange(workoutDaySelect.value, e.target.value));
        addExerciseBtn.addEventListener('click', handleAddExerciseToDay);

        openManageFoodDialogBtn.addEventListener('click', () => {
            renderManageFoodDialog();
            openDialog(manageFoodDialog);
        });
        closeManageFoodDialogBtn.addEventListener('click', () => closeDialog(manageFoodDialog));
        addCustomFoodItemBtn.addEventListener('click', handleAddCustomFoodItem);
        
        // Hide loader and show content
        setTimeout(() => {
            loaderContainer.classList.add('hidden');
            mainContent.classList.remove('hidden');
            // Initial Render
            renderAll();
        }, 500); // Simulate loading
    }

    init();
});