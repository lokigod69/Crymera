/**
 * SpiralEffect.js
 * Implements a "Flythrough" spiral effect where items travel along a helical path
 * and pass directly in front of the camera.
 */

class SpiralEffect {
    constructor(container, images) {
        this.container = container;
        this.images = images;
        this.stage = null;
        this.itemElements = [];
        this.scrollProgress = 0;
        this.targetScroll = 0;
        this.isGenerated = false;

        // Configuration
        this.config = {
            radius: 400,            // Radius of the spiral
            angleStep: 0.5,         // Radians per item
            zStep: 500,             // Distance between items
            focalPoint: -400,       // Z position where the "active" item sits (negative is into screen)
            rotationSpeed: 0.5      // How much the item rotates as it passes
        };

        // Bindings
        this.resizeHandler = this.onResize.bind(this);
        this.wheelHandler = this.onWheel.bind(this);
        this.rafId = null;
    }

    init() {
        if (this.isGenerated) return;

        // Create Stage
        this.stage = document.createElement('div');
        this.stage.className = 'spiral-stage-3d';
        this.stage.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            top: 0;
            left: 0;
        `;
        this.container.appendChild(this.stage);

        // Create Items
        this.images.forEach((src, i) => {
            const div = document.createElement('div');
            div.className = 'spiral-item';
            div.style.backgroundImage = `url(${src})`;
            // Ensure basic styles for 3d items if CSS is missing
            div.style.position = 'absolute';
            div.style.left = '50%';
            div.style.top = '50%';
            div.style.width = '300px';
            div.style.height = '400px';
            div.style.marginLeft = '-150px';
            div.style.marginTop = '-200px';
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';

            this.stage.appendChild(div);
            this.itemElements.push({
                el: div,
                index: i
            });
        });

        this.isGenerated = true;
        this.addEvents();
        this.animate();
    }

    // Mathematical Path Function
    getPathPos(index) {
        const theta = index * this.config.angleStep;
        const x = Math.cos(theta) * this.config.radius;
        const y = Math.sin(theta) * this.config.radius;
        const z = index * this.config.zStep;
        return { x, y, z, theta };
    }

    animate() {
        // Smooth scroll
        this.scrollProgress += (this.targetScroll - this.scrollProgress) * 0.1;

        // Current World Center (where we are on the path)
        // We want the point on the path at 'scrollProgress' to be at (0, 0, focalPoint)
        const worldPos = this.getPathPos(this.scrollProgress);

        this.itemElements.forEach(item => {
            // Layout Calculations
            const itemPos = this.getPathPos(item.index);

            // Relative Position
            // We subtract the world pos (camera movement) and add the focal point offset
            // However, since it's a spiral, simple subtraction of vectors works for translation
            // but we also need to account for the rotation if we want the "tunnel" to not rotate wildly.
            // Actually, if we just translate, the spiral stays fixed and we slide along it.
            // This means we will be "outside" looking at the spiral if we don't rotate with it.
            // But the user said "axis is turning... I don't really get to see".
            // So we SHOULD move the camera into the spiral.

            // Vector from Camera(0,0,0) to Item
            // Camera viewing direction is usually -Z or +Z. In CSS 3D, deeper is negative Z usually? 
            // Standard CSS: Z comes OUT of screen. So -Z is into screen.
            // Let's rely on standard coordinate space.

            // Let's implement: Active Item is at (0,0,0).
            const relZ = (item.index - this.scrollProgress) * this.config.zStep;

            // If we just use the spiral equation for X/Y based on item index:
            // x = R * cos(theta), y = R * sin(theta)
            // It spirals around 0,0.
            // As we scroll Z, items come closer.
            // But the "Active" item might be at X=R, Y=0. That's off-center.
            // We want the Active Item to be at X=0, Y=0.

            // So we must offset the entire stage by the inverse of the active item's X/Y.
            const activePos = this.getPathPos(this.scrollProgress);

            const dx = itemPos.x - activePos.x;
            const dy = itemPos.y - activePos.y; // Or + depending on coord system

            // We also want to rotate the item so it faces inward? Or just flat?
            // Let's start with flat 2D billboards that spiral.

            const dz = relZ + this.config.focalPoint; // Push back to focal point

            // Opacity/Visibility Optimization
            const opacity = this.calculateOpacity(dz);
            if (opacity <= 0.01) {
                item.el.style.display = 'none';
                return;
            }
            item.el.style.display = 'block';
            item.el.style.opacity = opacity;

            // Transform
            const transform = `translate3d(${dx}px, ${dy}px, ${dz}px)`;
            item.el.style.transform = transform;
        });

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    calculateOpacity(z) {
        // Fade out if too close (behind camera) or too far
        // Z=0 is screen. Positive is towards user. Negative is deep.
        // Wait, focalPoint is -400.
        // If z > 100 (past screen), fade out.
        // If z < -2000 (far away), fade out.

        let op = 1;
        if (z > 200) op = 0;
        else if (z > 0) op = 1 - (z / 200);
        else if (z < -3000) op = 0;
        else if (z < -1000) op = 1 - ((-z - 1000) / 2000);

        return op;
    }

    onWheel(e) {
        // Adjust speed
        this.targetScroll += e.deltaY * 0.002;

        // Clamp
        if (this.targetScroll < 0) this.targetScroll = 0;
        if (this.targetScroll > this.images.length - 1) this.targetScroll = this.images.length - 1;
    }

    onResize() {
        // Config handler
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
        if (this.stage) this.stage.remove();
        this.isGenerated = false;
        this.itemElements = [];
    }
}

// Global Export
window.SpiralEffect = SpiralEffect;
