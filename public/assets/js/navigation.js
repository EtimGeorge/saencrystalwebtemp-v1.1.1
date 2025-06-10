// assets/js/navigation.js

document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');
    const navCloseBtn = document.querySelector('.nav-close-btn'); // Get the close button

    function toggleNav(isOpen) {
        if (navLinksContainer) {
            navLinksContainer.classList.toggle('nav-open', isOpen);
        }
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', isOpen.toString());
        }
        document.body.classList.toggle('no-scroll', isOpen); // Toggle scroll lock on body
    }

    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navLinksContainer.classList.contains('nav-open');
            toggleNav(!isExpanded);
        });
    }

    if (navCloseBtn && navLinksContainer) {
        navCloseBtn.addEventListener('click', () => {
            toggleNav(false); // Always close
        });
    }
    
    // Close nav when a link inside is clicked (for SPA-like behavior or jumping to sections)
    if (navLinksContainer) {
        const linksInsideNav = navLinksContainer.querySelectorAll('a.nav-link');
        linksInsideNav.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('nav-open')) {
                    // Check if it's an on-page link before closing immediately
                    // For this template, all nav links navigate, so close.
                    toggleNav(false);
                }
            });
        });
    }


    // Smooth scroll for on-page anchor links
    const onPageLinks = document.querySelectorAll('a[href^="#"]');
    const header = document.querySelector('header');
    
    onPageLinks.forEach(link => {
        if (!link.dataset.smoothScrollAttached) { 
            link.addEventListener('click', function (event) {
                const headerHeight = header ? header.offsetHeight : 0; // Recalculate header height on click
                const targetId = this.getAttribute('href');

                if (targetId === '#top' || targetId === '#') { 
                    event.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            event.preventDefault();
                            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    } catch (e) {
                        // If querySelector fails (e.g. invalid ID), let the browser handle it or log error
                        console.warn(`Smooth scroll target not found or invalid: ${targetId}`, e);
                    }
                }
            });
            link.dataset.smoothScrollAttached = 'true';
        }
    });
});