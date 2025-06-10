document.addEventListener('DOMContentLoaded', () => {
    // --- STATE VARIABLES ---
    let weeklySchedule = {};
    let selectedDay = '';
    let selectedTemplateDay = '';
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const durationOptions = [
        { value: "30", label: "30 minutes" },
        { value: "60", label: "1 hour" },
        { value: "90", label: "1.5 hours" },
        { value: "120", label: "2 hours" },
        { value: "180", label: "3 hours" },
    ];

    // --- DOM ELEMENT SELECTORS ---
    const loadingStateEl = document.getElementById('loading-state');
    const mainContentEl = document.getElementById('main-content');
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
    const templateDialog = document.getElementById('template-dialog');
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


    // --- HELPER FUNCTIONS ---
    const getCurrentDayName = () => {
        const today = new Date();
        const dayIndex = today.getDay(); // Sunday: 0, Monday: 1, ...
        return daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];
    };

    const parseDurationToMinutes = (durationValue) => parseInt(durationValue, 10) || 30;

    const calculateEndTime = (startTime, durationMinutes) => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        startDate.setMinutes(startDate.getMinutes() + durationMinutes);
        return `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    };
    
    // --- LOCAL STORAGE & DATA HANDLING ---
    const loadSchedule = () => {
        const storedSchedule = localStorage.getItem('weeklySchedule');
        if (storedSchedule) {
            weeklySchedule = JSON.parse(storedSchedule);
        } else {
            // Initialize with empty arrays for each day
            daysOfWeek.forEach(day => { weeklySchedule[day] = []; });
        }
    };

    const saveSchedule = () => {
        localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));
    };

    // --- RENDERING FUNCTIONS ---
    const renderScheduleList = (day) => {
        scheduleListEl.innerHTML = ''; // Clear previous items
        const daySchedule = weeklySchedule[day] || [];
        
        if (daySchedule.length === 0) {
            scheduleListEl.innerHTML = `<p class="empty-list-message">No items scheduled for ${day}.</p>`;
            return;
        }

        daySchedule.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'schedule-item';
            itemEl.innerHTML = `
                <div class="schedule-item-details">
                    <span class="time">${item.startTime} - ${item.endTime}</span>: ${item.title}
                    ${item.tag ? `<span class="schedule-item-tag">${item.tag}</span>` : ''}
                </div>
                <button class="button button-ghost delete-btn" data-item-id="${item.id}" title="Delete item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
            `;
            scheduleListEl.appendChild(itemEl);
        });
        
        // Add event listeners to new delete buttons
        document.querySelectorAll('.schedule-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleDeleteItem(day, btn.dataset.itemId, false);
            });
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
        scheduleDayTitleEl.textContent = `Schedule for ${selectedDay}`;
        addItemTitleEl.textContent = `Add Ad-hoc Item to ${selectedDay}`;
        renderScheduleList(selectedDay);
    };

    const updateUIForSelectedTemplateDay = () => {
        templateItemsTitleEl.textContent = `Items for ${selectedTemplateDay}'s Template`;
        addTemplateItemTitleEl.textContent = `Add New Item to ${selectedTemplateDay}'s Template`;
        renderTemplateList(selectedTemplateDay);
    };

    // --- TOAST NOTIFICATION ---
    const showToast = ({ title, description, variant = 'default' }) => {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${variant}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-description">${description}</div>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };


    // --- CORE LOGIC & EVENT HANDLERS ---
    const handleAddItem = (isTemplate) => {
        const title = isTemplate ? templateItemTitleInput.value : newItemTitleInput.value;
        const startTime = isTemplate ? templateItemStartTimeInput.value : newItemStartTimeInput.value;
        const duration = isTemplate ? templateItemDurationSelect.value : newItemDurationSelect.value;
        const tag = isTemplate ? templateItemTagInput.value : newItemTagInput.value;
        const addToAllWeek = !isTemplate && newItemAddToAllWeekCheckbox.checked;

        if (!title.trim()) {
            showToast({ title: "Missing Info", description: "Please provide a title for the item.", variant: "destructive" });
            return;
        }

        const durationMinutes = parseDurationToMinutes(duration);
        const endTime = calculateEndTime(startTime, durationMinutes);

        const newItemBase = {
            startTime: startTime,
            endTime: endTime,
            title: title.trim(),
            tag: tag.trim() || undefined,
        };

        const daysToUpdate = isTemplate ? [selectedTemplateDay] : (addToAllWeek ? daysOfWeek : [selectedDay]);

        daysToUpdate.forEach(day => {
            const newItem = { ...newItemBase, id: `${day.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
            weeklySchedule[day] = [...weeklySchedule[day], newItem].sort((a, b) => a.startTime.localeCompare(b.startTime));
        });

        saveSchedule();

        // UI Updates and Feedback
        if (isTemplate) {
            showToast({ title: "Template Item Added", description: `"${title}" added to ${selectedTemplateDay}'s template.` });
            renderTemplateList(selectedTemplateDay);
            templateItemTitleInput.value = '';
            templateItemStartTimeInput.value = '09:00';
            templateItemDurationSelect.value = '60';
            templateItemTagInput.value = '';
        } else {
            const toastMessage = addToAllWeek
                ? `"${title}" has been added to all days this week.`
                : `"${title}" has been added to ${selectedDay}.`;
            showToast({ title: "Item Added", description: toastMessage });
            renderScheduleList(selectedDay);
            newItemTitleInput.value = '';
            newItemStartTimeInput.value = '09:00';
            newItemDurationSelect.value = '60';
            newItemTagInput.value = '';
            newItemAddToAllWeekCheckbox.checked = false;
        }
    };
    
    const handleDeleteItem = (day, itemId, isTemplate) => {
        weeklySchedule[day] = weeklySchedule[day].filter(item => item.id !== itemId);
        saveSchedule();
        showToast({ title: "Item Deleted", variant: "destructive", description: `Item removed from ${isTemplate ? day + "'s template" : day}.` });
        
        if (isTemplate) {
            renderTemplateList(day);
        } else {
            renderScheduleList(day);
        }
    };
    

    // --- INITIALIZATION ---
    const init = () => {
        // Simulate loading delay
        setTimeout(() => {
            loadSchedule();

            // Set initial day
            selectedDay = getCurrentDayName();
            selectedTemplateDay = selectedDay;

            // Populate dropdowns
            daysOfWeek.forEach(day => {
                daySelectEl.innerHTML += `<option value="${day}">${day}</option>`;
                templateDaySelect.innerHTML += `<option value="${day}">${day}'s Template</option>`;
            });
            durationOptions.forEach(opt => {
                newItemDurationSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
                templateItemDurationSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
            });

            // Set default values
            daySelectEl.value = selectedDay;
            templateDaySelect.value = selectedDay;
            newItemDurationSelect.value = '60';
            templateItemDurationSelect.value = '60';
            
            // Initial render
            updateUIForSelectedDay();

            // Hide loader and show content
            loadingStateEl.style.display = 'none';
            mainContentEl.style.display = 'grid';

        }, 500); // 0.5 second delay to show loader
    };

    // --- EVENT LISTENERS ---
    daySelectEl.addEventListener('change', (e) => {
        selectedDay = e.target.value;
        updateUIForSelectedDay();
    });

    templateDaySelect.addEventListener('change', (e) => {
        selectedTemplateDay = e.target.value;
        updateUIForSelectedTemplateDay();
    });
    
    addItemBtn.addEventListener('click', () => handleAddItem(false));
    addTemplateItemBtn.addEventListener('click', () => handleAddItem(true));

    // Dialog listeners
    editTemplatesBtn.addEventListener('click', () => {
        updateUIForSelectedTemplateDay(); // Ensure modal is up-to-date when opened
        templateDialog.style.display = 'flex';
    });

    closeDialogBtn.addEventListener('click', () => {
        templateDialog.style.display = 'none';
    });

    templateDialog.addEventListener('click', (e) => {
        if (e.target === templateDialog) { // Close if clicking on the overlay
            templateDialog.style.display = 'none';
        }
    });

    // Start the application
    init();
});