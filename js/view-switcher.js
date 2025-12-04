document.addEventListener('DOMContentLoaded', () => {
    initViewSwitcher();
});

function initViewSwitcher() {
    // Check if we are on a gallery page
    const galleryGrid = document.querySelector('.artwork-grid');
    if (!galleryGrid) return;

    // Prevent duplicate initialization
    if (document.querySelector('.view-mode-controls')) return;

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

    // Event Listeners
    controls.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-mode-btn')) {
            // Collect Images dynamically on click to support lazy loading
            const images = Array.from(document.querySelectorAll('.artwork-card img')).map(img => img.src);

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

    let currentScroll = 0;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'spiral-item';
        div.style.backgroundImage = `url(${src})`;
        stage.appendChild(div);

        const theta = i * 30; // 30 degrees per item
        const radius = 600;
        const y = i * 200; // Vertical spacing

        gsap.set(div, {
            rotationY: -theta,
            transformOrigin: `50% 50% ${radius}px`,
            z: -radius,
            y: y,
            x: 0
        });
    });

    // Center initial view
    gsap.set(stage, {
        y: window.innerHeight / 2 - 150, // Center vertically roughly
        z: 0
    });

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('spiral-container').classList.contains('active')) return;

        currentScroll -= e.deltaY;

        // Animate the stage to rotate and move up/down
        // We want to rotate so the items come to the front
        // 30 degrees per item, 200px height per item
        // So 200px scroll = 30 degrees rotation

        const rotation = (currentScroll / 200) * 30;
        const yPos = (window.innerHeight / 2 - 150) + currentScroll;

        gsap.to(stage, {
            rotationY: rotation,
            y: yPos,
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
        div.innerHTML = `<img src="${src}" alt="Scatter Image" style="width:100%; height:auto; pointer-events:none;">`;
        container.appendChild(div);

        // Random position on screen
        const x = Math.random() * (window.innerWidth - 200);
        const y = Math.random() * (window.innerHeight - 200);
        const rotation = (Math.random() - 0.5) * 40;

        gsap.set(div, {
            x: x,
            y: y,
            rotation: rotation
        });

        // Draggable
        Draggable.create(div, {
            type: "x,y",
            bounds: container,
            inertia: true,
            onDragStart: function () {
                gsap.to(this.target, { scale: 1.1, zIndex: 100, duration: 0.2 });
            },
            onDragEnd: function () {
                gsap.to(this.target, { scale: 1, zIndex: 1, duration: 0.2 });
            }
        });

        // Click to bring to front
        div.addEventListener('mousedown', () => {
            gsap.to(div, { zIndex: 100 });
        });
    });
}

// --- Ribbon Mode Logic ---
function initRibbonMode(images) {
    const stage = document.querySelector('.ribbon-stage');
    if (stage.children.length > 0) return;

    let scrollX = 0;

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'ribbon-item'; // Need to ensure CSS exists or use inline styles
        div.style.cssText = `
            position: absolute;
            width: 300px;
            height: 200px;
            background-image: url(${src});
            background-size: cover;
            background-position: center;
            border: 2px solid rgba(255,255,255,0.2);
        `;
        stage.appendChild(div);

        // Sine wave path
        const x = i * 350;
        const y = Math.sin(i * 0.5) * 300;
        const z = Math.cos(i * 0.5) * 300;
        const rotationY = Math.cos(i * 0.5) * 45;

        gsap.set(div, {
            x: x,
            y: y,
            z: z,
            rotationY: rotationY
        });
    });

    gsap.set(stage, {
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 100,
        transformStyle: "preserve-3d"
    });

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('ribbon-container').classList.contains('active')) return;

        scrollX -= e.deltaY;

        gsap.to(stage, {
            x: (window.innerWidth / 2 - 150) + scrollX,
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
// --- Vortex Mode Logic (Infinite) ---
function initVortexMode(images) {
    const stage = document.querySelector('.vortex-stage');
    if (stage.children.length > 0) return;

    const spacing = 800; // More spacing
    const radius = 500;
    const totalItems = images.length;

    // Create items
    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'vortex-item';
        div.style.backgroundImage = `url(${src})`;
        // Store initial index for calculation
        div.dataset.index = i;
        stage.appendChild(div);
    });

    let scrollZ = 0;

    // Initial render
    updateVortex(0);

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('vortex-container').classList.contains('active')) return;

        // Move forward
        scrollZ += e.deltaY * 2;

        gsap.to(stage, {
            rotationZ: scrollZ * 0.05, // Gentle spin
            duration: 0.5,
            ease: 'power1.out',
            onUpdate: () => updateVortex(scrollZ)
        });
    });

    function updateVortex(currentZ) {
        const items = document.querySelectorAll('.vortex-item');
        const loopLength = totalItems * spacing;

        items.forEach(item => {
            const i = parseInt(item.dataset.index);

            // Calculate Z position based on scroll
            // We want items to loop. 
            // Base Z is -i * spacing.
            // Add currentZ.
            let itemZ = (-i * spacing) + currentZ;

            // Wrap around logic
            // If itemZ is > 500 (behind camera), move it to the far back
            while (itemZ > 500) {
                itemZ -= loopLength;
            }
            // If itemZ is too far back (optional, for reverse scroll), move to front
            while (itemZ < -loopLength + 500) {
                itemZ += loopLength;
            }

            const angle = i * 0.5; // Spiral angle
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            // Opacity fade
            let opacity = 1;
            if (itemZ > 0) opacity = 1 - (itemZ / 500); // Fade out as it passes camera
            if (itemZ < -3000) opacity = 1 - ((-itemZ - 3000) / 2000); // Fade out in distance

            gsap.set(item, {
                x: x,
                y: y,
                z: itemZ,
                rotationZ: angle * (180 / Math.PI),
                opacity: opacity
            });
        });
    }

    // Center stage
    gsap.set(stage, {
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 100
    });
}

// --- Network Mode Logic (Parallax) ---
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
        const y = (Math.random() - 0.5) * range * 1.5;
        const z = (Math.random() - 0.5) * range * 2;

        gsap.set(div, {
            x: x,
            y: y,
            z: z,
            scale: 0
        });

        // Pop in
        gsap.to(div, {
            scale: 1,
            duration: 0.5,
            delay: i * 0.05,
            ease: "back.out(1.7)"
        });

        // Floating
        gsap.to(div, {
            y: `+=${Math.random() * 100 - 50}`,
            rotation: Math.random() * 20 - 10,
            duration: 4 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Hover
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

    // Mouse Parallax instead of Drag
    window.addEventListener('mousemove', (e) => {
        if (!document.getElementById('network-container').classList.contains('active')) return;

        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(stage, {
            rotationY: mouseX * 20, // Rotate slightly based on mouse
            rotationX: -mouseY * 20,
            duration: 1,
            ease: 'power2.out'
        });
    });

    // Zoom on scroll
    let zoomLevel = 0;
    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('network-container').classList.contains('active')) return;

        zoomLevel -= e.deltaY;
        // Clamp zoom
        if (zoomLevel > 1000) zoomLevel = 1000;
        if (zoomLevel < -2000) zoomLevel = -2000;

        gsap.to(stage, {
            z: zoomLevel,
            duration: 1,
            ease: 'power2.out'
        });
    });
}
