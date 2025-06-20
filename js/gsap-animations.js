/*
 * GSAP Animations for Crymare Gallery
 * Premium animation effects for an immersive art gallery experience
 * Features: Scroll triggers, hover effects, staggered reveals, parallax, and interactive elements
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // =========================
    // 1. PAGE LOAD ANIMATIONS
    // =========================
    
    // Logo entrance with elegant reveal
    gsap.from('.logo a', {
        duration: 1.5,
        y: -50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });
    
    // Navigation staggered reveal
    gsap.from('.main-nav ul li', {
        duration: 1,
        y: -30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.8
    });
    
    // Hero slideshow entrance
    gsap.from('.slideshow-container', {
        duration: 1.8,
        scale: 0.9,
        opacity: 0,
        ease: 'power3.out',
        delay: 1.2
    });
    
    // =========================
    // 2. SCROLL TRIGGERED ANIMATIONS
    // =========================
    
    // Section titles elegant reveal
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.2,
            y: 60,
            opacity: 0,
            ease: 'power3.out'
        });
    });
    
    // Enhanced artwork cards with progressive opacity animation
    if (window.innerWidth <= 768) {
        // Mobile: Progressive opacity-based scroll animation
        gsap.utils.toArray('.artwork-card').forEach((card, index) => {
            // Set initial state
            gsap.set(card, { opacity: 0.1, y: 20, scale: 0.98 });
            
            // Progressive scroll-based animation
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 100%',
                    end: 'bottom 20%',
                    scrub: 1.5, // Smooth scrubbing animation
                    onUpdate: (self) => {
                        // Calculate progress through viewport
                        const progress = self.progress;
                        // Apply progressive opacity and scaling
                        const opacity = Math.min(0.1 + (progress * 0.9), 1);
                        const y = 20 * (1 - progress);
                        const scale = 0.98 + (0.02 * progress);
                        
                        gsap.set(card, {
                            opacity: opacity,
                            y: y,
                            scale: scale
                        });
                    }
                },
                duration: 0, // Duration handled by scrub
                ease: 'none'
            });
            
            // Subtle parallax effect on card images
            gsap.to(card.querySelector('img'), {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                y: -20,
                ease: 'none'
            });
        });
    } else {
        // Desktop: Keep existing animation
        gsap.utils.toArray('.artwork-card').forEach((card, index) => {
            // Main card animation
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'bottom 15%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1,
                y: 80,
                opacity: 0,
                scale: 0.95,
                ease: 'power3.out',
                delay: index * 0.1
            });
            
            // Subtle parallax effect on card images
            gsap.to(card.querySelector('img'), {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                },
                y: -30,
                ease: 'none'
            });
        });
    }
    
    // Theme cards reveal with rotation
    gsap.utils.toArray('.theme-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.2,
            y: 60,
            rotation: 5,
            opacity: 0,
            ease: 'power3.out',
            delay: index * 0.15
        });
    });
    
    // Content sections smooth reveal
    gsap.utils.toArray('.ready-to-hang, .gallery-description, .email-subscription').forEach(section => {
        gsap.from(section.querySelector('.container'), {
            scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.5,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });
    });
    
    // Footer reveal
    gsap.from('.main-footer', {
        scrollTrigger: {
            trigger: '.main-footer',
            start: 'top 90%',
            toggleActions: 'play none none none'
        },
        duration: 1.5,
        y: 100,
        opacity: 0,
        ease: 'power3.out'
    });
    
    // =========================
    // 3. INTERACTIVE HOVER EFFECTS
    // =========================
    
    // Artwork cards sophisticated hover (fixed grid displacement)
    gsap.utils.toArray('.artwork-card').forEach(card => {
        const image = card.querySelector('img');
        const overlay = card.querySelector('.artwork-overlay');
        const info = card.querySelector('.artwork-info');
        
        // Create timeline for smooth sequencing
        const hoverTl = gsap.timeline({ paused: true });
        
        hoverTl
            .to(card, { 
                y: -15, 
                duration: 0.4, 
                ease: 'power2.out',
                force3D: true,
                transformOrigin: 'center center'
            })
            .to(image, { 
                scale: 1.08, 
                duration: 0.4, 
                ease: 'power2.out',
                force3D: true 
            }, 0)
            .to(overlay, { 
                opacity: 1, 
                duration: 0.3, 
                ease: 'power2.out' 
            }, 0.1)
            .to(info, { 
                y: -5, 
                duration: 0.3, 
                ease: 'power2.out',
                force3D: true 
            }, 0.1);
        
        card.addEventListener('mouseenter', () => hoverTl.play());
        card.addEventListener('mouseleave', () => hoverTl.reverse());
    });
    
    // Theme cards hover with depth
    gsap.utils.toArray('.theme-card').forEach(card => {
        const image = card.querySelector('img');
        const title = card.querySelector('h3');
        
        const hoverTl = gsap.timeline({ paused: true });
        
        hoverTl
            .to(card, { y: -10, scale: 1.03, duration: 0.4, ease: 'power2.out' })
            .to(image, { scale: 1.1, duration: 0.4, ease: 'power2.out' }, 0)
            .to(title, { y: -8, duration: 0.3, ease: 'power2.out' }, 0.1);
        
        card.addEventListener('mouseenter', () => hoverTl.play());
        card.addEventListener('mouseleave', () => hoverTl.reverse());
    });
    
    // Navigation hover effects
    gsap.utils.toArray('.main-nav a').forEach(link => {
        const hoverTl = gsap.timeline({ paused: true });
        
        hoverTl.to(link, { 
            y: -3, 
            scale: 1.05, 
            duration: 0.3, 
            ease: 'power2.out' 
        });
        
        link.addEventListener('mouseenter', () => hoverTl.play());
        link.addEventListener('mouseleave', () => hoverTl.reverse());
    });
    
    // CTA buttons premium hover
    gsap.utils.toArray('.cta-button').forEach(button => {
        const hoverTl = gsap.timeline({ paused: true });
        
        hoverTl
            .to(button, { y: -5, scale: 1.05, duration: 0.3, ease: 'power2.out' })
            .to(button, { boxShadow: '0 15px 35px rgba(187, 134, 252, 0.4)', duration: 0.3 }, 0);
        
        button.addEventListener('mouseenter', () => hoverTl.play());
        button.addEventListener('mouseleave', () => hoverTl.reverse());
    });
    
    // =========================
    // 4. ADVANCED EFFECTS
    // =========================
    
    // Parallax background for hero section
    gsap.to('.hero-slideshow .slide.active', {
        scrollTrigger: {
            trigger: '.hero-slideshow',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
        },
        yPercent: -20,
        ease: 'none'
    });
    
    // Smooth scroll behavior
    gsap.to("body", {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5
        },
        ease: "none"
    });
    
    // =========================
    // 5. REFRESH SCROLLTRIGGER
    // =========================
    
    // Ensure proper calculations after images load
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
    
    // Handle resize events
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
    
    console.log('🎨 Crymare Gallery GSAP animations initialized successfully!');
    console.log('📱 Mobile progressive scroll animation enabled');
}); 