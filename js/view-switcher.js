document.addEventListener('DOMContentLoaded', () => {
    initViewSwitcher();
});

function initViewSwitcher() {
    // Check if we are on a gallery page
    const galleryGrid = document.querySelector('.artwork-grid');
    if (!galleryGrid) return;

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/view-switcher.css';
    document.head.appendChild(link);

    // Create Controls with new structure
    const controls = document.createElement('div');
    controls.className = 'view-mode-controls';
    controls.innerHTML = `
        <div class="view-mode-menu-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </div>
        <div class="view-mode-buttons">
            <button class="view-mode-btn active" data-mode="default">Grid</button>
            <button class="view-mode-btn" data-mode="spiral">Spiral</button>
            <button class="view-mode-btn" data-mode="scatter">Scatter</button>
        </div>
    `;
    document.body.appendChild(controls);

    // Create Containers for new modes
    const spiralContainer = document.createElement('div');
    spiralContainer.id = 'spiral-container';
    spiralContainer.className = 'gallery-mode-container';
    spiralContainer.innerHTML = '<div class="spiral-stage"></div>';
    document.body.appendChild(spiralContainer);

    const scatterContainer = document.createElement('div');
    scatterContainer.id = 'scatter-container';
    scatterContainer.className = 'gallery-mode-container';
    document.body.appendChild(scatterContainer);

    // Collect Images
    const images = Array.from(document.querySelectorAll('.artwork-card img')).map(img => img.src);

    // Event Listeners
    controls.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-mode-btn')) {
            const mode = e.target.dataset.mode;
            switchMode(mode, images);

            // Update active button
            document.querySelectorAll('.view-mode-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
}

function switchMode(mode, images) {
    const galleryGrid = document.querySelector('.artwork-grid');
    const spiralContainer = document.getElementById('spiral-container');
    const scatterContainer = document.getElementById('scatter-container');
    const mainSection = document.querySelector('.featured-artworks');

    // Reset all
    if (mainSection) mainSection.style.display = 'none';
    spiralContainer.classList.remove('active');
    scatterContainer.classList.remove('active');
    document.body.style.overflow = 'hidden';

    if (mode === 'default') {
        if (mainSection) mainSection.style.display = 'block';
        document.body.style.overflow = 'auto';
    } else if (mode === 'spiral') {
        spiralContainer.classList.add('active');
        initSpiralMode(images);
    } else if (mode === 'scatter') {
        scatterContainer.classList.add('active');
        initScatterMode(images);
    }
}

// --- Spiral Mode Logic ---
function initSpiralMode(images) {
    const stage = document.querySelector('.spiral-stage');
    if (stage.children.length > 0) return;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'spiral-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        const theta = i * 45;
        const radius = 500;
        const y = (i - images.length / 2) * 150;

        gsap.set(div, {
            rotationY: -theta,
            transformOrigin: `50% 50% ${radius}px`,
            z: -radius,
            x: 0,
            y: y
        });
    });

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('spiral-container').classList.contains('active')) return;

        const delta = e.deltaY;
        gsap.to('.spiral-stage', {
            rotationY: `+=${delta * 0.1}`,
            y: `-=${delta * 0.5}`,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

// --- Scatter Mode Logic (Revamped) ---
function initScatterMode(images) {
    const container = document.getElementById('scatter-container');
    if (container.children.length > 0) return;

    let maxZ = 100;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'scatter-item';
        div.innerHTML = `<img src="${src}">`;
        container.appendChild(div);

        // Random Position
        const x = Math.random() * (window.innerWidth - 200);
        const y = Math.random() * (window.innerHeight - 300);
        const rotation = (Math.random() - 0.5) * 40;

        gsap.set(div, {
            x: x,
            y: y,
            rotation: rotation,
            zIndex: i + 1
        });

        // Hover Effect (GSAP)
        // Only apply if NOT dragging
        div.addEventListener('mouseenter', () => {
            if (!Draggable.get(div).isDragging) {
                gsap.to(div, {
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    zIndex: maxZ + 1, // Temporarily bring to top on hover
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        div.addEventListener('mouseleave', () => {
            if (!Draggable.get(div).isDragging) {
                gsap.to(div, {
                    scale: 1,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                    zIndex: div.dataset.originalZ || i + 1, // Restore original Z
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        // Draggable
        Draggable.create(div, {
            bounds: container,
            inertia: true,
            type: "x,y",
            zIndexBoost: false, // We manage Z manually
            onPress: function () {
                // Bring to absolute top when pressed
                maxZ++;
                this.target.dataset.originalZ = maxZ; // Update "original" Z so it stays on top after drop
                gsap.set(this.target, { zIndex: maxZ });
            },
            onDragStart: function () {
                gsap.to(this.target, {
                    scale: 1.15,
                    boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
                    duration: 0.2
                });
            },
            onDragEnd: function () {
                gsap.to(this.target, {
                    scale: 1,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                    duration: 0.2
                });
            }
        });
    });
}
