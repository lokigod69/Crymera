/*
 * Phase 3: Advanced GSAP Animations for Crymare Gallery Pages
 * Premium effects: Magnetic cursor, image reveals, smooth transitions, zoom effects
 * Updated: Enhanced loading animations for mobile experience
 * Updated: Progressive scroll-based opacity animations for mobile artwork cards
 */

gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin);

class GalleryAnimations {
    constructor() {
        this.isDesktop = window.innerWidth > 1024;
        this.cursor = null;
        this.currentModal = null;
        this.init();
    }

    init() {
        this.createCustomCursor();
        this.setupLoadingAnimations();
        this.setupPageLoadAnimations();
        this.setupScrollAnimations();
        this.setupModalAnimations();
        this.setupMagneticEffects();
        this.setupImageRevealAnimations();
        this.setupViewModeTransitions();
        
        console.log('🎨 Phase 3: Advanced gallery animations with loading states initialized!');
    }

    // =========================
    // LOADING ANIMATIONS
    // =========================
    setupLoadingAnimations() {
        // Animate loading overlay entrance
        const overlay = document.getElementById('gallery-loading-overlay');
        if (overlay) {
            gsap.from(overlay, {
                duration: 0.8,
                opacity: 0,
                scale: 0.9,
                ease: 'power2.out'
            });

            // Animate spinner
            const spinner = overlay.querySelector('.loading-spinner');
            if (spinner) {
                gsap.from(spinner, {
                    duration: 1,
                    scale: 0,
                    rotation: -180,
                    ease: 'back.out(1.7)',
                    delay: 0.3
                });
            }

            // Animate loading text
            const loadingText = overlay.querySelector('.loading-text');
            if (loadingText) {
                gsap.from(loadingText, {
                    duration: 0.8,
                    y: 30,
                    opacity: 0,
                    ease: 'power2.out',
                    delay: 0.5
                });
            }
        }

        // Animate skeleton grid entrance
        const skeletonItems = document.querySelectorAll('.grid-skeleton-item');
        if (skeletonItems.length > 0) {
            gsap.from(skeletonItems, {
                duration: 0.6,
                y: 50,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out',
                delay: 0.8
            });
        }

        // Animate mobile loading message
        const mobileMessage = document.getElementById('mobile-loading-message');
        if (mobileMessage && this.isDesktop === false) {
            gsap.from(mobileMessage, {
                duration: 0.8,
                y: 30,
                opacity: 0,
                ease: 'power2.out',
                delay: 1
            });
        }
    }

    // =========================
    // CUSTOM MAGNETIC CURSOR
    // =========================
    createCustomCursor() {
        if (!this.isDesktop) return;

        // Create cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = `
            <div class="cursor-dot"></div>
            <div class="cursor-ring"></div>
        `;
        document.body.appendChild(cursor);
        this.cursor = cursor;

        // Add cursor styles
        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
            }
            .cursor-dot {
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
            }
            .cursor-ring {
                width: 40px;
                height: 40px;
                border: 2px solid rgba(201, 169, 110, 0.5);
                border-radius: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
                transition: all 0.15s ease;
            }
            body { cursor: none; }
            .cursor-hover .cursor-ring {
                width: 80px;
                height: 80px;
                border-color: rgba(201, 169, 110, 0.8);
            }
        `;
        document.head.appendChild(style);

        // Cursor movement
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor following
        gsap.ticker.add(() => {
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;
            
            gsap.set(this.cursor, {
                x: cursorX,
                y: cursorY
            });
        });

        // Hover effects
        document.addEventListener('mouseenter', (e) => {
            if (e.target && e.target.matches && e.target.matches('.gallery-grid-item, .view-mode-btn, .related-card')) {
                document.body.classList.add('cursor-hover');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target && e.target.matches && e.target.matches('.gallery-grid-item, .view-mode-btn, .related-card')) {
                document.body.classList.remove('cursor-hover');
            }
        }, true);
    }

    // =========================
    // PAGE LOAD ANIMATIONS
    // =========================
    setupPageLoadAnimations() {
        const tl = gsap.timeline();

        // Header entrance
        const galleryHeader = document.querySelector('.gallery-header');
        if (galleryHeader) {
            tl.from(galleryHeader, {
                duration: 1.5,
                y: -100,
                opacity: 0,
                ease: 'power3.out'
            });
        }

        // Breadcrumb (if exists)
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            tl.from(breadcrumb, {
                duration: 1,
                x: -50,
                opacity: 0,
                ease: 'power2.out'
            }, 0.3);
        }

        // Gallery title
        const galleryTitle = document.querySelector('.gallery-title');
        if (galleryTitle) {
            tl.from(galleryTitle, {
                duration: 1.2,
                y: 50,
                opacity: 0,
                ease: 'power3.out'
            }, 0.5);
        }

        // Gallery description (if exists)
        const galleryDescription = document.querySelector('.gallery-description');
        if (galleryDescription) {
            tl.from(galleryDescription, {
                duration: 1,
                y: 30,
                opacity: 0,
                ease: 'power2.out'
            }, 0.7);
        }

        // Gallery meta (if exists)
        const galleryMeta = document.querySelectorAll('.gallery-meta > *');
        if (galleryMeta.length > 0) {
            tl.from(galleryMeta, {
                duration: 0.8,
                y: 20,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out'
            }, 0.9);
        }

        // Controls entrance (if exists)
        const galleryControls = document.querySelector('.gallery-controls');
        if (galleryControls) {
            gsap.from(galleryControls, {
                duration: 1.2,
                y: 30,
                opacity: 0,
                ease: 'power3.out',
                delay: 1.2
            });
        }
    }

    // =========================
    // SCROLL TRIGGERED ANIMATIONS
    // =========================
    setupScrollAnimations() {
        // Removed problematic scroll animations
        // Grid items now have consistent visibility with just hover effects
        
        // Keep only related artworks reveal (if they exist)
        gsap.utils.toArray('.related-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                duration: 0.8,
                y: 30,
                opacity: 0,
                ease: 'power2.out',
                delay: index * 0.1
            });
        });
    }

    // =========================
    // IMAGE REVEAL ANIMATIONS
    // =========================
    setupImageRevealAnimations() {
        // Enhanced grid reveal animation when transitioning from skeleton
        const gridContainer = document.getElementById('gallery-grid');
        if (gridContainer) {
            // Set up observer for when grid becomes visible
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const displayValue = gridContainer.style.display;
                        if (displayValue === 'grid' && !gridContainer.hasAttribute('data-animated')) {
                            gridContainer.setAttribute('data-animated', 'true');
                            this.animateGridReveal();
                        }
                    }
                });
            });
            
            observer.observe(gridContainer, {
                attributes: true,
                attributeFilter: ['style']
            });
        }
        
        console.log('Grid reveal animations ready for loading transition');
    }

    animateGridReveal() {
        const gridItems = document.querySelectorAll('.gallery-grid-item');
        
        // Animate grid items entrance
        gsap.fromTo(gridItems, 
            {
                opacity: 0,
                y: 30,
                scale: 0.9
            },
            {
                duration: 0.8,
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.1,
                ease: 'power3.out'
            }
        );

        // Add shimmer effect for mobile
        if (!this.isDesktop) {
            gridItems.forEach((item, index) => {
                const img = item.querySelector('img');
                if (img) {
                    gsap.from(img, {
                        duration: 1.2,
                        filter: 'brightness(0.3)',
                        ease: 'power2.out',
                        delay: index * 0.05
                    });
                }
            });
        }
    }

    // =========================
    // MODAL ANIMATIONS
    // =========================
    setupModalAnimations() {
        const modal = document.getElementById('image-modal');
        if (!modal) return;

        // Enhanced modal open animation
        const originalOpenModal = window.galleryLoader?.openModal;
        if (originalOpenModal && window.galleryLoader) {
            window.galleryLoader.openModal = (index) => {
                originalOpenModal.call(window.galleryLoader, index);
                
                // Animate modal entrance
                gsap.fromTo(modal, 
                    { 
                        opacity: 0,
                        scale: this.isDesktop ? 0.8 : 1,
                        filter: 'blur(10px)'
                    },
                    {
                        duration: 0.6,
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        ease: 'power3.out'
                    }
                );

                // Animate image entrance
                const modalImage = modal.querySelector('.modal-image');
                if (modalImage) {
                    gsap.fromTo(modalImage,
                        {
                            y: this.isDesktop ? 50 : 30,
                            opacity: 0,
                            scale: 0.9
                        },
                        {
                            duration: 0.8,
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            ease: 'power3.out',
                            delay: 0.2
                        }
                    );
                }

                // Mobile-specific animations
                if (!this.isDesktop) {
                    // Animate mobile header
                    const mobileHeader = modal.querySelector('.mobile-modal-header');
                    if (mobileHeader) {
                        gsap.from(mobileHeader, {
                            duration: 0.6,
                            y: -60,
                            opacity: 0,
                            ease: 'power2.out',
                            delay: 0.3
                        });
                    }

                    // Animate touch zones with subtle hint
                    const touchZones = modal.querySelectorAll('.touch-zone');
                    if (touchZones.length > 0) {
                        gsap.from(touchZones, {
                            duration: 0.8,
                            opacity: 0,
                            scale: 0.8,
                            stagger: 0.1,
                            ease: 'power2.out',
                            delay: 0.5
                        });
                    }

                    // Animate swipe indicator
                    const swipeIndicator = modal.querySelector('.swipe-indicator');
                    if (swipeIndicator) {
                        gsap.from(swipeIndicator, {
                            duration: 0.8,
                            y: 30,
                            opacity: 0,
                            scale: 0.8,
                            ease: 'back.out(1.7)',
                            delay: 1.2
                        });
                    }
                } else {
                    // Desktop controls animation
                    const desktopControls = modal.querySelectorAll('.modal-prev, .modal-next, .modal-close');
                    if (desktopControls.length > 0) {
                        gsap.from(desktopControls, {
                            duration: 0.6,
                            opacity: 0,
                            scale: 0.8,
                            stagger: 0.1,
                            ease: 'back.out(1.7)',
                            delay: 0.4
                        });
                    }
                }
            };
        }

        // Enhanced modal close animation
        const originalCloseModal = window.galleryLoader?.closeModal;
        if (originalCloseModal && window.galleryLoader) {
            window.galleryLoader.closeModal = () => {
                gsap.to(modal, {
                    duration: 0.4,
                    opacity: 0,
                    scale: this.isDesktop ? 0.9 : 1,
                    filter: 'blur(5px)',
                    ease: 'power2.in',
                    onComplete: () => {
                        originalCloseModal.call(window.galleryLoader);
                    }
                });
            };
        }

        // Enhanced image transition animations with smooth swipe effects
        const originalUpdateModalImage = window.galleryLoader?.updateModalImage;
        if (originalUpdateModalImage && window.galleryLoader) {
            window.galleryLoader.updateModalImage = function(direction = 'next') {
                const modalImage = modal.querySelector('.modal-image');
                const counter = modal.querySelector('.modal-counter');

                if (!modalImage) return; // Exit if modal image doesn't exist

                // Determine swipe direction and distances
                const isMobileView = window.innerWidth <= 768;
                const slideDistance = isMobileView ? window.innerWidth : 100;
                const isSwipeLeft = direction === 'next';
                const exitX = isSwipeLeft ? -slideDistance : slideDistance;
                const enterX = isSwipeLeft ? slideDistance : -slideDistance;

                // Create smooth swipe-out animation
                gsap.to(modalImage, {
                    duration: 0.4,
                    x: exitX,
                    opacity: 0,
                    ease: 'power2.in',
                    onComplete: () => {
                        // Update image source
                        originalUpdateModalImage.call(this);
                        
                        // Animate counter update
                        if (counter) {
                            gsap.fromTo(counter, 
                                { scale: 1 },
                                {
                                    duration: 0.3,
                                    scale: 1.1,
                                    ease: 'back.out(1.7)',
                                    yoyo: true,
                                    repeat: 1
                                }
                            );
                        }
                        
                        // Prepare new image for swipe-in animation
                        gsap.set(modalImage, { 
                            x: enterX, 
                            opacity: 0 
                        });
                        
                        // Animate new image sliding in
                        gsap.to(modalImage, {
                            duration: 0.5,
                            x: 0,
                            opacity: 1,
                            ease: 'power3.out',
                            delay: 0.1
                        });
                    }
                });
            };
        }

        // Enhanced navigation methods with direction tracking
        const originalPrevImage = window.galleryLoader?.prevImage;
        if (originalPrevImage && window.galleryLoader) {
            window.galleryLoader.prevImage = function() {
                this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
                this.updateModalImage('prev'); // Pass direction
            };
        }

        const originalNextImage = window.galleryLoader?.nextImage;
        if (originalNextImage && window.galleryLoader) {
            window.galleryLoader.nextImage = function() {
                this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
                this.updateModalImage('next'); // Pass direction
            };
        }
    }

    // =========================
    // MAGNETIC EFFECTS
    // =========================
    setupMagneticEffects() {
        if (!this.isDesktop) return;

        const magneticElements = document.querySelectorAll('.gallery-grid-item, .view-mode-btn');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(element, {
                    duration: 0.6,
                    x: x * 0.1,
                    y: y * 0.1,
                    ease: 'power2.out'
                });
            });
            
            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    duration: 0.6,
                    x: 0,
                    y: 0,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }

    // =========================
    // VIEW MODE TRANSITIONS
    // =========================
    setupViewModeTransitions() {
        const originalSwitchViewMode = window.galleryLoader?.switchViewMode;
        if (originalSwitchViewMode && window.galleryLoader) {
            window.galleryLoader.switchViewMode = function(mode) {
                const gridView = document.getElementById('gallery-grid');
                const slideshowView = document.getElementById('gallery-slideshow');
                const buttons = document.querySelectorAll('.view-mode-btn');

                // Animate button states
                buttons.forEach(btn => {
                    gsap.to(btn, {
                        duration: 0.3,
                        scale: btn.dataset.mode === mode ? 1.05 : 1,
                        ease: 'power2.out'
                    });
                });

                if (mode === 'grid') {
                    // Animate to grid
                    gsap.to(slideshowView, {
                        duration: 0.5,
                        opacity: 0,
                        y: 30,
                        ease: 'power2.in',
                        onComplete: () => {
                            slideshowView.classList.add('hidden');
                            gridView.style.display = 'grid';
                            
                            gsap.fromTo(gridView,
                                { opacity: 0, y: 30 },
                                {
                                    duration: 0.6,
                                    opacity: 1,
                                    y: 0,
                                    ease: 'power3.out'
                                }
                            );
                        }
                    });
                } else {
                    // Animate to slideshow
                    gsap.to(gridView, {
                        duration: 0.5,
                        opacity: 0,
                        y: -30,
                        ease: 'power2.in',
                        onComplete: () => {
                            gridView.style.display = 'none';
                            slideshowView.classList.remove('hidden');
                            
                            gsap.fromTo(slideshowView,
                                { opacity: 0, y: 30 },
                                {
                                    duration: 0.6,
                                    opacity: 1,
                                    y: 0,
                                    ease: 'power3.out'
                                }
                            );
                        }
                    });
                }

                // Update button states
                originalSwitchViewMode.call(this, mode);
            };
        }
    }

    // =========================
    // SCROLL SMOOTH PARALLAX
    // =========================
    setupParallaxEffects() {
        gsap.utils.toArray('.gallery-grid-item img').forEach(img => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                y: -50,
                ease: 'none'
            });
        });
    }
}

// Initialize when DOM and gallery loader are ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for gallery loader to initialize
    setTimeout(() => {
        if (window.galleryLoader) {
            window.galleryAnimations = new GalleryAnimations();
        }
    }, 100);
});