document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const initialSampleAccounts = [
      { id: "acc1", name: "Personal Savings", password: "genericbankpassword", lastUpdated: "2023-10-15", category: "Banking", accountNumber: "123456789012", ifscCode: "BANK0001234", upiPin: "123456", netbankingId: "persavingsNB", mpin:"1122", netbankingPassword: "nbSecurePassword1", transactionPassword: "txnPassSecure1" },
      { id: "acc2", name: "Gmail Account", username: "user@example.com", password: "securegmailpassword", lastUpdated: "2023-09-20", category: "Website", website: "https://mail.google.com" },
      { id: "acc3", name: "Social Media Profile X", username: "@socialuserX", password: "socialXpassword", lastUpdated: "2023-11-01", category: "Social Media" },
      { id: "acc4", name: "Salary Account", password: "anothergenericbankpassword", lastUpdated: "2023-11-05", category: "Banking", accountNumber: "987654321098", ifscCode: "SBIN0005678", upiPin: "654321", netbankingId: "salaryNB", mpin: "3344", netbankingPassword: "nbSecurePassword2", transactionPassword: "txnPassSecure2" },
      { id: "acc5", name: "Streaming Service", username: "subscriber@email.com", password: "streamingservicepass", lastUpdated: "2023-10-25", category: "Website", website: "https://netflix.com" },
    ];
    let accounts = [...initialSampleAccounts];
    const accountCategories = ["Banking", "Social Media", "Website", "Other"];

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

    // --- UTILITY FUNCTIONS ---

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
    const renderAccounts = () => {
        accountsListContainer.innerHTML = ''; // Clear existing content
        
        if (accounts.length === 0) {
            accountsListContainer.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 0; color: var(--muted-foreground);">
                    Your vault is empty. Add your first credential securely.
                </div>
            `;
            return;
        }

        const sortedAccounts = [...accounts].sort((a, b) => a.name.localeCompare(b.name));

        accountCategories.forEach(category => {
            const filteredAccounts = sortedAccounts.filter(acc => acc.category === category);
            if (filteredAccounts.length === 0) return;

            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'category-group';
            categoryGroup.innerHTML = `<h2>${category}</h2>`;
            
            const accountsGrid = document.createElement('div');
            accountsGrid.className = 'accounts-grid';

            filteredAccounts.forEach(account => {
                const card = document.createElement('div');
                card.className = 'card display-card';
                card.dataset.accountId = account.id;

                const getIcon = (cat) => {
                    switch(cat) {
                        case 'Banking': return '<i data-lucide="landmark"></i>';
                        case 'Website': return '<i data-lucide="globe"></i>';
                        case 'Social Media': return '<i data-lucide="users"></i>';
                        default: return '';
                    }
                }
                
                const renderSensitiveInput = (id, fieldName, fieldValue) => `
                    <div class="sensitive-input-wrapper">
                        <input type="password" class="input" value="••••••••••" readonly data-field-name="${fieldName}">
                        <button class="button ghost" data-action="toggle-visibility" data-field="${fieldName}">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="button ghost" data-action="copy" data-field="${fieldName}" data-value="${fieldValue || ''}">
                            <i data-lucide="copy"></i>
                        </button>
                    </div>`;

                card.innerHTML = `
                    <div class="card-header" style="padding-bottom: 0.75rem;">
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
                            ${account.upiPin ? `<div><strong style="font-size:0.75rem;">UPI PIN:</strong>${renderSensitiveInput(account.id, 'upiPin', account.upiPin)}</div>` : ''}
                            ${account.netbankingId ? `<p class="border-t-dashed"><strong>Netbanking ID:</strong> ${account.netbankingId}</p>` : ''}
                            ${account.mpin ? `<div><strong style="font-size:0.75rem;">MPIN:</strong>${renderSensitiveInput(account.id, 'mpin', account.mpin)}</div>` : ''}
                            ${account.netbankingPassword ? `<div><strong style="font-size:0.75rem;">NB Password:</strong>${renderSensitiveInput(account.id, 'netbankingPassword', account.netbankingPassword)}</div>` : ''}
                            ${account.transactionPassword ? `<div><strong style="font-size:0.75rem;">Txn Password:</strong>${renderSensitiveInput(account.id, 'transactionPassword', account.transactionPassword)}</div>` : ''}
                        ` : `
                            ${account.password ? `<div><strong style="font-size:0.75rem;">Password:</strong>${renderSensitiveInput(account.id, 'password', account.password)}</div>` : ''}
                        `}
                    </div>
                    <div class="card-footer">
                        <button class="button outline" data-action="edit"><i data-lucide="edit"></i> Edit</button>
                        <button class="button destructive" data-action="delete"><i data-lucide="trash-2"></i> Delete</button>
                    </div>
                `;
                accountsGrid.appendChild(card);
            });
            categoryGroup.appendChild(accountsGrid);
            accountsListContainer.appendChild(categoryGroup);
        });
        
        lucide.createIcons();
    };

    // --- EVENT HANDLERS ---
    
    // Handle Adding a New Account
    const handleAddAccount = () => {
        const name = newAccountNameInput.value.trim();
        const category = newAccountCategorySelect.value;
        const username = newAccountUsernameInput.value.trim();
        const password = newAccountPasswordInput.value;

        if (!name) {
            showToast("Missing Field", "Account Name is required.", "destructive");
            return;
        }
        if (category !== "Banking" && !username) {
            showToast("Missing Field", "Username is required for this category.", "destructive");
            return;
        }
        if (category !== "Banking" && !password) {
            showToast("Missing Field", "Password is required for this category.", "destructive");
            return;
        }

        const newAccount = {
            id: `acc-${Date.now()}`,
            name: name,
            lastUpdated: new Date().toISOString().split('T')[0],
            category: category,
        };
        
        if (category === 'Banking') {
            Object.assign(newAccount, {
                accountNumber: newAccountAccountNumberInput.value.trim(),
                ifscCode: newAccountIfscCodeInput.value.trim(),
                upiPin: newAccountUpiPinInput.value,
                netbankingId: newAccountNetbankingIdInput.value.trim(),
                mpin: newAccountMpinInput.value,
                netbankingPassword: newAccountNetbankingPasswordInput.value,
                transactionPassword: newAccountTransactionPasswordInput.value,
            });
        } else {
            Object.assign(newAccount, {
                username: username,
                password: password,
            });
            if (category === 'Website') {
                newAccount.website = newAccountWebsiteInput.value.trim();
            }
        }

        accounts.push(newAccount);
        renderAccounts();

        // Reset form fields
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
        
        // Trigger category change to reset form visibility
        newAccountCategorySelect.dispatchEvent(new Event('change'));

        showToast("Account Added", `${newAccount.name} has been added to your vault.`);
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
                accounts = accounts.filter(acc => acc.id !== accountId);
                renderAccounts();
                showToast("Account Deleted", `${account.name} removed from vault.`);
                break;
            case 'edit':
                showToast("Edit Clicked", `This would open an editor for ${account.name}.`);
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

    // --- INITIALIZATION ---
    function initializeApp() {
        // Simulate loading
        setTimeout(() => {
            loader.classList.add('hidden');
            vaultContent.classList.remove('hidden');
            
            // Initial render
            renderAccounts();

            // Set up event listener for the add button
            addAccountBtn.addEventListener('click', handleAddAccount);

            // Set initial form state based on default category
            newAccountCategorySelect.dispatchEvent(new Event('change'));

        }, 750); // Simulate network/hydration delay
    }

    initializeApp();
});