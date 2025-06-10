// assets/js/theme-switcher.js

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn'); // Select all theme toggle buttons
    const currentTheme = localStorage.getItem('theme');

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        const buttonText = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        themeToggleButtons.forEach(button => {
            if (button) { // Check if button exists
                button.textContent = buttonText;
            }
        });
    }

    // Apply saved theme on load or default
    if (currentTheme) {
        applyTheme(currentTheme);
    } else { // Default to light mode if no preference saved
        applyTheme('light'); // Explicitly set light if nothing saved
    }

    themeToggleButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                let theme = 'light';
                // Toggle and check the new state
                document.body.classList.toggle('dark-mode'); 
                if (document.body.classList.contains('dark-mode')) {
                    theme = 'dark';
                }
                
                localStorage.setItem('theme', theme);
                applyTheme(theme); // Update button text for all buttons
            });
        }
    });
});