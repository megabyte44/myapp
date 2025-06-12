
Memoria - Your All-in-One Personal Dashboard



Memoria is a comprehensive, client-side personal dashboard designed to help you organize your life. It combines multiple essential tools into a single, intuitive interface. Built entirely with HTML, CSS, and vanilla JavaScript, Memoria runs completely in your browser, ensuring your data remains private and secure on your own machine.

This project serves as a powerful demonstration of building a dynamic, single-page application (SPA) without relying on heavy frameworks.

✨ Features

Memoria integrates several key modules to help you stay on top of your daily activities:

📊 Dashboard: A high-level overview of your day, showing upcoming schedule items, today's to-do list, and a snapshot of your finances.

✅ To-Do List: A classic task manager to add, track, and complete your daily tasks.

💰 Expense Tracker: A simple yet effective tool to log your income and expenses, set a monthly budget, and monitor your spending.

🗓️ Daily Planner: A time-blocking scheduler to plan your week, create recurring daily templates, and add ad-hoc events.

🏋️ Gym Tracker: A dedicated fitness log to plan your workout cycles, track your exercises, monitor protein intake, and view your progress on a calendar.

🔑 Password Vault: A secure place to store account credentials and sensitive information locally.

📝 Secure Notes: A simple note-taking feature for your private thoughts and information.

💡 Idea Capture: A space to quickly jot down ideas and organize them for future development.

🚀 Getting Started

Since this is a client-side application, getting started is incredibly simple. You do not need a complex build process or backend server.

Prerequisites

A modern web browser (Chrome, Firefox, Edge, Safari).

A local web server to handle browser security policies (CORS).

Installation & Running

Clone the repository:

git clone https://github.com/your-username/memoria.git
cd memoria


Use a Local Server (Required):
Modern browsers block certain JavaScript features (like fetch for loading local files, which was used in earlier versions) when you open a file directly from the filesystem (file://...). You must serve the project from a local server.

The Easiest Method: VS Code Live Server

If you have Visual Studio Code, install the Live Server extension.

Open the memoria project folder in VS Code.

Right-click on index.html and select "Open with Live Server".

Alternative Method: Python

If you have Python installed, navigate to the project directory in your terminal and run:

For Python 3: python -m http.server

For Python 2: python -m SimpleHTTPServer

Then open http://localhost:8000 in your browser.

You're ready!
The application will open in your browser, and you can start using it immediately.

🛠️ How It Works: Technical Overview

Memoria is built as a Single Page Application (SPA). This architecture provides a fast and fluid user experience, similar to a native desktop app.

Core Structure (index.html): The application shell (sidebar, header) is defined once. The content for each "page" (Dashboard, To-Do List, etc.) is stored within <script type="text/template"> tags. This keeps all the HTML in one file for simplicity.

Dynamic Content Loading (script.js):

A simple client-side "router" listens for clicks on the navigation links.

When a link is clicked, JavaScript finds the corresponding <script> template by its ID.

The innerHTML of the template is injected into the main content area (<main id="main-content">).

A specific initialization function (e.g., initializeToDoListPage()) is called to attach event listeners and load data for that newly visible content. This modular approach keeps the code for each feature isolated and organized.

Data Persistence (localStorage):

All user data (tasks, expenses, schedules, etc.) is saved directly in the browser's localStorage.

This makes the app persistent—your data will be there when you close and reopen the browser tab.

Privacy Note: Because localStorage is used, all your data stays on your computer. It is never sent to an external server.

📁 File Structure
memoria/
├── 📄 index.html      # The main application shell and all page templates.
├── 🎨 style.css       # All the styling for the application.
└── ⚙️ script.js        # All JavaScript logic, including the router and feature-specific code.
└── 📄 README.md        # This file.
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END
🤝 Contributing

This project is primarily a personal tool and a technical demonstration. However, contributions and suggestions are welcome! Feel free to fork the repository, make improvements, and submit a pull request.
