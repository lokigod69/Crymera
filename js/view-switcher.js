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
