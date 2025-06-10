// assets/js/animations.js

document.addEventListener('DOMContentLoaded', () => {
    // Page Load Animation
    const mainContent = document.querySelector('main');
    if (mainContent) {
        // Delay slightly to ensure CSS is parsed and initial state is set
        setTimeout(() => {
            mainContent.classList.add('loaded');
        }, 100); // Small delay
    }

    // Scroll-triggered Animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target); // Animate only once
                }
            });
        }, {
            root: null, // viewport
            threshold: 0.1, // 10% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Trigger a bit before it's fully in view from bottom
        });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
});
