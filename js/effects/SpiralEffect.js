/**
 * SpiralEffect.js
 * Implements an "Inside-Out Helix" effect where the user is at the center
 * and items spiral around them on a cylinder, coming into focus one by one.
 */

class SpiralEffect {
    constructor(container, images) {
        this.container = container;
        this.images = images;
        this.stage = null;
        this.cylinder = null;
        this.itemElements = [];
        this.scrollProgress = 0;
        this.targetScroll = 0;
        this.isGenerated = false;

        // Configuration
        this.config = {
            radius: 800,            // Distance from center to images
            angleStep: 40,          // Degrees between items
            heightStep: 100,        // Vertical distance between items
            perspective: 2000       // Camera perspective depth
        };

        // Bindings
        this.resizeHandler = this.onResize.bind(this);
        this.wheelHandler = this.onWheel.bind(this);
        this.rafId = null;
    }

    init() {
        if (this.isGenerated) return;

        // Container Style (Camera)
        this.container.style.perspective = `${this.config.perspective}px`;
        this.container.style.overflow = 'hidden';

        // Create Cylinder (The World)
        this.cylinder = document.createElement('div');
        this.cylinder.className = 'spiral-cylinder';
        this.cylinder.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            top: 0;
            left: 0;
        `;
        this.container.appendChild(this.cylinder);

        // Center the cylinder origin to the middle of the screen
        // We will move the cylinder ITSELF to center.
        // But 3D transforms origin is usually 50% 50%.

        // Create Items
        this.images.forEach((src, i) => {
            const div = document.createElement('div');
            div.className = 'spiral-item';
            div.style.backgroundImage = `url(${src})`;
            // Default sizing if CSS not loaded yet
            div.style.position = 'absolute';
            div.style.left = '50%';
            div.style.top = '50%';
            div.style.width = '400px';
            div.style.height = '300px';
            div.style.marginLeft = '-200px'; // Center registration
            div.style.marginTop = '-150px';
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';
            div.style.backfaceVisibility = 'hidden'; // Don't show back of images

            // Initial Placement on Cylinder
            // We rotate Y to the angle, then push out Z by radius.
            // Then we rotate Y 180 so it faces INWARDS.
            const theta = i * this.config.angleStep;
            const y = i * this.config.heightStep;

            // We set the static transform here.
            // The animation will move the whole cylinder.
            // Note: We use -theta because we want the spiral to wind in a specific way?
            // Let's stick to positive theta for index increase.

            const transform = `
                translateY(${y}px)
                rotateY(${theta}deg)
                translateZ(${this.config.radius}px)
                rotateY(180deg)
            `;

            // Note: Transform order matters!
            // 1. translateY: move down the strip
            // 2. rotateY: turn to angle
            // 3. translateZ: push out
            // 4. rotateY: face center (180 flip)

            // Actually, we want to center the STRIP.
            // So if we just set this, item 0 is at Y=0.

            div.style.transform = transform;

            // Optional: add reflection or shadow here

            this.cylinder.appendChild(div);
            this.itemElements.push({
                el: div,
                index: i
            });
        });

        this.isGenerated = true;
        this.addEvents();
        this.animate();
    }

    animate() {
        // Smooth scroll
        // Damping 0.1 for smoothness
        const diff = this.targetScroll - this.scrollProgress;
        if (Math.abs(diff) > 0.001) {
            this.scrollProgress += diff * 0.1;
        } else {
            this.scrollProgress = this.targetScroll;
        }

        // Move Cylinder
        // We want item 'scrollProgress' to be at (0,0,0) (Front Center).
        // 1. We need to translate Y UP by (scrollProgress * heightStep)
        //    (Because item Y was +y, so we need -y on container? No, -y moves container up? 
        //     Wait. screen Y goes Down. So +Y on item is Down.
        //     To bring item up to center (0), we need container to move Up.
        //     Container Y = - (scrollProgress * heightStep).

        // 2. We need to rotate Y by -(scrollProgress * angleStep).
        //    (Item was at +theta. We rotate container -theta to bring it to 0).

        const yPos = -this.scrollProgress * this.config.heightStep;
        const rotY = -this.scrollProgress * this.config.angleStep;

        // Apply to Cylinder
        // We also center it first? CSS logic:
        // transform-origin is 50% 50% (center of screen typically).
        // So translateZ(perspective) is not needed if container has perspective.
        // But we might want to push cylinder back if radius is huge? 
        // No, we want camera in center. So Cylinder center is at 0,0,0.

        this.cylinder.style.transform = `
            translateZ(0px)
            translateY(${yPos}px)
            rotateY(${rotY}deg)
        `;

        // Update Opacity/Visibility per item
        this.itemElements.forEach(item => {
            // Distance from "active" index
            const dist = Math.abs(item.index - this.scrollProgress);

            // Opacity
            let opacity = 1;
            if (dist > 8) opacity = 0; // Far away items invisible
            else if (dist > 4) opacity = 1 - ((dist - 4) / 4);

            item.el.style.opacity = opacity;
            item.el.style.pointerEvents = (dist < 1) ? 'auto' : 'none'; // Only center clickable

            // Optional: Scale effect for center focus?
            // Making the center item slightly larger
            if (dist < 1) {
                // item.el.style.filter = 'brightness(1.2)';
            } else {
                // item.el.style.filter = 'brightness(0.6)';
            }
        });

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    onWheel(e) {
        // Adjust speed
        // e.deltaY is usually 100 per tick.
        // We want 1 tick = 1 item?
        // Let's say 100px scroll = 1 item.
        const sensitivity = 0.005;
        this.targetScroll += e.deltaY * sensitivity;

        // Clamp
        if (this.targetScroll < 0) this.targetScroll = 0;
        if (this.targetScroll > this.images.length - 1) this.targetScroll = this.images.length - 1;

        // Optional: Snap to integer?
        // this.startSnapping();
    }

    onResize() {
        // Handle resize if calculating positions based on screen size
    }

    addEvents() {
        window.addEventListener('wheel', this.wheelHandler);
        window.addEventListener('resize', this.resizeHandler);
    }

    removeEvents() {
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }

    destroy() {
        this.removeEvents();
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.cylinder) this.cylinder.remove();
        this.isGenerated = false;
        this.itemElements = [];
    }
}

// Global Export
window.SpiralEffect = SpiralEffect;
