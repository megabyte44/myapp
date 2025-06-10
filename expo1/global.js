// js/global.js

document.addEventListener('DOMContentLoaded', () => {

    const contentContainer = document.getElementById('main-content-container');
    const defaultPage = 'dashboard.html';

    // --- 1. Function to Load Content Dynamically ---
    // Replace the entire loadContent function with this more robust version

const loadContent = async (url) => {
    try {
        contentContainer.innerHTML = '<p class="loading">Loading...</p>';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }
        const html = await response.text();

        // Use a temporary div to parse the fetched HTML in memory
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Find scripts BEFORE injecting content into the main page
        const scripts = tempDiv.querySelectorAll('script');

        // Clear the main container and inject the new content
        contentContainer.innerHTML = '';
        // This moves all the nodes (elements, text, etc.) from the temp div
        while (tempDiv.firstChild) {
            contentContainer.appendChild(tempDiv.firstChild);
        }

        // Now, execute the scripts that were found
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            // Copy all attributes (like src, async, defer)
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Copy inline script content
            if (oldScript.innerHTML) {
                newScript.text = oldScript.innerHTML;
            }
            // Append to the body to execute, then immediately remove to keep the DOM clean
            document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });

        // Update the active link in the sidebar
        updateActiveLink(url);

    } catch (error) {
        console.error('Failed to load page:', error);
        contentContainer.innerHTML = `<p>Sorry, the content for <b>${url}</b> could not be loaded. Please check that the file exists and there are no errors in the console.</p>`;
    }
    };
    // --- 2. Function to Update Active Link in Sidebar ---
    const updateActiveLink = (url) => {
        const navLinks = document.querySelectorAll('.sidebar-nav a.nav-link');
        navLinks.forEach(link => {
            // Normalize href to match the URL parameter
            if (link.getAttribute('href') === url) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // --- 3. Hijack Link Clicks ---
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link');
        
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (window.location.pathname.endsWith(href)) return;
            history.pushState({ path: href }, '', href);
            loadContent(href);
        }
    });

    // --- 4. Handle Browser Back/Forward Buttons ---
    window.addEventListener('popstate', (e) => {
        const path = e.state ? e.state.path : defaultPage;
        loadContent(path);
    });

    // --- 5. Initial Page Load ---
    // *** FIX 2: SIMPLIFIED INITIAL LOAD ***
    // This correctly loads the dashboard on the first visit.
    let initialPath = window.location.pathname.substring(1);
    if (initialPath === '' || initialPath === 'index.html') {
        initialPath = defaultPage;
    }
    loadContent(initialPath);
    history.replaceState({ path: initialPath }, '', initialPath);

    // --- 6. Mobile Sidebar Toggle Functionality ---
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }
});