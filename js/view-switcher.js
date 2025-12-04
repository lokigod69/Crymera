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

    // Create Controls
    const controls = document.createElement('div');
    controls.className = 'view-mode-controls';
    controls.innerHTML = `
        <button class="view-mode-btn active" data-mode="default">Grid</button>
        <button class="view-mode-btn" data-mode="spiral">Spiral</button>
        <button class="view-mode-btn" data-mode="scatter">Scatter</button>
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
    const mainSection = document.querySelector('.featured-artworks'); // To hide/show the main grid area

    // Reset all
    if (mainSection) mainSection.style.display = 'none';
    spiralContainer.classList.remove('active');
    scatterContainer.classList.remove('active');
    document.body.style.overflow = 'hidden'; // Default for immersive modes

    if (mode === 'default') {
        if (mainSection) mainSection.style.display = 'block';
        document.body.style.overflow = 'auto';
        // Clean up other modes if needed
    } else if (mode === 'spiral') {
        spiralContainer.classList.add('active');
        initSpiralMode(images);
    } else if (mode === 'scatter') {
        scatterContainer.classList.add('active');
        initScatterMode(images);
    }
}

// --- Spiral Mode Logic ---
let spiralTimeline;

function initSpiralMode(images) {
    const stage = document.querySelector('.spiral-stage');
    if (stage.children.length > 0) return; // Already initialized

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'spiral-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        // Position in a spiral
        const angle = i * 0.5; // Radian step
        const radius = 400;
        const y = i * 100 - (images.length * 50); // Vertical spread

        gsap.set(div, {
            y: y,
            z: -radius,
            rotationY: 0
        });
    });

    // Animate the spiral
    // We want the whole stage to rotate
    // Or we can arrange them in a circle and rotate the container

    // Better Spiral Layout:
    // x = r * cos(theta)
    // z = r * sin(theta)
    // y = linear

    const items = document.querySelectorAll('.spiral-item');
    items.forEach((item, i) => {
        const theta = i * 45; // 45 degrees per item
        const radius = 500;
        const y = (i - items.length / 2) * 150;

        gsap.set(item, {
            rotationY: -theta,
            transformOrigin: `50% 50% ${radius}px`, // Push back by radius
            z: -radius, // Initial Z
            x: 0,
            y: y
        });
    });

    // Scroll interaction
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

// --- Scatter Mode Logic ---
function initScatterMode(images) {
    const container = document.getElementById('scatter-container');
    if (container.children.length > 0) return;

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
            zIndex: i
        });

        // Draggable
        Draggable.create(div, {
            bounds: container,
            inertia: true,
            onDragStart: function () {
                gsap.to(this.target, { scale: 1.1, zIndex: 1000, duration: 0.2 });
            },
            onDragEnd: function () {
                gsap.to(this.target, { scale: 1, duration: 0.2 });
            }
        });
    });
}
