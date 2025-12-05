/**
 * SpiralEffect.js
 * Enhanced "Elongated Helix" effect with smooth animations, snap scrolling,
 * keyboard navigation, and polished visual effects.
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
        this.isSnapping = false;
        this.snapTimeout = null;

        // Enhanced Configuration
        this.config = {
            radius: 450,            // Distance from center to images (reduced to see full spiral)
            angleStep: 40,          // Degrees between items (tighter spiral)
            heightStep: 200,        // Vertical distance between items
            perspective: 1200,      // Camera perspective for depth
            cameraDistance: 900,    // How far back the camera sits from the spiral center
            itemWidth: 380,         // Image width
            itemHeight: 280,        // Image height
            scrollSensitivity: 0.008, // Scroll speed (increased for better response)
            snapThreshold: 0.4,     // When to snap to nearest image (increased to allow small scrolls)
            animationEase: 0.15,    // Smooth animation factor
            focusScale: 1.2,        // Scale of focused image
            focusGlow: 'rgba(0, 255, 255, 0.8)', // Glow color for focused image
        };

        // Bindings
        this.resizeHandler = this.onResize.bind(this);
        this.wheelHandler = this.onWheel.bind(this);
        this.keyHandler = this.onKeyDown.bind(this);
        this.rafId = null;
        this.draggable = null;
    }

    init() {
        console.log('[SpiralEffect] init() called');
        console.log('[SpiralEffect] Images array:', this.images);
        console.log('[SpiralEffect] Images count:', this.images.length);
        console.log('[SpiralEffect] Container:', this.container);

        if (this.isGenerated) {
            console.log('[SpiralEffect] Already generated, returning');
            return;
        }

        // Container Style (Camera POV)
        this.container.style.perspective = `${this.config.perspective}px`;
        this.container.style.perspectiveOrigin = '50% 50%';
        this.container.style.overflow = 'hidden';
        console.log('[SpiralEffect] Container perspective set');

        // Create Stage (positions camera back from spiral)
        this.stage = document.createElement('div');
        this.stage.className = 'spiral-stage';
        Object.assign(this.stage.style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            top: '0',
            left: '0',
            // Push the entire scene back so we can see the full spiral
            transform: `translateZ(-${this.config.cameraDistance}px)`
        });
        this.container.appendChild(this.stage);

        // Create Cylinder (The spiral that rotates around vertical axis)
        this.cylinder = document.createElement('div');
        this.cylinder.className = 'spiral-cylinder';
        Object.assign(this.cylinder.style, {
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            top: '0',
            left: '0',
            transition: 'none'
        });
        this.stage.appendChild(this.cylinder);

        // Create Items on the helix
        this.images.forEach((src, i) => {
            const div = document.createElement('div');
            div.className = 'spiral-item';
            div.dataset.index = i;

            // Create inner image element for better control
            const img = document.createElement('div');
            img.className = 'spiral-item-image';
            img.style.cssText = `
                width: 100%;
                height: 100%;
                background-image: url(${src});
                background-size: cover;
                background-position: center;
                border-radius: 12px;
            `;
            div.appendChild(img);

            // Main container styles
            Object.assign(div.style, {
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: `${this.config.itemWidth}px`,
                height: `${this.config.itemHeight}px`,
                marginLeft: `-${this.config.itemWidth / 2}px`,
                marginTop: `-${this.config.itemHeight / 2}px`,
                borderRadius: '12px',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.4s ease, border-color 0.4s ease, transform 0.3s ease',
                backfaceVisibility: 'hidden'
            });

            // Click handler - navigate to this image
            div.addEventListener('click', () => {
                this.navigateTo(i);
            });

            // Helix positioning:
            // 1. Rotate around Y-axis by angle
            // 2. Push out to radius
            // 3. Move vertically to create helix
            // 4. Rotate to face center (rotateY 180 to face inward)
            const theta = i * this.config.angleStep;
            const y = i * this.config.heightStep;

            div.style.transform = `
                translateY(${y}px)
                rotateY(${theta}deg)
                translateZ(${this.config.radius}px)
                rotateY(180deg)
            `;

            this.cylinder.appendChild(div);
            this.itemElements.push({
                el: div,
                index: i,
                theta: theta,
                y: y
            });
        });

        // Add scroll hint indicator
        this.createScrollHint();

        this.isGenerated = true;
        this.addEvents();
        this.animate();

        // Initial position animation
        this.animateIn();
    }

    createScrollHint() {
        const hint = document.createElement('div');
        hint.className = 'spiral-scroll-hint';
        hint.innerHTML = `
            <div class="scroll-hint-text">Scroll to explore</div>
            <div class="scroll-hint-arrow">↓</div>
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
            opacity: '1',
            transition: 'opacity 0.5s ease',
            zIndex: '1000'
        });
        this.container.appendChild(hint);
        this.scrollHint = hint;

        // Animate the arrow
        const arrow = hint.querySelector('.scroll-hint-arrow');
        if (arrow) {
            arrow.style.cssText = `
                font-size: 24px;
                animation: bounce 1.5s infinite;
            `;
        }

        // Add keyframes for bounce animation
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
        // Fade in items with stagger
        this.itemElements.forEach((item, i) => {
            item.el.style.opacity = '0';
            setTimeout(() => {
                item.el.style.transition = 'opacity 0.6s ease';
                item.el.style.opacity = '1';
            }, i * 80);
        });
    }

    animate() {
        // Smooth scroll interpolation
        const diff = this.targetScroll - this.scrollProgress;

        if (Math.abs(diff) > 0.0005) {
            this.scrollProgress += diff * this.config.animationEase;
        } else {
            this.scrollProgress = this.targetScroll;
        }

        // Cylinder rotation and vertical movement
        const yPos = -this.scrollProgress * this.config.heightStep;
        const rotY = -this.scrollProgress * this.config.angleStep;

        this.cylinder.style.transform = `
            translateY(${yPos}px)
            rotateY(${rotY}deg)
        `;

        // Update individual items (opacity, scale, focus effects)
        this.updateItems();

        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }

    updateItems() {
        const focusedIndex = Math.round(this.scrollProgress);

        this.itemElements.forEach(item => {
            const dist = Math.abs(item.index - this.scrollProgress);
            const isFocused = dist < 0.5;

            // Calculate opacity based on distance from focus
            // Items further away fade out gracefully
            let opacity = 1;
            if (dist > 2) {
                opacity = Math.max(0.2, 1 - (dist - 2) / 3);
            }

            // Scale effect for focused item
            let scale = 1;
            if (dist < 1) {
                scale = 1 + (1 - dist) * (this.config.focusScale - 1);
            }

            // Apply styles
            item.el.style.opacity = opacity;

            // Focus effects - bring the focused item forward to the center
            if (isFocused) {
                // Focused image: bring it forward to exactly face the viewer
                // translateZ brings it toward camera, out of the spiral
                const forwardZ = this.config.cameraDistance - 100; // Come forward almost to camera position

                item.el.style.boxShadow = `0 0 60px ${this.config.focusGlow}, 0 25px 80px rgba(0, 0, 0, 0.9)`;
                item.el.style.borderColor = this.config.focusGlow;
                item.el.style.transform = `
                    translateZ(${forwardZ}px)
                    scale(${scale})
                `;
                item.el.style.zIndex = '100';
                item.el.style.pointerEvents = 'auto';
                item.el.classList.add('focused');
            } else {
                // Non-focused: stay in the spiral helix position
                item.el.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.6)';
                item.el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                item.el.style.transform = `
                    translateY(${item.y}px)
                    rotateY(${item.theta}deg)
                    translateZ(${this.config.radius}px)
                    rotateY(180deg)
                `;
                item.el.style.zIndex = '1';
                item.el.style.pointerEvents = dist < 1.5 ? 'auto' : 'none';
                item.el.classList.remove('focused');
            }
        });

        // Hide scroll hint after user starts scrolling
        if (this.scrollHint && this.scrollProgress > 0.3) {
            this.scrollHint.style.opacity = '0';
        }
    }

    onWheel(e) {
        e.preventDefault();

        // Clear any pending snap
        if (this.snapTimeout) {
            clearTimeout(this.snapTimeout);
        }
        this.isSnapping = false;

        // Normalize scroll delta for different devices/browsers
        // High-precision trackpads might send tiny deltaY values
        let delta = e.deltaY;

        // Handle different deltaMode values (0=pixels, 1=lines, 2=pages)
        if (e.deltaMode === 1) {
            delta *= 40; // Convert lines to pixels
        } else if (e.deltaMode === 2) {
            delta *= 800; // Convert pages to pixels
        }

        // Apply sensitivity with minimum movement threshold
        const scrollAmount = delta * this.config.scrollSensitivity;

        // Apply scroll
        this.targetScroll += scrollAmount;

        // Clamp to valid range
        this.targetScroll = Math.max(0, Math.min(this.images.length - 1, this.targetScroll));

        // Schedule snap after scroll stops (longer delay for continuous scrolling)
        this.snapTimeout = setTimeout(() => {
            this.snapToNearest();
        }, 250);
    }

    snapToNearest() {
        const nearest = Math.round(this.targetScroll);
        const delta = nearest - this.targetScroll;
        const absDelta = Math.abs(delta);

        // Always snap if we're not already at a whole number
        if (absDelta > 0.01) {
            this.isSnapping = true;

            // Smooth snap animation using GSAP if available
            if (window.gsap) {
                // Adjust duration based on distance - shorter for small movements
                const duration = Math.min(0.5, Math.max(0.2, absDelta * 0.8));
                gsap.to(this, {
                    targetScroll: nearest,
                    duration: duration,
                    ease: 'power2.out',
                    onComplete: () => {
                        this.isSnapping = false;
                    }
                });
            } else {
                // Fallback: smoothly approach the target
                this.targetScroll = nearest;
                this.isSnapping = false;
            }
        }
    }

    navigateTo(index) {
        if (window.gsap) {
            gsap.to(this, {
                targetScroll: index,
                duration: 0.8,
                ease: 'power2.inOut'
            });
        } else {
            this.targetScroll = index;
        }
    }

    onKeyDown(e) {
        if (!this.container.closest('.gallery-mode-container.active')) return;

        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                this.navigateTo(Math.min(this.images.length - 1, Math.round(this.targetScroll) + 1));
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                this.navigateTo(Math.max(0, Math.round(this.targetScroll) - 1));
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
        // Re-center perspective on resize
        if (this.container) {
            this.container.style.perspectiveOrigin = '50% 50%';
        }
    }

    addEvents() {
        window.addEventListener('wheel', this.wheelHandler, { passive: false });
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('keydown', this.keyHandler);

        // Touch/Drag support using GSAP Draggable if available
        if (window.Draggable) {
            const dragProxy = document.createElement('div');
            dragProxy.style.cssText = 'position:absolute; width:100%; height:100%; top:0; left:0;';
            this.container.appendChild(dragProxy);

            this.draggable = Draggable.create(dragProxy, {
                type: 'y',
                trigger: this.container,
                inertia: true,
                onDrag: () => {
                    const delta = this.draggable[0].deltaY * -0.005;
                    this.targetScroll = Math.max(0, Math.min(this.images.length - 1, this.targetScroll + delta));
                },
                onDragEnd: () => {
                    this.snapToNearest();
                },
                onThrowUpdate: () => {
                    const delta = this.draggable[0].deltaY * -0.005;
                    this.targetScroll = Math.max(0, Math.min(this.images.length - 1, this.targetScroll + delta));
                },
                onThrowComplete: () => {
                    this.snapToNearest();
                }
            });

            this.dragProxy = dragProxy;
        }
    }

    removeEvents() {
        window.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('keydown', this.keyHandler);

        if (this.draggable && this.draggable[0]) {
            this.draggable[0].kill();
        }
    }

    destroy() {
        this.removeEvents();

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        if (this.snapTimeout) {
            clearTimeout(this.snapTimeout);
        }

        if (this.stage) {
            this.stage.remove();
        }

        if (this.cylinder) {
            this.cylinder.remove();
        }

        if (this.scrollHint) {
            this.scrollHint.remove();
        }

        if (this.dragProxy) {
            this.dragProxy.remove();
        }

        this.isGenerated = false;
        this.itemElements = [];
    }
}

window.SpiralEffect = SpiralEffect;
