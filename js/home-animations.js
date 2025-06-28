document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // View Toggle Functionality
    const viewBtns = document.querySelectorAll('.view-btn');
    const stackedView = document.querySelector('.artwork-grid-stacked');
    const gridView = document.querySelector('.artwork-grid-normal');
    const cards = gsap.utils.toArray('.artwork-card-stacked');
    const container = document.querySelector('.artwork-grid-stacked');

    // Populate grid view with images
    const populateGrid = () => {
        const cards = document.querySelectorAll('.artwork-card-stacked');
        gridView.innerHTML = '';

        // Define which images are horizontal
        const horizontalImages = ['C1.png', 'D1.png', 'G1.png']; // Assuming G1 is the third horizontal

        cards.forEach(card => {
            const link = card.cloneNode(true);
            link.classList.remove('artwork-card-stacked');
            link.classList.add('grid-item');

            // Clean up inline styles
            link.removeAttribute('style');
            const imgContainer = link.querySelector('.artwork-image-container');
            if (imgContainer) {
                imgContainer.removeAttribute('style');
            }
            const img = link.querySelector('img');
            if (img) {
                img.removeAttribute('style');
                const src = img.getAttribute('src');
                const filename = src.split('/').pop();

                // Add orientation class
                if (horizontalImages.includes(filename)) {
                    link.classList.add('horizontal');
                } else {
                    link.classList.add('portrait');
                }
            }

            gridView.appendChild(link);
        });
    };

    populateGrid();

    // Toggle between views
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle views
            if (view === 'grid') {
                stackedView.style.display = 'none';
                gridView.style.display = 'grid';
                // Disable scroll animations
                ScrollTrigger.getAll().forEach(st => st.disable());
            } else {
                stackedView.style.display = 'block';
                gridView.style.display = 'none';
                // Re-enable scroll animations
                ScrollTrigger.getAll().forEach(st => st.enable());
            }
        });
    });

    // GSAP Animation Code (existing)
    if (!cards.length || !container) return;
    
    // More scroll distance for better control
    const scrollDistance = cards.length * window.innerHeight * 2;
    
    // Set initial states
    cards.forEach((card, i) => {
        const imgContainer = card.querySelector('.artwork-image-container');
        
        gsap.set(imgContainer, {
            scale: i === 0 ? 1 : 0,
            opacity: i === 0 ? 1 : 0,
            zIndex: cards.length - i
        });
    });
    
    // Create timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: `+=${scrollDistance}`,
            pin: true,
            scrub: 0.3,
            anticipatePin: 1,
            markers: false
        }
    });
    
    // Build sequential animations - NO OVERLAP
    cards.forEach((card, i) => {
        if (i < cards.length - 1) {
            const currentImg = card.querySelector('.artwork-image-container');
            const nextImg = cards[i + 1].querySelector('.artwork-image-container');
            
            const segmentDuration = 2;
            const startPos = i * segmentDuration;
            
            // Phase 1: Current image slowly starts shrinking (first few scrolls)
            tl.to(currentImg, {
                scale: 0.7,
                duration: segmentDuration * 0.3,
                ease: 'power1.in'
            }, startPos);
            
            // Phase 2: Current image rapidly shrinks to near-invisible
            tl.to(currentImg, {
                scale: 0.05, // Extremely small but not 0
                opacity: 0.1,
                duration: segmentDuration * 0.3,
                ease: 'power3.in'
            });
            
            // Phase 3: Current image completely disappears
            tl.to(currentImg, {
                scale: 0,
                opacity: 0,
                duration: segmentDuration * 0.1,
                ease: 'none'
            });
            
            // Phase 4: Next image appears from tiny size AFTER current is gone
            tl.to(nextImg, {
                scale: 0.05,
                opacity: 0.1,
                duration: 0.01, // Instant appearance at tiny size
                ease: 'none'
            });
            
            // Phase 5: Next image grows to full size
            tl.to(nextImg, {
                scale: 1,
                opacity: 1,
                duration: segmentDuration * 0.3,
                ease: 'power2.out'
            });
        }
    });
});
