document.addEventListener('DOMContentLoaded', () => {
    const mainImageLink = document.getElementById('gallery-a-main-image');
    if (mainImageLink) {
        mainImageLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    const images = [
        'assets/1a.png',
        'assets/1b.png',
        'assets/1c.png',
        'assets/1d.png',
        'assets/1e.png',
        'assets/1f.png'
    ];
    let currentIndex = 0;

    function openModal() {
        // Create and add the modal to the body
        const modalHTML = `
            <div class="fullscreen-modal active" id="fullscreen-modal">
                <span class="close-button">&times;</span>
                <span class="nav-arrow prev-arrow">&lt;</span>
                <div class="modal-content">
                    <img src="${images[currentIndex]}" id="fullscreen-image">
                </div>
                <span class="nav-arrow next-arrow">&gt;</span>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners for the modal elements
        document.querySelector('.close-button').addEventListener('click', closeModal);
        document.querySelector('.prev-arrow').addEventListener('click', () => changeImage(-1));
        document.querySelector('.next-arrow').addEventListener('click', () => changeImage(1));
    }

    function closeModal() {
        const modal = document.getElementById('fullscreen-modal');
        if (modal) {
            modal.remove();
        }
    }

    function changeImage(direction) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < images.length) {
            currentIndex = newIndex;
            const imageElement = document.getElementById('fullscreen-image');
            const rotationY = direction === 1 ? -180 : 180;

            gsap.to(imageElement, {
                duration: 0.5,
                rotationY: `+=${rotationY}`,
                onComplete: () => {
                    imageElement.src = images[currentIndex];
                    gsap.fromTo(imageElement, { rotationY: `+=${rotationY}` }, { duration: 0.5, rotationY: '+=0' });
                }
            });
        }
    }
});
