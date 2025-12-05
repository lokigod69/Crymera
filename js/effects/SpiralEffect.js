/**
 * SpiralEffect.js
 * Implements an "Elongated Helix" effect (Flyaround) where the user is at the center
 * and items spiral around them on a cylinder, but positioned 'in front' of the axis (Z = -R).
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
            radius: 500,            // Distance from center to images (Closer)
            angleStep: 60,          // Degrees between items (Wider arc)
            heightStep: 300,        // Vertical distance between items (Elongated)
            perspective: 1500       // Camera perspective
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

        // Create Items
        this.images.forEach((src, i) => {
            const div = document.createElement('div');
            div.className = 'spiral-item';
            div.style.backgroundImage = `url(${src})`;
            // Styles
            div.style.position = 'absolute';
            div.style.left = '50%';
            div.style.top = '50%';
            div.style.width = '350px';
            div.style.height = '280px';
            div.style.marginLeft = '-175px';
            div.style.marginTop = '-140px';
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';
            // Important: We want them to face us when at 0 deg.
            div.style.backfaceVisibility = 'hidden';

            // Placement Logic:
            // 1. We want item 'i' to be at angle i*angleStep.
            // 2. We want it at height i*heightStep.
            // 3. We want it at radius R.
            // Fix: We use translateZ(-R) to pull it TOWARDS the center (or pass center?)
            // Wait, standard CSS:
            // Element starts at 0,0,0.
            // translateZ(-500) moves it 500px AWAY from camera (into darkness).
            // translateZ(500) moves it 500px TOWARDS camera (pop out).
            // We want the USER to be at 0.
            // We want the items to be AROUND the user.
            // So items should be at translateZ(-R) or +R relative to the cylinder center, 
            // and the cylinder center is at 0.

            // If we use `rotateY(theta) translateZ(R)`:
            // Angle 0: Right in front? No. rotateY is axis rotation.
            // translateZ(R) pulls it towards camera.
            // So `rotateY(0) translateZ(500)` -> Item is 500px closer to camera.
            // If camera is at 0, item is at Z=500? (Behind camera if looking at -Z?)

            // Let's use `translateZ(radius)` which pushes it OUT towards the perimeter.
            // And then `rotateY(180)` to face inward?
            // Actually, simplest is:
            // `rotateY(theta) translateZ(-R)`.
            // Angle 0: `translateZ(-R)` -> Z = -500 (In front of camera, deep).
            // This is perfect. At angle 0, it behaves like a normal image at Z=-500.
            // Angle 90: `rotateY(90) translateZ(-500)`.
            //   Rotates 90 deg (facing Left).
            //   Translates -500 LOCAL Z (which acts as global X now).
            //   So X = -500.

            const theta = i * this.config.angleStep;
            const y = i * this.config.heightStep;

            div.style.transform = `
                translateY(${y}px)
                rotateY(${theta}deg)
                translateZ(-${this.config.radius}px)
            `;

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
        const diff = this.targetScroll - this.scrollProgress;
        if (Math.abs(diff) > 0.001) {
            this.scrollProgress += diff * 0.1;
        } else {
            this.scrollProgress = this.targetScroll;
        }

        // Cylinder Motion
        // 1. Move vertically opposite to item height to keep centered.
        // 2. Rotate opposite to item angle to keep centered.

        const yPos = -this.scrollProgress * this.config.heightStep;
        const rotY = -this.scrollProgress * this.config.angleStep;

        this.cylinder.style.transform = `
            translateY(${yPos}px)
            rotateY(${rotY}deg)
        `;

        // Update Opacity
        this.itemElements.forEach(item => {
            // Distance from "active"
            const dist = Math.abs(item.index - this.scrollProgress);

            // Angular distance
            // We only show items that are roughly generally in front ( +/- 90 degrees? )
            // plus maybe a bit more for spiral context.
            // 1 item = 60 degrees. 90 degrees = 1.5 items.
            // So items at index +/- 2 are visibly on side.
            // Items at +/- 3 are at 180 deg (behind).

            let opacity = 1;

            // Simple distance fade
            // Keep center item fully visible.
            if (dist > 3.5) opacity = 0; // Hide back half
            else if (dist > 1.5) opacity = 1 - (dist - 1.5) / 2;

            item.el.style.opacity = opacity;

            // Interaction
            item.el.style.pointerEvents = (dist < 0.5) ? 'auto' : 'none';
        });

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    onWheel(e) {
        // Adjust speed
        // Slower scrolling control
        const sensitivity = 0.003;
        this.targetScroll += e.deltaY * sensitivity;

        // Clamp
        if (this.targetScroll < 0) this.targetScroll = 0;
        if (this.targetScroll > this.images.length - 1) this.targetScroll = this.images.length - 1;
    }

    onResize() { }

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

window.SpiralEffect = SpiralEffect;
