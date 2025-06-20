/* 
  Enhanced slideshow script for Crymare Gallery homepage.
  - Handles automatic slideshow with 5-second intervals
  - Working left/right arrow controls
  - Clickable dot navigation
  - Smooth sliding animations
  - Pause on hover functionality
*/

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0) {
        // Initialize slideshow
        updateSlideshow();
        startAutoSlide();

        // Arrow button functionality
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoSlide();
            });
        }

        // Dot navigation functionality
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoSlide();
            });
        });

        // Pause on hover
        if (slideshowContainer) {
            slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
            slideshowContainer.addEventListener('mouseleave', startAutoSlide);
        }

        // Functions
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            updateSlideshow();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateSlideshow();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlideshow();
        }

        function updateSlideshow() {
            // Update slides
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                if (index === currentSlide) {
                    slide.classList.add('active');
                }
            });

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.remove('active');
                if (index === currentSlide) {
                    dot.classList.add('active');
                }
            });
        }

        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
        }

        function resetAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }
    }
});

// Global function for dot clicks (keeping for backward compatibility)
function currentSlide(index) {
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');
    
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index - 1) {
            slide.classList.add('active');
        }
    });

    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === index - 1) {
            dot.classList.add('active');
        }
    });
} 