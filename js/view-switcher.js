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
            duration: 1,
            ease: 'power2.out'
        });
    });
}

// --- Cube Mode Logic (Fixed) ---
function initCubeMode(images) {
    const wrapper = document.querySelector('.cube-wrapper');
    if (wrapper.children.length > 0) return;

    // Create 6 faces
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const faceTransforms = [
        'translateZ(400px)',
        'rotateY(180deg) translateZ(400px)',
        'rotateY(90deg) translateZ(400px)',
        'rotateY(-90deg) translateZ(400px)',
        'rotateX(90deg) translateZ(400px)',
        'rotateX(-90deg) translateZ(400px)'
    ];

    let imgIndex = 0;

    faces.forEach((face, i) => {
        const div = document.createElement('div');
        div.className = `cube-face cube-face-${face}`;
        div.style.transform = faceTransforms[i];
        wrapper.appendChild(div);

        // Fill face with up to 4 images (2x2)
        for (let j = 0; j < 4; j++) {
            if (imgIndex < images.length) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'cube-face-item';
                imgDiv.style.backgroundImage = `url(${images[imgIndex]})`;
                // Add click to zoom
                imgDiv.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent drag start if any
                    // Toggle Zoom
                    if (wrapper.classList.contains('zoomed')) {
                        gsap.to(wrapper, { scale: 1, duration: 0.5 });
                        wrapper.classList.remove('zoomed');
                    } else {
                        // Rotate to face this item? For now just simple scale
                        gsap.to(wrapper, { scale: 1.5, duration: 0.5 });
                        wrapper.classList.add('zoomed');
                    }
                });
                div.appendChild(imgDiv);
                imgIndex++;
            }
        }
    });

    // Draggable Cube
    // We use a proxy element to capture drags anywhere in the container
    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: document.getElementById('cube-container'),
        type: "x,y",
        inertia: true,
        onDrag: function () {
            rotationY += this.deltaX * 0.5;
            rotationX -= this.deltaY * 0.5;

            gsap.to(wrapper, {
                rotationY: rotationY,
                rotationX: rotationX,
                duration: 0.1,
                ease: 'none'
            });
        },
        onThrowUpdate: function () {
            // Inertia
            rotationY += this.deltaX * 0.5;
            rotationX -= this.deltaY * 0.5;
            gsap.set(wrapper, {
                rotationY: rotationY,
                rotationX: rotationX
            });
        }
    });
}

// --- Sphere Mode Logic (Fixed) ---
function initSphereMode(images) {
    const stage = document.querySelector('.sphere-stage');
    if (stage.children.length > 0) return;

    const radius = 500;
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

        // Position & Rotation
        // We want images to face OUTWARDS from the center
        // The normal vector is (x, y, z)

        // Calculate rotation to face normal
        // Y rotation (yaw)
        const rotY = Math.atan2(x, z) * (180 / Math.PI);
        // X rotation (pitch)
        const rotX = -Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

        gsap.set(div, {
            x: x * radius,
            y: y * radius,
            z: z * radius,
            rotationY: rotY,
            rotationX: rotX,
            transformOrigin: "50% 50%"
        });

        // Click to bring to front?
        div.addEventListener('click', () => {
            // Rotate sphere so this item is at front (0,0,radius)
            // This requires complex math to reverse the rotation. 
            // For now, just scale up.
            gsap.to(div, { scale: 1.5, zIndex: 1000, duration: 0.3, yoyo: true, repeat: 1 });
        });
    });

    // Draggable Sphere
    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: document.getElementById('sphere-container'),
        type: "x,y",
        inertia: true,
        onDrag: function () {
            rotationY += this.deltaX * 0.3;
            rotationX -= this.deltaY * 0.3;

            gsap.to(stage, {
                rotationY: rotationY,
                rotationX: rotationX,
                duration: 0.1,
                ease: 'none'
            });
        },
        onThrowUpdate: function () {
            rotationY += this.deltaX * 0.3;
            rotationX -= this.deltaY * 0.3;
            gsap.set(stage, {
                rotationY: rotationY,
                rotationX: rotationX
            });
        }
    });
}

// --- Vortex Mode Logic (Fixed) ---
function initVortexMode(images) {
    const stage = document.querySelector('.vortex-stage');
    if (stage.children.length > 0) return;

    const spacing = 500; // Distance between images in Z
    const radius = 400; // Spiral radius
    const totalDepth = images.length * spacing;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'vortex-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        const angle = i * 0.8; // Spiral angle
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = -i * spacing; // Go deep into screen

        gsap.set(div, {
            x: x,
            y: y,
            z: z,
            rotationZ: angle * (180 / Math.PI), // Rotate to follow spiral
            opacity: 0 // Start hidden
        });
    });

    // Initial Camera Position
    // We start at z = 1000 (camera is at 0, so we pull stage to 1000 to see the first items at 0, -500, etc)
    let scrollZ = 1000;

    gsap.set(stage, {
        z: scrollZ,
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 100
    });

    // Update visibility initially
    updateVortexVisibility(scrollZ);

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('vortex-container').classList.contains('active')) return;

        // Scroll forward (fly into screen) -> increase stage Z
        scrollZ += e.deltaY * 2;

        // Clamp to prevent going too far back
        if (scrollZ < 1000) scrollZ = 1000;

        gsap.to(stage, {
            z: scrollZ,
            rotationZ: scrollZ * 0.1, // Spin effect
            duration: 0.5,
            ease: 'power1.out',
            onUpdate: () => updateVortexVisibility(scrollZ)
        });
    });

    function updateVortexVisibility(currentZ) {
        const items = document.querySelectorAll('.vortex-item');
        items.forEach(item => {
            const itemZ = gsap.getProperty(item, "z");
            const distToCamera = itemZ + currentZ; // Camera is at 0

            // Visible range: -500 (just passed) to 2000 (far ahead)
            let opacity = 0;
            if (distToCamera > -500 && distToCamera < 2000) {
                // Fade in from distance
                opacity = 1 - (distToCamera / 2000);
                // Fade out quickly when passing camera
                if (distToCamera < 200) opacity = (distToCamera + 500) / 700;
            }
            // Clamp
            if (opacity < 0) opacity = 0;
            if (opacity > 1) opacity = 1;

            gsap.set(item, { opacity: opacity });
        });
    }
}

// --- Network Mode Logic (Fixed) ---
function initNetworkMode(images) {
    const stage = document.querySelector('.network-stage');
    if (stage.children.length > 0) return;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'network-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        // Random 3D Cloud but constrained
        const range = 600;
        const x = (Math.random() - 0.5) * range * 2;
        const y = (Math.random() - 0.5) * range * 1.5;
        const z = (Math.random() - 0.5) * range;

        gsap.set(div, {
            x: x,
            y: y,
            z: z,
            scale: 0 // Start small
        });

        // Pop in
        gsap.to(div, {
            scale: 1,
            duration: 0.5,
            delay: i * 0.05,
            ease: "back.out(1.7)"
        });

        // Floating Animation
        gsap.to(div, {
            y: `+=${Math.random() * 60 - 30}`,
            x: `+=${Math.random() * 60 - 30}`,
            rotation: Math.random() * 20 - 10,
            duration: 3 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Hover to expand
        div.addEventListener('mouseenter', () => {
            gsap.to(div, { scale: 2, zIndex: 100, duration: 0.3 });
        });
        div.addEventListener('mouseleave', () => {
            gsap.to(div, { scale: 1, zIndex: 1, duration: 0.3 });
        });
    });

    // Center Stage
    gsap.set(stage, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    });

    // Draggable Network (Rotate the cloud)
    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: document.getElementById('network-container'),
        type: "x,y",
        inertia: true,
        onDrag: function () {
            rotationY += this.deltaX * 0.3;
            rotationX -= this.deltaY * 0.3;

            gsap.to(stage, {
                rotationY: rotationY,
                rotationX: rotationX,
                duration: 0.1,
                ease: 'none'
            });
        },
        onThrowUpdate: function () {
            rotationY += this.deltaX * 0.3;
            rotationX -= this.deltaY * 0.3;
            gsap.set(stage, {
                rotationY: rotationY,
                rotationX: rotationX
            });
        }
    });
}
