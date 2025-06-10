// assets/js/testimonial-slider.js

function initTestimonialSlider() {
    const sliderContainer = document.querySelector('.testimonial-slider-container');
    if (!sliderContainer) {
        // console.log("Testimonial slider container not found. Slider not initialized.");
        return;
    }

    const track = sliderContainer.querySelector('.testimonial-track');
    const cards = sliderContainer.querySelectorAll('.testimonial-card');
    const prevButton = sliderContainer.querySelector('.prev-slide');
    const nextButton = sliderContainer.querySelector('.next-slide');

    if (!track || cards.length === 0 || !prevButton || !nextButton) {
        // console.log("Required slider elements missing. Slider not initialized.");
        if(cards.length <= 1 && prevButton && nextButton) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }
        return;
    }

    let currentIndex = 0;
    const totalSlides = cards.length;

    function updateSliderPosition() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateNavButtons();
    }

    function updateNavButtons() {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === totalSlides - 1;
    }

    function showNextSlide() {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateSliderPosition();
        }
    }

    function showPrevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    }

    prevButton.addEventListener('click', showPrevSlide);
    nextButton.addEventListener('click', showNextSlide);

    // Initial setup
    updateSliderPosition();

    // Optional: Add swipe support or auto-play later if needed
    // Optional: Recalculate on resize if card widths are not percentage-based (not strictly necessary here as it's 100%)
    // window.addEventListener('resize', updateSliderPosition);
    console.log("Testimonial slider initialized.");
}

// Make it available globally or ensure it's called after DOM content is ready and populated
// If main.js calls it, it's fine. Otherwise:
// document.addEventListener('DOMContentLoaded', initTestimonialSlider);
// However, since main.js populates the cards, it's better to call it from there.
