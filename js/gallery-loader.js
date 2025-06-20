/*
 * Dynamic Gallery Loader for Crymare Gallery
 * Automatically detects and loads images based on alphabetical naming system:
 * A1-A6: Lines of Life Series 2
 * B1-Bx: Tokyo Nights
 * C1-Cx: Carnival Spirit  
 * D1-Dx: Winter Chapel
 * And so on...
 * Updated: Added artistic loading mechanisms for mobile experience
 * Updated: Enhanced with smooth swipe animations for modal navigation
 */

// Gallery series configuration with unique fonts
const GALLERY_SERIES = {
    'A': {
        title: 'Lines of Life Series 2',
        artist: 'Anastasia Dutova',
        description: 'A conceptual exploration of life\'s interconnected patterns through experimental photography and digital manipulation.',
        expectedImages: 6,
        font: 'Orbitron' // Futuristic, experimental
    },
    'B': {
        title: 'Tokyo Nights',
        artist: 'Kenji Tanaka',
        description: 'Neon-lit streets and urban landscapes capture the electric energy of Tokyo after dark.',
        expectedImages: 8,
        font: 'Audiowide' // Cyberpunk, neon aesthetic
    },
    'C': {
        title: 'Carnival Spirit',
        artist: 'Isabella Rossi',
        description: 'Vibrant celebrations and masked revelry explore themes of identity and transformation.',
        expectedImages: 7,
        font: 'Creepster' // Festive, theatrical
    },
    'D': {
        title: 'Winter Chapel',
        artist: 'Erik Larsen',
        description: 'Serene architectural photography capturing the spiritual essence of sacred spaces in winter.',
        expectedImages: 5,
        font: 'Cinzel' // Classical, architectural
    },
    'E': {
        title: 'Metamorphosis',
        artist: 'Clara Montes',
        description: 'Abstract compositions exploring transformation and change through mixed media techniques.',
        expectedImages: 9,
        font: 'Amatic SC' // Artistic, hand-drawn
    },
    'F': {
        title: 'Ocean\'s Grace',
        artist: 'David Chen',
        description: 'Underwater photography revealing the hidden beauty and grace of marine life.',
        expectedImages: 9,
        font: 'Comfortaa' // Flowing, organic
    },
    'G': {
        title: 'Crystal Bloom',
        artist: 'Julia Casesnoves',
        description: 'Macro photography of crystalline structures and botanical forms in stunning detail.',
        expectedImages: 9,
        font: 'Righteous' // Sharp, crystalline
    },
    'H': {
        title: 'Floral Explosion',
        artist: 'Ava Sinclair',
        description: 'Dynamic floral arrangements and botanical abstractions in vivid color.',
        expectedImages: 12,
        font: 'Dancing Script' // Elegant, floral
    },
    'I': {
        title: 'Deep Sea Dreamer',
        artist: 'Nixie Fisher',
        description: 'Surreal underwater landscapes exploring the mysterious depths of the ocean.',
        expectedImages: 7,
        font: 'Fredoka One' // Dreamy, bubbly
    }
};

class GalleryLoader {
    constructor() {
        this.currentSeries = null;
        this.images = [];
        this.currentImageIndex = 0;
        this.isMobile = window.innerWidth <= 768;
        this.loadingStates = {
            pageLoading: true,
            imagesLoading: true,
            individualImages: new Set()
        };
        this.init();
    }

    init() {
        // Show initial loading states
        this.showPageLoadingOverlay();
        this.showSkeletonGrid();
        
        // Get series from URL parameter or default to 'A'
        const urlParams = new URLSearchParams(window.location.search);
        this.currentSeries = urlParams.get('series') || 'A';
        
        // Load gallery content
        this.loadGalleryInfo();
        this.loadImages();
        this.setupEventListeners();
    }

    // =========================
    // LOADING STATE MANAGEMENT
    // =========================
    showPageLoadingOverlay() {
        const overlay = document.getElementById('gallery-loading-overlay');
        const loadingText = overlay.querySelector('.loading-text');
        
        // Update loading text based on viewport
        if (this.isMobile) {
            loadingText.textContent = 'Preparing Gallery...';
        }
        
        overlay.classList.remove('hidden');
    }

    hidePageLoadingOverlay() {
        const overlay = document.getElementById('gallery-loading-overlay');
        overlay.classList.add('hidden');
        this.loadingStates.pageLoading = false;
    }

    showSkeletonGrid() {
        const skeleton = document.getElementById('gallery-grid-skeleton');
        const mobileMessage = document.getElementById('mobile-loading-message');
        
        skeleton.style.display = 'grid';
        
        // Show mobile-specific message
        if (this.isMobile) {
            mobileMessage.style.display = 'block';
        }
    }

    hideSkeletonGrid() {
        const skeleton = document.getElementById('gallery-grid-skeleton');
        const mobileMessage = document.getElementById('mobile-loading-message');
        const realGrid = document.getElementById('gallery-grid');
        
        skeleton.style.display = 'none';
        mobileMessage.style.display = 'none';
        realGrid.style.display = 'grid';
        
        this.loadingStates.imagesLoading = false;
    }

    setImageLoading(index, isLoading) {
        if (isLoading) {
            this.loadingStates.individualImages.add(index);
        } else {
            this.loadingStates.individualImages.delete(index);
        }
    }

    loadGalleryInfo() {
        const series = GALLERY_SERIES[this.currentSeries];
        if (!series) {
            console.error(`Gallery series '${this.currentSeries}' not found`);
            return;
        }

        // Update page title and meta information
        document.title = `${series.title} – Crymare`;
        document.getElementById('gallery-title').textContent = `${series.title} – Crymare`;
        
        // Apply series-specific font to title
        const titleElement = document.getElementById('main-gallery-title');
        if (titleElement) {
            titleElement.textContent = series.title;
            titleElement.style.fontFamily = `'${series.font}', sans-serif`;
        }
        
        // Update series description with same custom font
        const descriptionElement = document.getElementById('series-description-text');
        if (descriptionElement) {
            descriptionElement.textContent = series.description;
            descriptionElement.style.fontFamily = `'${series.font}', sans-serif`;
        }
        
        // Load the Google Font dynamically
        this.loadGoogleFont(series.font);
    }

    loadGoogleFont(fontName) {
        // Check if font is already loaded
        const existingLink = document.querySelector(`link[href*="${fontName}"]`);
        if (existingLink) return;

        // Create and append font link
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    async loadImages() {
        const series = GALLERY_SERIES[this.currentSeries];
        if (!series) return;

        // Update loading text
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Discovering Images...';
        }

        this.images = [];
        const assetsPath = 'assets/';
        
        // Try to load images from A1, A2, A3... up to expected count
        for (let i = 1; i <= series.expectedImages + 5; i++) { // +5 buffer for extra images
            const imagePath = `${assetsPath}${this.currentSeries}${i}.png`;
            
            // Update loading progress for mobile
            if (this.isMobile && loadingText) {
                loadingText.textContent = `Finding Image ${i}...`;
            }
            
            try {
                const exists = await this.imageExists(imagePath);
                if (exists) {
                    this.images.push({
                        src: imagePath,
                        title: series.title,
                        description: `${series.title}`,
                        index: i
                    });
                }
            } catch (error) {
                // Image doesn't exist, stop trying
                break;
            }
        }

        // Update loading text
        if (loadingText) {
            loadingText.textContent = 'Loading Gallery...';
        }

        // Update total slides for slideshow
        document.getElementById('total-slides').textContent = this.images.length;

        // Populate gallery grid with loading states
        this.populateGalleryGrid();
        this.populateSlideshow();

        // Hide page loading after images are discovered
        setTimeout(() => {
            this.hidePageLoadingOverlay();
        }, 800);

        console.log(`✅ Loaded ${this.images.length} images for ${series.title}`);
    }

    imageExists(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    populateGalleryGrid() {
        const gridContainer = document.getElementById('gallery-grid');
        gridContainer.innerHTML = '';

        // Track loaded images for skeleton removal
        let imagesLoaded = 0;
        const totalImages = this.images.length;

        this.images.forEach((image, index) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'gallery-grid-item loading';
            gridItem.setAttribute('data-index', index);
            
            // Create image element
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.title;
            img.loading = 'lazy';
            
            // Set up loading states
            this.setImageLoading(index, true);
            
            // Handle image load completion
            img.onload = () => {
                gridItem.classList.remove('loading');
                this.setImageLoading(index, false);
                imagesLoaded++;
                
                // Hide skeleton grid when all images are loaded
                if (imagesLoaded === totalImages) {
                    setTimeout(() => {
                        this.hideSkeletonGrid();
                    }, 300);
                }
            };
            
            // Handle image load error
            img.onerror = () => {
                gridItem.classList.remove('loading');
                gridItem.classList.add('error');
                this.setImageLoading(index, false);
                imagesLoaded++;
                
                // Still hide skeleton even with errors
                if (imagesLoaded === totalImages) {
                    setTimeout(() => {
                        this.hideSkeletonGrid();
                    }, 300);
                }
            };
            
            gridItem.innerHTML = `
                <div class="grid-image-container">
                </div>
            `;
            
            // Append image to container
            gridItem.querySelector('.grid-image-container').appendChild(img);

            // Add click event for modal
            gridItem.addEventListener('click', () => this.openModal(index));
            
            gridContainer.appendChild(gridItem);
        });

        // Fallback: hide skeleton after reasonable time even if images haven't loaded
        setTimeout(() => {
            if (this.loadingStates.imagesLoading) {
                this.hideSkeletonGrid();
            }
        }, 8000);
    }

    populateSlideshow() {
        const slideTrack = document.getElementById('slide-track');
        slideTrack.innerHTML = '';

        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide-item';
            slide.innerHTML = `<img src="${image.src}" alt="${image.title}">`;
            slideTrack.appendChild(slide);
        });
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('image-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        // Desktop modal controls
        const modalPrev = document.querySelector('.modal-prev');
        const modalNext = document.querySelector('.modal-next');
        if (modalPrev && modalNext) {
            modalPrev.addEventListener('click', () => this.prevImage());
            modalNext.addEventListener('click', () => this.nextImage());
        }

        // Mobile modal controls
        const mobileCloseBtn = document.querySelector('.mobile-close-btn');
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', () => this.closeModal());
        }

        // Touch zones for mobile navigation
        const touchZones = document.querySelectorAll('.touch-zone');
        touchZones.forEach(zone => {
            zone.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'prev') this.prevImage();
                if (action === 'next') this.nextImage();
            });
        });

        // Setup mobile swipe gestures
        this.setupMobileSwipeGestures();

        // Slideshow controls
        const prevSlide = document.querySelector('.prev-slide');
        const nextSlide = document.querySelector('.next-slide');
        if (prevSlide && nextSlide) {
            prevSlide.addEventListener('click', () => this.prevSlide());
            nextSlide.addEventListener('click', () => this.nextSlide());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('image-modal').classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.prevImage();
                if (e.key === 'ArrowRight') this.nextImage();
                if (e.key === 'Escape') this.closeModal();
            }
        });
    }

    // =========================
    // MOBILE SWIPE GESTURES
    // =========================
    setupMobileSwipeGestures() {
        const modalImageContainer = document.getElementById('modal-image-container');
        if (!modalImageContainer) return;

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let swipeIndicator = document.getElementById('swipe-indicator');
        let swipeThreshold = 100; // Minimum distance for swipe
        let swipeTimeout;

        // Touch start
        modalImageContainer.addEventListener('touchstart', (e) => {
            if (!this.isMobile) return;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentX = startX;
            currentY = startY;
            isDragging = true;

            // Hide swipe indicator on first interaction
            if (swipeIndicator) {
                swipeIndicator.classList.add('hidden');
            }

            e.preventDefault();
        }, { passive: false });

        // Touch move
        modalImageContainer.addEventListener('touchmove', (e) => {
            if (!isDragging || !this.isMobile) return;

            const touch = e.touches[0];
            currentX = touch.clientX;
            currentY = touch.clientY;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Provide visual feedback
                if (deltaX > 30) {
                    modalImageContainer.classList.add('swiping-right');
                    modalImageContainer.classList.remove('swiping-left');
                } else if (deltaX < -30) {
                    modalImageContainer.classList.add('swiping-left');
                    modalImageContainer.classList.remove('swiping-right');
                } else {
                    modalImageContainer.classList.remove('swiping-left', 'swiping-right');
                }

                e.preventDefault(); // Prevent page scroll
            }
        }, { passive: false });

        // Touch end
        modalImageContainer.addEventListener('touchend', (e) => {
            if (!isDragging || !this.isMobile) return;

            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            // Reset visual feedback
            modalImageContainer.classList.remove('swiping-left', 'swiping-right');
            modalImageContainer.classList.add('swipe-complete');

            // Clear feedback after animation
            setTimeout(() => {
                modalImageContainer.classList.remove('swipe-complete');
            }, 500);

            // Check for horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
                if (deltaX > 0) {
                    // Swipe right - previous image
                    this.prevImage();
                } else {
                    // Swipe left - next image  
                    this.nextImage();
                }
            }

            isDragging = false;
            e.preventDefault();
        }, { passive: false });

        // Handle swipe up to close modal (bonus gesture)
        modalImageContainer.addEventListener('touchend', (e) => {
            if (!this.isMobile) return;
            
            const deltaY = currentY - startY;
            
            // Swipe up to close
            if (deltaY < -swipeThreshold && Math.abs(deltaY) > Math.abs(currentX - startX)) {
                this.closeModal();
            }
        }, { passive: false });
    }

    switchViewMode(mode) {
        const gridView = document.getElementById('gallery-grid');
        const slideshowView = document.getElementById('gallery-slideshow');
        const buttons = document.querySelectorAll('.view-mode-btn');

        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        if (mode === 'grid') {
            gridView.style.display = 'grid';
            slideshowView.classList.add('hidden');
        } else {
            gridView.style.display = 'none';
            slideshowView.classList.remove('hidden');
        }
    }

    openModal(index) {
        this.currentImageIndex = index;
        const image = this.images[index];
        
        document.getElementById('modal-image').src = image.src;
        
        // Update mobile counter
        this.updateModalCounter();
        
        // Show modal and prevent body scroll
        document.getElementById('image-modal').classList.add('active');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Show swipe indicator on mobile after a delay
        if (this.isMobile) {
            const swipeIndicator = document.getElementById('swipe-indicator');
            if (swipeIndicator) {
                setTimeout(() => {
                    swipeIndicator.classList.remove('hidden');
                }, 800);
                
                // Auto-hide swipe indicator after 3 seconds (faster since it's more subtle)
                setTimeout(() => {
                    swipeIndicator.classList.add('hidden');
                }, 3800);
            }
        }
    }

    closeModal() {
        document.getElementById('image-modal').classList.remove('active');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        // Hide swipe indicator
        const swipeIndicator = document.getElementById('swipe-indicator');
        if (swipeIndicator) {
            swipeIndicator.classList.add('hidden');
        }
    }

    updateModalCounter() {
        const counter = document.getElementById('modal-counter');
        if (counter) {
            counter.textContent = `${this.currentImageIndex + 1} / ${this.images.length}`;
        }
    }

    // Navigation methods (enhanced with swipe animations in gallery-animations.js)
    prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        this.updateModalImage('prev');
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
        this.updateModalImage('next');
    }

    updateModalImage(direction = 'next') {
        const image = this.images[this.currentImageIndex];
        document.getElementById('modal-image').src = image.src;
        
        // Update mobile counter
        this.updateModalCounter();
    }

    prevSlide() {
        // Slideshow navigation logic
        const track = document.getElementById('slide-track');
        // Implementation for slideshow navigation
    }

    nextSlide() {
        // Slideshow navigation logic
        const track = document.getElementById('slide-track');
        // Implementation for slideshow navigation
    }
}

// Initialize gallery loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.galleryLoader = new GalleryLoader();
}); 