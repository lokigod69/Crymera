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
    currentFlipIndex = 0;
    currentRotation = 0;
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

    document.querySelector('.flip-close-button').addEventListener('click', closeFlipModal);
    document.querySelector('.flip-prev-arrow').addEventListener('click', () => flipImage(-1));
    document.querySelector('.flip-next-arrow').addEventListener('click', () => flipImage(1));
}

function closeFlipModal() {
    const modal = document.getElementById('flip-modal');
    if (modal) {
        modal.remove();
    }
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

    // Determine which side is currently hidden and set the next image there
    const isFrontVisible = Math.round(currentRotation / 180) % 2 === 0;
    if (isFrontVisible) {
        backImage.src = flipImages[nextIndex];
    } else {
        frontImage.src = flipImages[nextIndex];
    }

    // Calculate the new rotation
    currentRotation += (direction === 1 ? -180 : 180);

    gsap.to(flipContent, {
        duration: 1,
        rotationY: currentRotation,
        ease: 'power2.inOut',
        onComplete: () => {
            currentFlipIndex = nextIndex;
            isFlipping = false;
        }
    });
}
