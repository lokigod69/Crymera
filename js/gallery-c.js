document.addEventListener('DOMContentLoaded', () => {
    const galleryC = document.querySelector('.artwork-grid-c');
    if (galleryC) {
        const imageLinks = galleryC.querySelectorAll('.artwork-card');
        const images = Array.from(imageLinks).map(link => link.querySelector('img').src);

        imageLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openCycleModal(images, index);
            });
        });
    }
});

let currentCycleIndex = 0;
let cycleImages = [];

function openCycleModal(images, index) {
    cycleImages = images;
    currentCycleIndex = index;

    const imageElements = images.map(src => `<img src="${src}" alt="Gallery Image">`).join('');

    const modalHTML = `
        <div class="cycle-modal active" id="cycle-modal">
            <span class="cycle-close-button">&times;</span>
            <span class="cycle-nav-arrow cycle-prev-arrow">&lt;</span>
            <div class="cycle-content">
                <div class="cycle-track">${imageElements}</div>
            </div>
            <span class="cycle-nav-arrow cycle-next-arrow">&gt;</span>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    const track = document.querySelector('.cycle-track');
    gsap.set(track, { x: -currentCycleIndex * 100 + '%' });

    document.querySelector('.cycle-close-button').addEventListener('click', closeCycleModal);
    document.querySelector('.cycle-prev-arrow').addEventListener('click', () => cycleImage(-1));
    document.querySelector('.cycle-next-arrow').addEventListener('click', () => cycleImage(1));

    // Tap to close
    document.getElementById('cycle-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('cycle-modal')) {
            closeCycleModal();
        }
    });

    // Swipe gestures
    const cycleContent = document.querySelector('.cycle-content');
    let touchStartX = 0;
    let touchEndX = 0;

    cycleContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    cycleContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // minimum distance for a swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            cycleImage(1); // Swiped left
        } else if (touchEndX > touchStartX + swipeThreshold) {
            cycleImage(-1); // Swiped right
        }
    }
}

function closeCycleModal() {
    const modal = document.getElementById('cycle-modal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto';
}

function cycleImage(direction) {
    currentCycleIndex += direction;

    if (currentCycleIndex >= cycleImages.length) {
        currentCycleIndex = 0;
    } else if (currentCycleIndex < 0) {
        currentCycleIndex = cycleImages.length - 1;
    }

    const track = document.querySelector('.cycle-track');
    if (track) {
        gsap.to(track, { 
            duration: 0.5, 
            x: -currentCycleIndex * 100 + '%', 
            ease: 'power2.inOut' 
        });
    }
}
