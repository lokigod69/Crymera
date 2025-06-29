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

    // --- GSAP Stacked Scroll Animation ---
    if (stackedView.style.display !== 'none') {
        // Pure size-based bell curve animation
        const cards = gsap.utils.toArray('.artwork-card-stacked');
        const container = document.querySelector('.artwork-grid-stacked');
        if (!cards.length || !container) return;

        const isMobile = window.innerWidth <= 768;
        const scrollDistance = cards.length * window.innerHeight * 2.5; // More distance for smooth curves

        // Initial states: first image full size, others hidden
        cards.forEach((card, i) => {
            const img = card.querySelector('.artwork-image-container');
            gsap.set(img, {
                scale: i === 0 ? 1 : 0,
                opacity: 1,
                zIndex: cards.length - i
            });
        });

        // Optional custom bell curve ease
        if (gsap.registerEase) {
            gsap.registerEase("bellCurve", p => Math.sin(p * Math.PI));
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: `+=${scrollDistance}`,
                pin: true,
                scrub: isMobile ? 0.1 : 0.3,
                anticipatePin: 1,
                markers: false,
                onLeave: () => { stackedView.style.display = 'none'; },
                onEnterBack: () => { stackedView.style.display = 'block'; }
            }
        });

        // Clear existing timeline tweens and rebuild sequentially
        tl.clear();
        cards.forEach((card, i) => {
            if (i < cards.length - 1) {
                const currImg = card.querySelector('.artwork-image-container');
                const nextImg = cards[i + 1].querySelector('.artwork-image-container');
                const seg = 3;

                tl.to(currImg, { scale: 0.8, duration: seg * 0.3, ease: 'power1.in' })
                  .to(currImg, { scale: 0.1, duration: seg * 0.4, ease: 'power3.inOut' })
                  .to(currImg, { scale: 0,   duration: seg * 0.3, ease: 'power1.out' })
                  .set(nextImg, { scale: 0 })
                  .to(nextImg, { scale: 0.2, duration: seg * 0.3, ease: 'power1.in' })
                  .to(nextImg, { scale: 0.9, duration: seg * 0.4, ease: 'power3.inOut' })
                  .to(nextImg, { scale: 1,   duration: seg * 0.3, ease: 'power1.out' });
            }
        });
    }
});
