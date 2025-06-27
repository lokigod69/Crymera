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

    document.querySelector('.flip-close-button').addEventListener('click', closeFlipModal);
    document.querySelector('.flip-prev-arrow').addEventListener('click', () => flipImage(-1));
    document.querySelector('.flip-next-arrow').addEventListener('click', () => flipImage(1));
    
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

    // Determine which face is visible and update the hidden one
    const isFrontVisible = Math.round(gsap.getProperty(flipContent, "rotationY") / 180) % 2 === 0;

    if (isFrontVisible) {
        backImage.src = flipImages[nextIndex];
    } else {
        frontImage.src = flipImages[nextIndex];
    }

    const targetRotation = currentRotation + 180 * direction;

    gsap.to(flipContent, {
        duration: 1.2, // Slower animation
        rotationY: targetRotation,
        ease: "power2.inOut",
        onComplete: () => {
            currentRotation = targetRotation;
            currentFlipIndex = nextIndex;
            isFlipping = false;

            // After the flip, the back becomes the new front
            // To simplify, we can just update the src of both images
            // so the next flip is always from the correct state.
            if (isFrontVisible) {
                frontImage.src = flipImages[nextIndex];
            } else {
                backImage.src = flipImages[nextIndex];
            }
        }
    });
}
