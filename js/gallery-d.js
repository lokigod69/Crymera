document.addEventListener('DOMContentLoaded', () => {
    const galleryD = document.querySelector('.featured-artworks .artwork-grid-d');
    if (galleryD) {
        const imageLinks = galleryD.querySelectorAll('.artwork-card');
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
let cycleTrack;

function openCycleModal(images, index) {
    cycleImages = images;
    currentCycleIndex = index;

    const firstImageClone = `<img src="${images[0]}" alt="Gallery Image" aria-hidden="true">`;
    const lastImageClone = `<img src="${images[images.length - 1]}" alt="Gallery Image" aria-hidden="true">`;
    const imageElements = images.map(src => `<img src="${src}" alt="Gallery Image">`).join('');

    const modalHTML = `
        <div class="cycle-modal active" id="cycle-modal">
            <span class="cycle-close-button">&times;</span>
            <span class="cycle-nav-arrow cycle-prev-arrow">&lt;</span>
            <div class="cycle-content">
                <div class="cycle-track">${lastImageClone}${imageElements}${firstImageClone}</div>
            </div>
            <span class="cycle-nav-arrow cycle-next-arrow">&gt;</span>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';

    cycleTrack = document.querySelector('.cycle-track');
    gsap.set(cycleTrack, { x: -(currentCycleIndex + 1) * 100 + '%' });

    document.querySelector('.cycle-close-button').addEventListener('click', closeCycleModal);
    document.querySelector('.cycle-prev-arrow').addEventListener('click', () => cycleImage(-1));
    document.querySelector('.cycle-next-arrow').addEventListener('click', () => cycleImage(1));
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
    
    gsap.to(cycleTrack, { 
        duration: 0.5, 
        x: -(currentCycleIndex + 1) * 100 + '%', 
        ease: 'power2.inOut',
        onComplete: () => {
            if (currentCycleIndex >= cycleImages.length) {
                currentCycleIndex = 0;
                gsap.set(cycleTrack, { x: '-100%' });
            } else if (currentCycleIndex < 0) {
                currentCycleIndex = cycleImages.length - 1;
                gsap.set(cycleTrack, { x: -(cycleImages.length) * 100 + '%' });
            }
        }
    });
}
