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
            <button class="view-mode-btn" data-mode="ribbon">Ribbon</button>
            <button class="view-mode-btn" data-mode="cube">Cube</button>
            <button class="view-mode-btn" data-mode="sphere">Sphere</button>
            <button class="view-mode-btn" data-mode="vortex">Vortex</button>
            <button class="view-mode-btn" data-mode="network">Network</button>
        </div>
    `;
    document.body.appendChild(controls);

    // Create Containers for new modes
    const modes = ['spiral', 'scatter', 'ribbon', 'cube', 'sphere', 'vortex', 'network'];
    modes.forEach(mode => {
        const container = document.createElement('div');
        container.id = `${mode}-container`;
        container.className = 'gallery-mode-container';

        if (mode === 'spiral') container.innerHTML = '<div class="spiral-stage"></div>';
        if (mode === 'ribbon') container.innerHTML = '<div class="ribbon-stage"></div>';
        if (mode === 'cube') container.innerHTML = '<div class="cube-wrapper"></div>';
        if (mode === 'sphere') container.innerHTML = '<div class="sphere-stage"></div>';
        if (mode === 'vortex') container.innerHTML = '<div class="vortex-stage"></div>';
        if (mode === 'network') container.innerHTML = '<div class="network-stage"></div>';

        document.body.appendChild(container);
    });

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
    const mainSection = document.querySelector('.featured-artworks');

    // Hide all containers
    document.querySelectorAll('.gallery-mode-container').forEach(el => el.classList.remove('active'));

    // Reset Main Section
    if (mainSection) mainSection.style.display = 'none';
    document.body.style.overflow = 'hidden';

    if (mode === 'default') {
        if (mainSection) mainSection.style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        const container = document.getElementById(`${mode}-container`);
        if (container) {
            container.classList.add('active');

            if (mode === 'spiral') initSpiralMode(images);
            if (mode === 'scatter') initScatterMode(images);
            if (mode === 'ribbon') initRibbonMode(images);
            if (mode === 'cube') initCubeMode(images);
            if (mode === 'sphere') initSphereMode(images);
            if (mode === 'vortex') initVortexMode(images);
            if (mode === 'network') initNetworkMode(images);
        }
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

// --- Scatter Mode Logic ---
function initScatterMode(images) {
    const container = document.getElementById('scatter-container');
    if (container.children.length > 0) return;

    let maxZ = 100;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'scatter-item';
        div.innerHTML = `<img src="${src}">`;
        container.appendChild(div);

        const x = Math.random() * (window.innerWidth - 200);
        const y = Math.random() * (window.innerHeight - 300);
        const rotation = (Math.random() - 0.5) * 40;

        gsap.set(div, {
            x: x,
            y: y,
            rotation: rotation,
            zIndex: i + 1
        });

        div.addEventListener('mouseenter', () => {
            if (!Draggable.get(div).isDragging) {
                gsap.to(div, {
                    scale: 1.1,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    zIndex: maxZ + 1,
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
                    zIndex: div.dataset.originalZ || i + 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        Draggable.create(div, {
            bounds: container,
            inertia: true,
            type: "x,y",
            zIndexBoost: false,
            onPress: function () {
                maxZ++;
                this.target.dataset.originalZ = maxZ;
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

// --- Ribbon Mode Logic ---
function initRibbonMode(images) {
    const stage = document.querySelector('.ribbon-stage');
    if (stage.children.length > 0) return;

    const radius = 800;
    const spacing = 400;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'ribbon-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        const t = i * 0.5;
        const x = i * spacing;
        const z = Math.sin(t) * radius;
        const rotY = Math.cos(t) * 45;

        gsap.set(div, {
            x: x,
            z: z,
            y: (i % 2 === 0 ? -100 : 100),
            rotationY: rotY
        });
    });

    gsap.set(stage, {
        z: 1000,
        x: window.innerWidth / 2 - 150
    });

    let scrollPos = 0;

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('ribbon-container').classList.contains('active')) return;

        scrollPos += e.deltaY;

        gsap.to(stage, {
            x: (window.innerWidth / 2 - 150) - scrollPos,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

// --- Cube Mode Logic ---
function initCubeMode(images) {
    const wrapper = document.querySelector('.cube-wrapper');
    if (wrapper.children.length > 0) return;

    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const faceTransforms = [
        'translateZ(300px)',
        'rotateY(180deg) translateZ(300px)',
        'rotateY(90deg) translateZ(300px)',
        'rotateY(-90deg) translateZ(300px)',
        'rotateX(90deg) translateZ(300px)',
        'rotateX(-90deg) translateZ(300px)'
    ];

    let imgIndex = 0;

    faces.forEach((face, i) => {
        const div = document.createElement('div');
        div.className = `cube-face cube-face-${face}`;
        div.style.transform = faceTransforms[i];
        wrapper.appendChild(div);

        for (let j = 0; j < 4; j++) {
            if (imgIndex < images.length) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'cube-face-item';
                imgDiv.style.backgroundImage = `url(${images[imgIndex]})`;
                div.appendChild(imgDiv);
                imgIndex++;
            }
        }
    });

    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: document.getElementById('cube-container'),
        type: "x,y",
        onDrag: function () {
            rotationY += this.deltaX * 0.5;
            rotationX -= this.deltaY * 0.5;

            gsap.to(wrapper, {
                rotationY: rotationY,
                rotationX: rotationX,
                duration: 0.5,
                ease: 'power1.out'
            });
        }
    });
}

// --- Sphere Mode Logic ---
function initSphereMode(images) {
    const stage = document.querySelector('.sphere-stage');
    if (stage.children.length > 0) return;

    const radius = 600;
    const count = images.length;

    // Fibonacci Sphere Distribution
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'sphere-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y); // radius at y

        const theta = phi * i; // golden angle increment

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        // Position
        gsap.set(div, {
            x: x * radius,
            y: y * radius,
            z: z * radius,
            // Rotate to face center (or outward)
            rotationY: (Math.atan2(x, z) * 180 / Math.PI) + 180,
            rotationX: (Math.atan2(y, Math.sqrt(x * x + z * z)) * 180 / Math.PI) * -1
        });
    });

    // Draggable Sphere
    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: document.getElementById('sphere-container'),
        type: "x,y",
        onDrag: function () {
            rotationY += this.deltaX * 0.3;
            rotationX -= this.deltaY * 0.3;

            gsap.to(stage, {
                rotationY: rotationY,
                rotationX: rotationX,
                duration: 0.5,
                ease: 'power1.out'
            });
        }
    });
}

// --- Vortex Mode Logic ---
function initVortexMode(images) {
    const stage = document.querySelector('.vortex-stage');
    if (stage.children.length > 0) return;

    const spacing = 400; // Distance between images in Z
    const radius = 300; // Spiral radius

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'vortex-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        const angle = i * 0.5; // Spiral angle
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -i * spacing; // Go deep into screen

        gsap.set(div, {
            x: x,
            y: y,
            z: z,
            rotationZ: angle * (180 / Math.PI) // Rotate to follow spiral
        });
    });

    // Scroll Interaction
    let scrollZ = 0;
    const maxZ = images.length * spacing;

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('vortex-container').classList.contains('active')) return;

        scrollZ += e.deltaY * 2;
        // if (scrollZ < 0) scrollZ = 0;

        // Move stage forward
        gsap.to(stage, {
            z: scrollZ,
            rotationZ: scrollZ * 0.05, // Spin while moving
            duration: 1,
            ease: 'power2.out'
        });

        // Fade logic could be added here (opacity based on distance to camera)
        document.querySelectorAll('.vortex-item').forEach(item => {
            const itemZ = gsap.getProperty(item, "z");
            const absoluteZ = itemZ + scrollZ;

            // Fade in when close to camera (0), fade out when behind (> 200) or too far (< -1000)
            let opacity = 0;
            if (absoluteZ > -1500 && absoluteZ < 500) {
                opacity = 1 - Math.abs(absoluteZ + 500) / 1000;
                if (opacity > 1) opacity = 1;
            }
            gsap.to(item, { opacity: opacity, duration: 0.5 });
        });
    });
}

// --- Network Mode Logic ---
function initNetworkMode(images) {
    const stage = document.querySelector('.network-stage');
    if (stage.children.length > 0) return;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'network-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        // Random 3D Cloud
        const range = 800;
        const x = (Math.random() - 0.5) * range * 2;
        const y = (Math.random() - 0.5) * range;
        const z = (Math.random() - 0.5) * range;

        gsap.set(div, {
            x: x,
            y: y,
            z: z
        });

        // Floating Animation
        gsap.to(div, {
            y: `+=${Math.random() * 100 - 50}`,
            x: `+=${Math.random() * 100 - 50}`,
            rotation: Math.random() * 20 - 10,
            duration: 3 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    });

    // Mouse Parallax
    window.addEventListener('mousemove', (e) => {
        if (!document.getElementById('network-container').classList.contains('active')) return;

        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(stage, {
            rotationY: mouseX * 10,
            rotationX: -mouseY * 10,
            duration: 1,
            ease: 'power2.out'
        });
    });
}
