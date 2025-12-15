document.addEventListener('DOMContentLoaded', () => {
    initViewSwitcher();
});

let currentEffectInstance = null;


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
            <button class="view-mode-btn" data-mode="cube">Cube</button>
            <button class="view-mode-btn" data-mode="sphere">Sphere</button>
            <button class="view-mode-btn" data-mode="vortex">Vortex</button>
            <button class="view-mode-btn" data-mode="network">Network</button>
        </div>
    `;
    document.body.appendChild(controls);

    // Create Containers for new modes (Ribbon removed)
    const modes = ['spiral', 'scatter', 'cube', 'sphere', 'vortex', 'network'];
    modes.forEach(mode => {
        const container = document.createElement('div');
        container.id = `${mode}-container`;
        container.className = 'gallery-mode-container';

        if (mode === 'spiral') container.innerHTML = '<div class="spiral-stage"></div>';
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
    const showcaseSection = document.querySelector('.showcase-section');

    // Cleanup previous active effect if it exists
    if (currentEffectInstance) {
        if (typeof currentEffectInstance.destroy === 'function') {
            currentEffectInstance.destroy();
        }
        currentEffectInstance = null;
    }

    // Hide all containers
    document.querySelectorAll('.gallery-mode-container').forEach(el => {
        el.classList.remove('active');
        // Optional: clear container content if not managed by class?
        // For legacy effects (scatter etc), they append children. 
        // We might need to clear them if we want a fresh start, 
        // but the legacy code checks if(children.length > 0) return.
        // So we leave them for now unless they are refactored.
    });

    // Reset Main Section and Showcase
    if (mainSection) mainSection.style.display = 'none';
    if (showcaseSection) showcaseSection.style.display = 'none';
    document.body.style.overflow = 'hidden';

    if (mode === 'default') {
        if (mainSection) mainSection.style.display = 'block';
        if (showcaseSection) showcaseSection.style.display = 'block';
        document.body.style.overflow = 'auto';
    } else {
        const container = document.getElementById(`${mode}-container`);
        if (container) {
            container.classList.add('active');

            if (mode === 'spiral') {
                // Use new Class-based effect
                if (window.SpiralEffect) {
                    currentEffectInstance = new SpiralEffect(container, images);
                    currentEffectInstance.init();
                } else {
                    console.error("SpiralEffect class not found");
                }
            }
            else if (mode === 'scatter') initScatterMode(images);
            else if (mode === 'cube') initCubeMode(images);
            else if (mode === 'sphere') initSphereMode(images);
            else if (mode === 'vortex') initVortexMode(images);
            else if (mode === 'network') initNetworkMode(images);
        }
    }
}

// --- Spiral Mode Logic ---
// --- Spiral Mode Logic ---
// Now handled by js/effects/SpiralEffect.js
// Keeping this function stub if needed or removing it.
// The switchMode function now instantiates the class directly.


// --- Scatter Mode Logic (Native JS Drag) ---
function initScatterMode(images) {
    console.log('[Scatter] Initializing with', images.length, 'images');

    const container = document.getElementById('scatter-container');
    if (!container) {
        console.error('[Scatter] Container not found!');
        return;
    }

    // Clear container for fresh positioning each time
    container.innerHTML = '';

    // Ensure container has correct styles for interaction
    container.style.cursor = 'auto';
    container.style.pointerEvents = 'auto';

    // Debug: check if container receives click events
    container.onclick = function (e) {
        console.log('[Scatter] Container clicked, target:', e.target.className);
    };

    const polaroidWidth = 180;
    const polaroidHeight = 260;
    const margin = 50;

    // Track highest z-index
    let maxZIndex = images.length + 100;

    images.forEach((src, i) => {
        // Create polaroid container
        const div = document.createElement('div');
        div.className = 'scatter-item';

        // Random position
        const availableWidth = window.innerWidth - polaroidWidth - margin * 2;
        const availableHeight = window.innerHeight - polaroidHeight - margin * 2 - 80;
        let posX = margin + Math.random() * Math.max(100, availableWidth);
        let posY = margin + Math.random() * Math.max(100, availableHeight);
        const rotation = (Math.random() - 0.5) * 40;

        Object.assign(div.style, {
            position: 'absolute',
            width: `${polaroidWidth}px`,
            background: 'white',
            padding: '10px 10px 35px 10px',
            borderRadius: '3px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            cursor: 'grab',
            userSelect: 'none',
            zIndex: String(i + 100),
            left: `${posX}px`,
            top: `${posY}px`,
            transform: `rotate(${rotation}deg)`,
            touchAction: 'none',
            transition: 'box-shadow 0.2s, transform 0.1s',
            pointerEvents: 'auto'
        });

        // Image inside polaroid
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Scatter Image';
        Object.assign(img.style, {
            width: '100%',
            height: 'auto',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none'
        });
        img.draggable = false;
        div.appendChild(img);

        container.appendChild(div);
        console.log('[Scatter] Created polaroid', i, 'at', posX, posY);

        // Interaction state
        let isDragging = false;
        let isRotating = false;
        let startX, startY;
        let currentX = posX;
        let currentY = posY;
        let currentRotation = rotation;

        // Rotation momentum
        let angularVelocity = 0;
        let lastAngle = 0;
        let lastTime = 0;
        let momentumAnimationId = null;

        // Edge detection threshold (pixels from edge)
        const edgeThreshold = 30;

        // Helper: Check if point is near edge of element
        function isNearEdge(clientX, clientY) {
            const rect = div.getBoundingClientRect();
            const relX = clientX - rect.left;
            const relY = clientY - rect.top;
            const nearLeft = relX < edgeThreshold;
            const nearRight = relX > rect.width - edgeThreshold;
            const nearTop = relY < edgeThreshold;
            const nearBottom = relY > rect.height - edgeThreshold;
            return nearLeft || nearRight || nearTop || nearBottom;
        }

        // Helper: Calculate angle from center
        function getAngle(clientX, clientY) {
            const rect = div.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        }

        // Cursor change on hover based on position
        div.addEventListener('mousemove', function (e) {
            if (isDragging || isRotating) return;
            if (isNearEdge(e.clientX, e.clientY)) {
                div.style.cursor = 'ew-resize'; // Rotate cursor
            } else {
                div.style.cursor = 'grab';
            }
        });

        div.addEventListener('mousedown', function (e) {
            e.preventDefault();

            // Stop any ongoing momentum animation
            if (momentumAnimationId) {
                cancelAnimationFrame(momentumAnimationId);
                momentumAnimationId = null;
            }

            // Bring to front
            maxZIndex++;
            div.style.zIndex = maxZIndex;

            // Determine mode based on click position
            if (isNearEdge(e.clientX, e.clientY)) {
                // Rotation mode
                isRotating = true;
                lastAngle = getAngle(e.clientX, e.clientY);
                lastTime = performance.now();
                angularVelocity = 0;
                div.style.cursor = 'ew-resize';
            } else {
                // Drag mode
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                div.style.cursor = 'grabbing';
            }

            // Visual feedback
            div.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6)';
            div.style.transform = `rotate(${currentRotation}deg) scale(1.05)`;
        });

        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                div.style.left = `${currentX}px`;
                div.style.top = `${currentY}px`;
            } else if (isRotating) {
                e.preventDefault();
                const currentAngle = getAngle(e.clientX, e.clientY);
                const deltaAngle = currentAngle - lastAngle;

                // Handle angle wrap-around
                let adjustedDelta = deltaAngle;
                if (deltaAngle > 180) adjustedDelta -= 360;
                if (deltaAngle < -180) adjustedDelta += 360;

                currentRotation += adjustedDelta;
                div.style.transform = `rotate(${currentRotation}deg) scale(1.05)`;

                // Calculate angular velocity for momentum
                const currentTime = performance.now();
                const deltaTime = currentTime - lastTime;
                if (deltaTime > 0) {
                    angularVelocity = adjustedDelta / deltaTime * 16; // Normalize to ~60fps
                }

                lastAngle = currentAngle;
                lastTime = currentTime;
            }
        });

        document.addEventListener('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                div.style.cursor = 'grab';
                div.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
                div.style.transform = `rotate(${currentRotation}deg) scale(1)`;
            } else if (isRotating) {
                isRotating = false;
                div.style.cursor = 'grab';
                div.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';

                // Apply momentum if there's velocity
                if (Math.abs(angularVelocity) > 0.5) {
                    applyMomentum();
                } else {
                    div.style.transform = `rotate(${currentRotation}deg) scale(1)`;
                }
            }
        });

        // Momentum animation
        function applyMomentum() {
            const friction = 0.95; // Decay rate

            function animate() {
                if (Math.abs(angularVelocity) < 0.1) {
                    // Stopped spinning
                    div.style.transform = `rotate(${currentRotation}deg) scale(1)`;
                    momentumAnimationId = null;
                    return;
                }

                currentRotation += angularVelocity;
                angularVelocity *= friction;

                div.style.transform = `rotate(${currentRotation}deg) scale(1)`;
                momentumAnimationId = requestAnimationFrame(animate);
            }

            momentumAnimationId = requestAnimationFrame(animate);
        }

        // Touch support with rotation
        div.addEventListener('touchstart', function (e) {
            e.preventDefault();
            const touch = e.touches[0];

            if (momentumAnimationId) {
                cancelAnimationFrame(momentumAnimationId);
                momentumAnimationId = null;
            }

            maxZIndex++;
            div.style.zIndex = maxZIndex;

            if (isNearEdge(touch.clientX, touch.clientY)) {
                isRotating = true;
                lastAngle = getAngle(touch.clientX, touch.clientY);
                lastTime = performance.now();
                angularVelocity = 0;
            } else {
                isDragging = true;
                startX = touch.clientX - currentX;
                startY = touch.clientY - currentY;
            }

            div.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6)';
            div.style.transform = `rotate(${currentRotation}deg) scale(1.05)`;
        }, { passive: false });

        div.addEventListener('touchmove', function (e) {
            if (!isDragging && !isRotating) return;
            e.preventDefault();
            const touch = e.touches[0];

            if (isDragging) {
                currentX = touch.clientX - startX;
                currentY = touch.clientY - startY;
                div.style.left = `${currentX}px`;
                div.style.top = `${currentY}px`;
            } else if (isRotating) {
                const currentAngle = getAngle(touch.clientX, touch.clientY);
                let deltaAngle = currentAngle - lastAngle;
                if (deltaAngle > 180) deltaAngle -= 360;
                if (deltaAngle < -180) deltaAngle += 360;

                currentRotation += deltaAngle;
                div.style.transform = `rotate(${currentRotation}deg) scale(1.05)`;

                const currentTime = performance.now();
                const deltaTime = currentTime - lastTime;
                if (deltaTime > 0) {
                    angularVelocity = deltaAngle / deltaTime * 16;
                }

                lastAngle = currentAngle;
                lastTime = currentTime;
            }
        }, { passive: false });

        div.addEventListener('touchend', function () {
            if (isDragging) {
                isDragging = false;
                div.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
                div.style.transform = `rotate(${currentRotation}deg) scale(1)`;
            } else if (isRotating) {
                isRotating = false;
                div.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';

                if (Math.abs(angularVelocity) > 0.5) {
                    applyMomentum();
                } else {
                    div.style.transform = `rotate(${currentRotation}deg) scale(1)`;
                }
            }
        });
    });
}

// --- Cube Mode Logic (Smart Distribution) ---
function initCubeMode(images) {
    const container = document.getElementById('cube-container');
    const wrapper = document.querySelector('.cube-wrapper');
    if (wrapper.children.length > 0) return;

    const cubeSize = 400; // Size of each face
    const faceCount = 6;

    // Center the wrapper in the viewport
    gsap.set(wrapper, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        width: cubeSize,
        height: cubeSize,
        transformStyle: 'preserve-3d'
    });

    // Calculate how to distribute images across 6 faces
    // Goal: Display all images. Some faces may have 1 image, others may have a grid.
    const totalImages = images.length;

    // Determine layout per face
    // If we have 6 or fewer images: 1 per face (some faces may be empty or repeat)
    // If we have 7-12: distribute so each face gets 1-2 images
    // If we have more: use grids (2x2 = 4 per face)

    let faceLayouts = []; // Array of { cols, rows } for each face
    let imagesPerFace = [];

    if (totalImages <= 6) {
        // One image per face (some faces may be empty if < 6)
        for (let i = 0; i < faceCount; i++) {
            if (i < totalImages) {
                faceLayouts.push({ cols: 1, rows: 1 });
                imagesPerFace.push(1);
            } else {
                faceLayouts.push({ cols: 0, rows: 0 });
                imagesPerFace.push(0);
            }
        }
    } else {
        // More than 6 images - need grids on some faces
        // Figure out minimum images needed per face
        let remaining = totalImages;
        let basePerFace = Math.floor(totalImages / faceCount);
        let extra = totalImages % faceCount;

        for (let i = 0; i < faceCount; i++) {
            let count = basePerFace + (i < extra ? 1 : 0);
            imagesPerFace.push(count);

            // Determine grid size
            if (count <= 1) faceLayouts.push({ cols: 1, rows: 1 });
            else if (count <= 2) faceLayouts.push({ cols: 2, rows: 1 });
            else if (count <= 4) faceLayouts.push({ cols: 2, rows: 2 });
            else if (count <= 6) faceLayouts.push({ cols: 3, rows: 2 });
            else faceLayouts.push({ cols: 3, rows: 3 }); // Up to 9
        }
    }

    // Create 6 faces
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const halfSize = cubeSize / 2;
    const faceTransforms = [
        `translateZ(${halfSize}px)`,                        // front
        `rotateY(180deg) translateZ(${halfSize}px)`,        // back
        `rotateY(90deg) translateZ(${halfSize}px)`,         // right
        `rotateY(-90deg) translateZ(${halfSize}px)`,        // left
        `rotateX(90deg) translateZ(${halfSize}px)`,         // top
        `rotateX(-90deg) translateZ(${halfSize}px)`         // bottom
    ];

    let imgIndex = 0;

    faces.forEach((face, i) => {
        const div = document.createElement('div');
        div.className = `cube-face cube-face-${face}`;

        Object.assign(div.style, {
            position: 'absolute',
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: faceTransforms[i],
            background: 'rgba(20, 20, 30, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            backfaceVisibility: 'hidden',
            display: 'grid',
            gridTemplateColumns: `repeat(${faceLayouts[i].cols || 1}, 1fr)`,
            gridTemplateRows: `repeat(${faceLayouts[i].rows || 1}, 1fr)`,
            gap: '4px',
            padding: '4px',
            boxSizing: 'border-box'
        });

        wrapper.appendChild(div);

        // Add images to this face
        const count = imagesPerFace[i];
        for (let j = 0; j < count && imgIndex < images.length; j++) {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'cube-face-item';
            Object.assign(imgDiv.style, {
                width: '100%',
                height: '100%',
                backgroundImage: `url(${images[imgIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '4px'
            });
            div.appendChild(imgDiv);
            imgIndex++;
        }
    });

    // Draggable Cube with inertia
    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: container,
        type: "x,y",
        inertia: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
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
    const container = document.getElementById('sphere-container');
    const stage = document.querySelector('.sphere-stage');
    if (stage.children.length > 0) return;

    const radius = 500; // Sphere radius (increased for larger images)
    const count = images.length;
    const imageSize = 300; // Size of each image (doubled for better visibility)

    // Center the stage in the container
    gsap.set(stage, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        width: 0,
        height: 0,
        transformStyle: 'preserve-3d'
    });

    // Fibonacci Sphere Distribution - evenly distributes points on a sphere
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle ~137.5 degrees

    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'sphere-item';

        Object.assign(div.style, {
            position: 'absolute',
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            cursor: 'default'
        });

        stage.appendChild(div);

        // Fibonacci sphere point distribution
        const y = 1 - (i / (count - 1 || 1)) * 2; // y from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y); // radius at this y level
        const theta = phi * i; // golden angle increment

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        // Calculate rotation to face outward from center
        const rotY = Math.atan2(x, z) * (180 / Math.PI);
        const rotX = -Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

        // Position and rotate - center image on its position
        gsap.set(div, {
            x: x * radius - imageSize / 2,
            y: y * radius - imageSize / 2,
            z: z * radius,
            rotationY: rotY,
            rotationX: rotX,
            transformOrigin: '50% 50%'
        });
    });

    // Draggable Sphere with inertia
    let rotationX = 0;
    let rotationY = 0;

    Draggable.create(document.createElement('div'), {
        trigger: container,
        type: 'x,y',
        inertia: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
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

// --- Vortex Mode Logic (3D Spiral Tunnel with Visible Tail) ---
function initVortexMode(images) {
    const container = document.getElementById('vortex-container');
    const stage = document.querySelector('.vortex-stage');
    if (stage.children.length > 0) return;

    const totalItems = images.length;
    const startTime = performance.now(); // For animation oscillation

    // Configuration for the spiral vortex with visible tail
    const config = {
        tunnelDepth: 3500,         // Total depth of the vortex tunnel
        baseSpacing: 400,          // Base spacing between images
        spacingGrowth: 1.12,       // Exponential growth factor for distance

        // Tail visibility settings - the key change
        tailMinRadius: 80,         // Minimum radius for tail items (not directly behind center)
        tailMaxRadius: 450,        // Maximum radius at the far end of tail
        tailSpread: 0.4,           // How much the spiral spreads outward (0-1)

        spiralTurns: 2.5,          // Number of full spiral rotations in the tail
        funnelTilt: 45,            // How much images tilt to face camera
        minSize: 50,               // Minimum image size (far)
        maxSize: 500,              // Maximum image size (close/full display)
        fullDisplayZone: 0.02,     // Zone where image is at full size (centered)
        transitionZone: 0.12,      // Zone where it transitions from tail to center
        fadeInStart: 0.9,          // Start fading in from this depth

        // Tail direction oscillation
        tailSwingSpeed: 0.0003,    // How fast the tail direction swings around
        tailSwingAmount: Math.PI * 0.6,  // How much the tail direction swings (radians)

        // Individual item oscillation
        oscillationSpeed: 0.0006,  // Speed of individual item oscillation
        oscillationAmount: 20      // Max pixels of oscillation
    };

    // Pre-calculate cumulative spacing for exponential growth
    const cumulativeSpacing = [0];
    for (let i = 1; i <= totalItems; i++) {
        const prevSpacing = cumulativeSpacing[i - 1];
        const additionalSpacing = config.baseSpacing * Math.pow(config.spacingGrowth, i - 1);
        cumulativeSpacing.push(prevSpacing + additionalSpacing);
    }
    const totalLength = cumulativeSpacing[totalItems];

    // Random starting direction for the tail (which side of center it starts from)
    const baseTailAngle = Math.random() * Math.PI * 2;

    // Generate random offsets per item
    const itemRandomData = images.map((_, i) => ({
        // Small angle variation per item (so they don't line up perfectly)
        angleVariation: (Math.random() - 0.5) * 0.4,
        // Random oscillation phase
        oscillationPhase: Math.random() * Math.PI * 2,
        // Random oscillation speed multiplier
        oscillationSpeedMult: 0.8 + Math.random() * 0.4
    }));

    // Create items
    images.forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'vortex-item';
        div.dataset.index = i;

        Object.assign(div.style, {
            position: 'absolute',
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '10px',
            boxShadow: '0 0 40px rgba(100, 150, 255, 0.5)',
            transformOrigin: 'center center'
        });

        stage.appendChild(div);
    });

    let scrollProgress = 0;
    let targetScroll = 0;

    // Smooth scroll animation loop
    function animate() {
        scrollProgress += (targetScroll - scrollProgress) * 0.08;
        updateVortex();
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('wheel', (e) => {
        if (!container.classList.contains('active')) return;
        e.preventDefault();
        targetScroll += e.deltaY * 0.8;
    }, { passive: false });

    function updateVortex() {
        const items = stage.querySelectorAll('.vortex-item');
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;

        // Calculate the current tail direction (swings around over time)
        const tailSwingOffset = Math.sin(elapsedTime * config.tailSwingSpeed) * config.tailSwingAmount;
        const currentTailAngle = baseTailAngle + tailSwingOffset;

        items.forEach(item => {
            const i = parseInt(item.dataset.index);
            const randomData = itemRandomData[i];

            // Calculate depth using cumulative spacing for exponential distribution
            let depth = cumulativeSpacing[i] - scrollProgress;

            // Wrap around for infinite scroll
            while (depth < -config.baseSpacing) depth += totalLength;
            while (depth > totalLength - config.baseSpacing) depth -= totalLength;

            // Normalize depth: 0 = closest (center), 1 = farthest
            const normalizedDepth = Math.max(0, Math.min(1, depth / totalLength));

            // === KEY CHANGE: Position tail items on a visible radius ===
            // The tail spirals outward from center instead of going straight back

            // Spiral angle combines: tail direction + spiral progression + individual variation
            const spiralProgress = normalizedDepth * config.spiralTurns * Math.PI * 2;
            const itemAngle = currentTailAngle + spiralProgress + randomData.angleVariation;

            // Radius: starts at 0 (center) for front item, increases outward for tail
            // This makes the tail visible beside/around the front image, not behind it
            let radius;
            if (normalizedDepth < config.fullDisplayZone) {
                // Front image - stays centered
                radius = 0;
            } else if (normalizedDepth < config.transitionZone) {
                // Transition - smoothly move outward from center
                const t = (normalizedDepth - config.fullDisplayZone) / (config.transitionZone - config.fullDisplayZone);
                radius = t * config.tailMinRadius;
            } else {
                // Tail - positioned on radius, increasing with depth
                const tailProgress = (normalizedDepth - config.transitionZone) / (1 - config.transitionZone);
                radius = config.tailMinRadius + tailProgress * (config.tailMaxRadius - config.tailMinRadius);
            }

            // Calculate oscillation for subtle movement
            const oscillationTime = elapsedTime * config.oscillationSpeed * randomData.oscillationSpeedMult;
            const oscillation = Math.sin(oscillationTime + randomData.oscillationPhase) * config.oscillationAmount;

            // Reduce oscillation as approaching center
            const oscillationFactor = Math.min(1, normalizedDepth / config.transitionZone);

            // Final X/Y position on the spiral radius
            const x = Math.cos(itemAngle) * radius + oscillation * oscillationFactor * Math.cos(itemAngle + Math.PI / 2);
            const y = Math.sin(itemAngle) * radius * config.tailSpread + oscillation * oscillationFactor * Math.sin(itemAngle + Math.PI / 2);

            // Size calculation - full size when centered, scale down for tail
            let sizeProgress;
            if (normalizedDepth < config.fullDisplayZone) {
                sizeProgress = 1;
            } else if (normalizedDepth < config.transitionZone) {
                const t = (normalizedDepth - config.fullDisplayZone) / (config.transitionZone - config.fullDisplayZone);
                sizeProgress = 1 - t * 0.25; // Slightly smaller in transition
            } else {
                const tailProgress = (normalizedDepth - config.transitionZone) / (1 - config.transitionZone);
                sizeProgress = 0.75 * Math.pow(1 - tailProgress, 1.2);
            }
            const size = config.minSize + (config.maxSize - config.minSize) * sizeProgress;

            // Opacity - full opacity throughout, only fade at very back
            let opacity = 1;
            if (normalizedDepth > config.fadeInStart) {
                opacity = (1 - normalizedDepth) / (1 - config.fadeInStart);
            }
            // Fade out only when passing the front
            if (normalizedDepth < 0.01) {
                opacity = normalizedDepth / 0.01;
            }

            // Rotation - face camera, reduce rotation as approaching center
            let rotationFactor;
            if (normalizedDepth < config.fullDisplayZone) {
                rotationFactor = 0; // Perfectly upright at center
            } else if (normalizedDepth < config.transitionZone) {
                rotationFactor = (normalizedDepth - config.fullDisplayZone) / (config.transitionZone - config.fullDisplayZone);
            } else {
                rotationFactor = 1;
            }

            // Tilt outward based on position on circle (creates 3D depth feeling)
            const tiltAmount = config.funnelTilt * normalizedDepth * rotationFactor;
            const rotateY = Math.cos(itemAngle) * tiltAmount * 0.5;
            const rotateX = Math.sin(itemAngle) * tiltAmount * 0.3;

            // Z rotation for spiral twist feel
            const rotateZ = (spiralProgress * (180 / Math.PI) * 0.1) * rotationFactor;

            // Z position for depth sorting (tail goes back into screen)
            const zPos = -normalizedDepth * config.tunnelDepth;

            // Z-index: closer items render on top
            const zIndex = Math.round((1 - normalizedDepth) * 100);

            // Apply all transforms
            Object.assign(item.style, {
                width: `${size}px`,
                height: `${size}px`,
                left: `${x - size / 2}px`,
                top: `${y - size / 2}px`,
                transform: `translateZ(${zPos}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
                opacity: Math.max(0, Math.min(1, opacity)),
                zIndex: zIndex,
                filter: normalizedDepth > config.transitionZone && opacity < 0.8 ? `blur(${(1 - opacity) * 1.5}px)` : 'none'
            });
        });
    }
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
