/**
 * SpiralEffect.js
 * Simplified "Helix" effect - images arranged in a vertical spiral/helix pattern.
 * Scrolling rotates and moves the spiral so each image comes to the front in turn.
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
        this.snapTimeout = null;

        // Configuration
        this.config = {
            radius: 500,            // Distance from center axis to images
            angleStep: 45,          // Degrees between items around the spiral (360/8 = 8 items per revolution)
            heightStep: 200,        // Vertical distance between items
            perspective: 1400,      // Camera perspective
            itemWidth: 280,         // Image width (VERTICAL/PORTRAIT format)
            itemHeight: 380,        // Image height (VERTICAL/PORTRAIT format)
            scrollSensitivity: 0.0015, // Very smooth scrolling
            animationEase: 0.1,     // Smooth animation interpolation
            focusGlow: 'rgba(0, 255, 255, 0.8)',
        };

        // Bindings
        this.resizeHandler = this.onResize.bind(this);
        this.wheelHandler = this.onWheel.bind(this);
        this.keyHandler = this.onKeyDown.bind(this);
        this.rafId = null;
    }

    init() {
        console.log('[SpiralEffect] Initializing with', this.images.length, 'images');

        if (this.isGenerated) return;

        // Container setup - this is our "camera"
        Object.assign(this.container.style, {
            perspective: `${this.config.perspective}px`,
            perspectiveOrigin: '50% 50%',
            overflow: 'hidden'
        });

        // Stage - pushed back to see the spiral
        this.stage = document.createElement('div');
        this.stage.className = 'spiral-stage';
        Object.assign(this.stage.style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            top: '0',
            left: '0',
            transform: 'translateZ(-600px)' // Camera distance
        });
        this.container.appendChild(this.stage);

        // Cylinder - this rotates and moves vertically when scrolling
        this.cylinder = document.createElement('div');
        this.cylinder.className = 'spiral-cylinder';
        Object.assign(this.cylinder.style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            left: '0',
            top: '0'
        });
        this.stage.appendChild(this.cylinder);

        // Create spiral items
        this.images.forEach((src, i) => {
            const item = document.createElement('div');
            item.className = 'spiral-item';
            item.dataset.index = i;

            // Image inside
            const img = document.createElement('div');
            img.className = 'spiral-item-image';
            Object.assign(img.style, {
                width: '100%',
                height: '100%',
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '12px'
            });
            item.appendChild(img);

            // Item container styles
            Object.assign(item.style, {
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${this.config.itemWidth}px`,
                height: `${this.config.itemHeight}px`,
                marginLeft: `-${this.config.itemWidth / 2}px`,
                marginTop: `-${this.config.itemHeight / 2}px`,
                borderRadius: '12px',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease, opacity 0.3s ease'
            });

            // Click to navigate
            item.addEventListener('click', () => this.navigateTo(i));

            // Position in helix:
            // 1. Move down by heightStep * index
            // 2. Rotate around Y by angleStep * index  
            // 3. Push out to radius
            // 4. Face inward (rotate 180)
            const angle = i * this.config.angleStep;
            const yOffset = i * this.config.heightStep;

            item.style.transform = `
                translateY(${yOffset}px)
                rotateY(${angle}deg)
                translateZ(${this.config.radius}px)
                rotateY(180deg)
            `;

            this.cylinder.appendChild(item);
            this.itemElements.push({
                el: item,
                index: i,
                angle: angle,
                yOffset: yOffset
            });
        });

        // Scroll hint
        this.createScrollHint();

        this.isGenerated = true;
        this.addEvents();
        this.animate();
        this.animateIn();
    }

    createScrollHint() {
        const hint = document.createElement('div');
        hint.className = 'spiral-scroll-hint';
        hint.innerHTML = `
            <div style="margin-bottom: 5px;">SCROLL TO EXPLORE</div>
            <div style="font-size: 24px; animation: bounce 1.5s infinite;">↓</div>
        `;
        Object.assign(hint.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            textAlign: 'center',
            fontFamily: "'Orbitron', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '2px',
            zIndex: '1000',
            transition: 'opacity 0.5s'
        });
        this.container.appendChild(hint);
        this.scrollHint = hint;

        // Add bounce animation if not exists
        if (!document.getElementById('spiral-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spiral-keyframes';
            style.textContent = `
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 1; }
                    50% { transform: translateY(10px); opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    animateIn() {
        // Staggered fade in
        this.itemElements.forEach((item, i) => {
            item.el.style.opacity = '0';
            setTimeout(() => {
                item.el.style.opacity = '1';
            }, i * 100);
        });
    }

    animate() {
        // Smoothly interpolate toward target
        const diff = this.targetScroll - this.scrollProgress;
        if (Math.abs(diff) > 0.001) {
            this.scrollProgress += diff * this.config.animationEase;
        } else {
            this.scrollProgress = this.targetScroll;
        }

        // Rotate and translate the cylinder
        // As scrollProgress increases, we rotate the cylinder backward (negative Y)
        // and move it up (negative Y translation) to bring lower items into view
        const rotY = -this.scrollProgress * this.config.angleStep;
        const transY = -this.scrollProgress * this.config.heightStep;

        this.cylinder.style.transform = `
            translateY(${transY}px)
            rotateY(${rotY}deg)
        `;

        // Update visual effects on items
        this.updateItemEffects();

        this.rafId = requestAnimationFrame(() => this.animate());
    }

    updateItemEffects() {
        // Determine which item is "focused" (closest to scrollProgress)
        const focusedIndex = Math.round(this.scrollProgress);

        this.itemElements.forEach(item => {
            const distance = Math.abs(item.index - this.scrollProgress);
            const isFocused = distance < 0.5;

            // Opacity: fade distant items
            let opacity = 1;
            if (distance > 3) {
                opacity = Math.max(0.3, 1 - (distance - 3) / 5);
            }
            item.el.style.opacity = opacity;

            // Focus effects
            if (isFocused) {
                item.el.style.boxShadow = `0 0 50px ${this.config.focusGlow}, 0 20px 60px rgba(0, 0, 0, 0.8)`;
                item.el.style.borderColor = this.config.focusGlow;
                item.el.style.zIndex = '100';
            } else {
                item.el.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.6)';
                item.el.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                item.el.style.zIndex = Math.max(1, 50 - Math.floor(distance * 5));
            }
        });

        // Hide scroll hint after scrolling starts
        if (this.scrollHint && this.scrollProgress > 0.5) {
            this.scrollHint.style.opacity = '0';
        }
    }

    onWheel(e) {
        e.preventDefault();

        // Clear snap timeout
        if (this.snapTimeout) {
            clearTimeout(this.snapTimeout);
        }

        // Apply scroll
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40;
        if (e.deltaMode === 2) delta *= 800;

        this.targetScroll += delta * this.config.scrollSensitivity;

        // Clamp to valid range
        this.targetScroll = Math.max(0, Math.min(this.images.length - 1, this.targetScroll));

        // NO SNAP - allow staying between images
    }

    snapToNearest() {
        const nearest = Math.round(this.targetScroll);
        if (Math.abs(nearest - this.targetScroll) > 0.01) {
            if (window.gsap) {
                gsap.to(this, {
                    targetScroll: nearest,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            } else {
                this.targetScroll = nearest;
            }
        }
    }

    navigateTo(index) {
        if (window.gsap) {
            gsap.to(this, {
                targetScroll: index,
                duration: 0.6,
                ease: 'power2.inOut'
            });
        } else {
            this.targetScroll = index;
        }
    }

    onKeyDown(e) {
        if (!this.container.closest('.gallery-mode-container.active')) return;

        const current = Math.round(this.targetScroll);
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                this.navigateTo(Math.min(this.images.length - 1, current + 1));
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateTo(Math.max(0, current - 1));
                break;
            case 'Home':
                e.preventDefault();
                this.navigateTo(0);
                break;
            case 'End':
                e.preventDefault();
                this.navigateTo(this.images.length - 1);
                break;
        }
    }

    onResize() {
        if (this.container) {
            this.container.style.perspectiveOrigin = '50% 50%';
        }
    }

    addEvents() {
        window.addEventListener('wheel', this.wheelHandler, { passive: false });
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('keydown', this.keyHandler);
    }

    removeEvents() {
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('keydown', this.keyHandler);
    }

    destroy() {
        this.removeEvents();
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.snapTimeout) clearTimeout(this.snapTimeout);
        if (this.stage) this.stage.remove();
        if (this.scrollHint) this.scrollHint.remove();
        this.isGenerated = false;
        this.itemElements = [];
    }
}

window.SpiralEffect = SpiralEffect;
