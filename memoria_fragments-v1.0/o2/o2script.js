document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & CONSTANTS ---
    const LOCAL_STORAGE_KEY_BUDGET = 'memoriaAppMonthlyBudget';
    const LOCAL_STORAGE_KEY_TRANSACTIONS = 'memoriaAppTransactions';
    const DEFAULT_MONTHLY_BUDGET_PAISA = 200000; // 2000.00
    const transactionCategories = ["Food", "Transport", "Shopping", "Utilities", "Health", "Entertainment", "Income", "Other"];

    let transactions = [];
    let monthlyBudgetPaisa = DEFAULT_MONTHLY_BUDGET_PAISA;

    // --- DOM ELEMENT SELECTORS ---
    const loadingStateEl = document.getElementById('loading-state');
    const mainContentEl = document.getElementById('main-content');

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

            row.innerHTML = `
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>${t.description}</td>
                <td><span class="badge ${badgeClass}">${t.category}</span></td>
                <td class="text-right font-medium ${amountClass}">${amountSign}${formatCurrency(Math.abs(t.amount))}</td>
                <td class="text-center">
                    <div class="table-actions">
                        <button class="button button-ghost edit-btn" data-id="${t.id}" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button class="button button-ghost delete-btn text-destructive" data-id="${t.id}" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                    </div>
                </td>
            `;
            transactionsTableBody.appendChild(row);
        });
    };
    
    // --- EVENT HANDLERS ---
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

    const handleAddTransaction = () => {
        if (!newTxnDescription.value.trim() || !newTxnAmount.value.trim()) {
            showToast({ title: "Missing Fields", description: "Please fill in description and amount.", variant: "destructive" });
            return;
        }
        const amountInPaisa = Math.round(parseFloat(newTxnAmount.value) * 100);
        if (isNaN(amountInPaisa)) {
            showToast({ title: "Invalid Amount", description: "Please enter a valid number.", variant: "destructive" });
            return;
        }

        const newTransaction = {
            id: `txn-${Date.now()}`,
            date: newTxnDate.value,
            description: newTxnDescription.value,
            category: newTxnCategory.value,
            type: newTxnType.value,
            amount: newTxnType.value === 'expense' ? -Math.abs(amountInPaisa) : Math.abs(amountInPaisa),
        };
        
        transactions.push(newTransaction);
        showToast({ title: "Transaction Added", description: `${newTransaction.description} has been added.` });
        saveData();
        renderAll();
        closeDialog();
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
            saveTxnBtn.addEventListener('click', handleAddTransaction);
            transactionDialog.addEventListener('click', (e) => {
                if (e.target === transactionDialog) closeDialog();
            });

            transactionsTableBody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-btn');
                const deleteBtn = e.target.closest('.delete-btn');
                if (editBtn) handleEditTransaction(editBtn.dataset.id);
                if (deleteBtn) handleDeleteTransaction(deleteBtn.dataset.id);
            });

        }, 500); // Simulate loading
    };

    init();
});