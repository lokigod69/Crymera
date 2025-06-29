document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // GSAP config for better mobile performance
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const viewBtns = document.querySelectorAll('.view-btn');
    const stackedView = document.querySelector('.artwork-grid-stacked');
    const gridView = document.querySelector('.artwork-grid-normal');
    const body = document.body;
    const cards = gsap.utils.toArray('.artwork-card-stacked');
    const container = document.querySelector('.artwork-grid-stacked');

    if (!cards.length || !container) return;

    const populateGrid = () => {
        gridView.innerHTML = '';
        const addedImages = new Set();
        const horizontalImages = ['C1.png', 'D1.png', 'G1.png'];

        cards.forEach((card) => {
            const img = card.querySelector('img');
            const imgSrc = img?.src;

            if (imgSrc && addedImages.has(imgSrc)) return;
            if(imgSrc) addedImages.add(imgSrc);

            const link = card.cloneNode(true);
            link.classList.remove('artwork-card-stacked');
            link.classList.add('grid-item');

            link.removeAttribute('style');
            const imgContainer = link.querySelector('.artwork-image-container');
            if (imgContainer) {
                imgContainer.removeAttribute('style');
            }
            const linkImg = link.querySelector('img');
            if (linkImg) {
                linkImg.removeAttribute('style');
                const filename = imgSrc.split('/').pop();
                if (horizontalImages.includes(filename)) {
                    link.classList.add('horizontal');
                } else {
                    link.classList.add('portrait');
                }
            }

            gridView.appendChild(link);
        });
    };

    const updateAllToggles = (activeView) => {
        document.querySelectorAll('.view-btn').forEach(btn => {
            if (btn.dataset.view === activeView) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    const switchView = (view) => {
        if (view === 'grid') {
            stackedView.style.display = 'none';
            gridView.style.display = 'grid';
            body.classList.add('grid-active');
            ScrollTrigger.getAll().forEach(st => st.disable());
            document.querySelector('.featured-artworks').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            stackedView.style.display = 'block';
            gridView.style.display = 'none';
            body.classList.remove('grid-active');
            ScrollTrigger.getAll().forEach(st => st.enable());
            ScrollTrigger.refresh();
        }
        updateAllToggles(view);
    };

    populateGrid();

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.view);
        });
    });

    const bottomToggle = document.querySelector('.view-toggle-bottom');
    if (bottomToggle) {
        bottomToggle.style.opacity = '0';
        bottomToggle.style.transition = 'opacity 0.5s ease';
        
        ScrollTrigger.create({
            trigger: stackedView,
            start: 'bottom 80%',
            onEnter: () => {
                bottomToggle.style.opacity = '1';
            },
            onLeaveBack: () => {
                bottomToggle.style.opacity = '0';
            }
        });
    }

    const isMobile = window.innerWidth <= 768;

    // --- Mobile-Optimized GSAP Stacked Scroll Animation ---
    if (stackedView.style.display !== 'none') {
        // Set initial positions for all cards
        cards.forEach((card, i) => {
            gsap.set(card, {
                zIndex: cards.length - i,
                yPercent: i === 0 ? 0 : 100, // Start first card in view, others below
                opacity: i === 0 ? 1 : 0.5 // First card is visible, others are faded
            });
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: () => `+=${(cards.length - 1) * window.innerHeight}`,
                pin: true,
                scrub: 1, // Smoother scrub value for touch
                anticipatePin: 1,
                markers: false,
                invalidateOnRefresh: true // Recalculate on resize
            }
        });

        // Animate cards sequentially
        cards.forEach((card, i) => {
            if (i < cards.length - 1) {
                const nextCard = cards[i + 1];

                tl.to(card, {
                    yPercent: -100, // Move current card up and out of view
                    opacity: 0.5, // Fade it out
                    ease: 'power2.inOut',
                    duration: 1
                })
                .to(nextCard, {
                    yPercent: 0, // Move next card into view
                    opacity: 1, // Fade it in
                    ease: 'power2.inOut',
                    duration: 1
                }, '-=1'); // Start this animation at the same time as the previous one
            }
        });
    }
});
