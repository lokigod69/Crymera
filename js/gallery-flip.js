document.addEventListener('DOMContentLoaded', () => {
    const triggerImages = document.querySelectorAll('.flip-gallery-trigger');
    triggerImages.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const imagesAttr = trigger.getAttribute('data-flip-images');
            if (imagesAttr) {
                try {
                    const images = JSON.parse(imagesAttr);
                    if (Array.isArray(images) && images.length > 0) {
                        openFlipModal(images);
                    }
                } catch (error) {
                    console.error('Error parsing flip images data:', error);
                }
            }
        });
    });
});

let flipImages = [];
let currentFlipIndex = 0;
let isFlipping = false;
let currentRotation = 0;

function openFlipModal(images) {
    flipImages = images;
    // Reset state for a fresh modal session
    currentFlipIndex = 0;
    currentRotation = 0; // Reset rotation for each new modal
    isFlipping = false;

    const modalHTML = `
        <div class="flip-modal active" id="flip-modal">
            <span class="flip-close-button">&times;</span>
            <span class="flip-nav-arrow flip-prev-arrow">&lt;</span>
            <div class="flip-content" id="flip-content">
                <div class="flip-image-container flip-front">
                    <img src="${flipImages[currentFlipIndex]}" alt="Flip Image">
                </div>
                <div class="flip-image-container flip-back">
                    <img src="" alt="Flip Image">
                </div>
            </div>
            <span class="flip-nav-arrow flip-next-arrow">&gt;</span>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    const flipContent = document.getElementById('flip-content');

    // Add touch/click controls for mobile
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        flipContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('flip-nav-arrow')) {
                return;
            }

            const rect = flipContent.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const halfWidth = rect.width / 2;

            if (clickX < halfWidth) {
                flipImage(-1); // Clicked on left half, go back
            } else {
                flipImage(1); // Clicked on right half, go forward
            }
        });
    }

    document.querySelector('.flip-close-button').addEventListener('click', closeFlipModal);
    document.querySelector('.flip-prev-arrow').addEventListener('click', () => flipImage(-1));
    document.querySelector('.flip-next-arrow').addEventListener('click', () => flipImage(1));
    
    // Tap to close
    document.getElementById('flip-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('flip-modal')) {
            closeFlipModal();
        }
    });

    // Swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;

    flipContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    flipContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // minimum distance for a swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            flipImage(1); // Swiped left
        } else if (touchEndX > touchStartX + swipeThreshold) {
            flipImage(-1); // Swiped right
        }
    }

    // Set initial rotation explicitly
    gsap.set(flipContent, { rotationY: 0 });
}

function closeFlipModal() {
    const modal = document.getElementById('flip-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function flipImage(direction) {
    if (isFlipping) {
        return; // Animation in progress
    }
    isFlipping = true;

    let nextIndex = currentFlipIndex + direction;

    if (nextIndex >= flipImages.length) {
        nextIndex = 0; // Loop to the first image
    } else if (nextIndex < 0) {
        nextIndex = flipImages.length - 1; // Loop to the last image
    }

    const flipContent = document.getElementById('flip-content');
    const frontImage = flipContent.querySelector('.flip-front img');
    const backImage = flipContent.querySelector('.flip-back img');

    // Determine which face is currently visible
    // We use the currentRotation variable which tracks the target rotation
    // This is more reliable than reading the current GSAP value which might be mid-animation (though we check isFlipping)
    const currentRotationNormalized = currentRotation % 360;
    const isFrontVisible = currentRotationNormalized === 0 || currentRotationNormalized === 360 || currentRotationNormalized === -360;

    // If front is visible, we want to put the NEW image on the BACK
    // If back is visible, we want to put the NEW image on the FRONT
    if (isFrontVisible) {
        backImage.src = flipImages[nextIndex];
    } else {
        frontImage.src = flipImages[nextIndex];
    }

    const targetRotation = currentRotation + (direction * 180);

    gsap.to(flipContent, {
        duration: 0.8,
        rotationY: targetRotation,
        ease: "power2.inOut",
        onComplete: () => {
            currentRotation = targetRotation;
            currentFlipIndex = nextIndex;
            isFlipping = false;

            // Sync both images to the current one to prevent flickering if we flip again quickly
            // and to ensure the "hidden" side is ready for the next flip (which will put the NEXT image on it)
            // Actually, we don't strictly need to update the hidden one yet, but it keeps state clean.
            // The critical part is that the VISIBLE one is now correct.
            if (isFrontVisible) {
                // We just flipped to BACK. Back is visible.
                // Front is hidden.
                frontImage.src = flipImages[nextIndex]; 
            } else {
                // We just flipped to FRONT. Front is visible.
                // Back is hidden.
                backImage.src = flipImages[nextIndex];
            }
        }
    });
}
