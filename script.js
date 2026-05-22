import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * CINEMATIC LOADING SCREEN
 * Orchestrates a premium, film-like loading sequence
 */
class CinematicLoader {
    constructor() {
        // DOM elements
        this.wrapper = document.getElementById('loader-wrapper');
        this.logo = document.getElementById('loader-logo');
        this.logoSection = this.logo?.closest('.loader-logo-section');
        this.descLines = document.querySelectorAll('.desc-line');
        this.journeyText = document.getElementById('loading-journey-text');
        this.progressTrack = document.getElementById('loader-progress-track');
        this.progressBar = document.getElementById('loading-progress');
        this.fadeToBlack = document.getElementById('loader-fade-to-black');

        this.progress = 0;
        this.isComplete = false;

        // Start the cinematic sequence
        this.startSequence();
    }

    /**
     * Master animation timeline
     * All timings are designed for cinematic pacing
     */
    startSequence() {
        // Phase 1: Background is already visible (video autoplay)
        // Wait a beat for the atmosphere to set in
        
        // Phase 2: Logo fades in with upward motion + blur-to-focus (1.0s)
        setTimeout(() => {
            if (this.logoSection) this.logoSection.classList.add('visible');
        }, 1000);

        // Phase 3: Description lines appear one by one (starting 2.2s)
        this.descLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('visible');
            }, 2200 + (index * 350));
        });

        // Phase 4: Progress bar appears and begins filling (starting 4.0s)
        setTimeout(() => {
            if (this.progressTrack) this.progressTrack.classList.add('visible');
            this.startProgress();
        }, 4000);
    }

    /**
     * Smooth, cinematic progress animation
     * Uses variable speed for more organic feel
     */
    startProgress() {
        const totalDuration = 4500; // 4.5s total fill time
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            // Use an ease-in-out curve for cinematic feel
            let t = Math.min(elapsed / totalDuration, 1);
            // Cubic ease-in-out
            t = t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
            
            this.progress = t * 100;

            if (this.progressBar) {
                this.progressBar.style.width = this.progress + '%';
            }

            if (this.progress < 100) {
                requestAnimationFrame(animate);
            } else {
                this.onComplete();
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Exit sequence: fade to black → remove loader → reveal portfolio
     */
    onComplete() {
        if (this.isComplete) return;
        this.isComplete = true;

        // Brief pause at 100%
        setTimeout(() => {
            // Fade to black
            if (this.fadeToBlack) this.fadeToBlack.classList.add('active');

            // After black screen, start removing loader
            setTimeout(() => {
                document.body.classList.remove('loading');
                
                // Fade the entire wrapper out
                if (this.wrapper) {
                    this.wrapper.classList.add('exiting');
                }

                // Clean up and init hero
                setTimeout(() => {
                    if (this.wrapper) {
                        this.wrapper.style.display = 'none';
                    }
                    initHero();
                }, 900);
            }, 700);
        }, 600);
    }
}

// Initialize the cinematic loader
new CinematicLoader();

function initHeroVideo() {
    const heroVideo = document.getElementById('hero-video');
    if (!heroVideo) return;

    const playbackRate = 1.0;
    const applyPlaybackRate = () => {
        heroVideo.defaultPlaybackRate = playbackRate;
        heroVideo.playbackRate = playbackRate;
        const playPromise = heroVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    };

    heroVideo.addEventListener('loadedmetadata', applyPlaybackRate, { once: true });
    heroVideo.addEventListener('canplay', applyPlaybackRate, { once: true });
    applyPlaybackRate();
}

document.addEventListener('DOMContentLoaded', initHeroVideo);

/**
 * HERO SECTION 3D INTERACTION
 */
let heroScene, heroCamera, heroRenderer, heroModel, heroHead, heroMixer, heroClock;
let targetRotation = { x: 0, y: 0 };

function initHero() {
    const heroContainer = document.getElementById('canvas-container');
    if (!heroContainer) return;

    heroClock = new THREE.Clock();
    heroScene = new THREE.Scene();

    heroCamera = new THREE.PerspectiveCamera(35, heroContainer.clientWidth / heroContainer.clientHeight, 0.1, 10000);
    heroCamera.position.set(0, 0, 10);

    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);
    heroRenderer.setPixelRatio(window.devicePixelRatio);
    heroContainer.appendChild(heroRenderer.domElement);

    heroScene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 10, 10);
    heroScene.add(dl);

    const loader = new GLTFLoader();
    loader.load('model.glb', (gltf) => {
        heroModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(heroModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const scale = 12 / size.y;
        heroModel.scale.set(scale, scale, scale);

        heroModel.position.x = -center.x * scale;
        heroModel.position.y = -box.max.y * scale + 2.0;
        heroModel.position.z = -center.z * scale;

        heroScene.add(heroModel);

        heroModel.traverse((child) => {
            if (child.isBone && child.name.toLowerCase().includes('head')) {
                heroHead = child;
            }
        });

        heroMixer = new THREE.AnimationMixer(heroModel);
        const animations = gltf.animations;
        if (animations && animations.length > 0) {
            const idleClip = animations.find(a => a.name.toLowerCase().includes('idle')) || animations[0];
            const action = heroMixer.clipAction(idleClip);
            action.play();
        }
    });

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotation.y = x * 0.5;
        targetRotation.x = -y * 0.3;
    });

    animateHero();
}

function animateHero() {
    requestAnimationFrame(animateHero);
    const delta = heroClock.getDelta();
    if (heroMixer) heroMixer.update(delta);

    if (heroHead) {
        heroHead.rotation.y = THREE.MathUtils.lerp(heroHead.rotation.y, targetRotation.y, 0.1);
        heroHead.rotation.x = THREE.MathUtils.lerp(heroHead.rotation.x, targetRotation.x, 0.1);
    }

    if (heroRenderer) {
        heroRenderer.render(heroScene, heroCamera);
    }
}

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => observer.observe(section));

// 3D-like parallax scroll effect
const parallaxItems = Array.from(document.querySelectorAll('[data-parallax]'));

function updateParallax() {
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxItems.forEach((item) => {
        if (item.closest('.hero')) return;
        const depth = Number(item.getAttribute('data-depth')) || 0.1;
        const translateY = -(scrollY * depth);
        item.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
}

updateParallax();
window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateParallax);
});

// Magnetic hover effect on hero video
const heroBackground = document.querySelector('.hero-background');
if (heroBackground) {
    const resetMagnet = () => {
        heroBackground.style.transform = '';
    };

    heroBackground.addEventListener('mousemove', (event) => {
        const rect = heroBackground.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const xPercent = (x / rect.width) - 0.5;
        const yPercent = (y / rect.height) - 0.5;
        const maxOffset = 12;
        const translateX = xPercent * maxOffset;
        const translateY = yPercent * maxOffset;
        heroBackground.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    heroBackground.addEventListener('mouseleave', resetMagnet);
}

// Mobile Nav
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Darken and blur hero background after scrolling
const scrollContainer = document.querySelector('.page-wrapper');
const scrolledThreshold = 30;
const applyScrolledState = () => {
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : (window.scrollY || window.pageYOffset);
    document.body.classList.toggle('scrolled', scrollTop > scrolledThreshold);
};

// Increase hero video blur progressively based on scroll depth
const updateHeroBlurOnScroll = () => {
    const scrollTop = scrollContainer ? scrollContainer.scrollTop : (window.scrollY || window.pageYOffset);
    const heroVideoEl = document.querySelector('.hero-video');
    if (!heroVideoEl) return;

    const startBlur = 0.6;  // px at top
    const maxBlur = 18;     // px at max scroll (increased for stronger effect)
    const maxScroll = 400;  // px where blur reaches max (reach sooner)
    const ratio = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    const blur = startBlur + ratio * (maxBlur - startBlur);
    heroVideoEl.style.filter = `blur(${blur}px)`;
};

applyScrolledState();
updateHeroBlurOnScroll();
if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            applyScrolledState();
            updateHeroBlurOnScroll();
        });
    });
} else {
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            applyScrolledState();
            updateHeroBlurOnScroll();
        });
    });
}

// Prevent top bounce from pulling fixed elements down
const pageWrapper = document.querySelector('.page-wrapper');
if (pageWrapper) {
    pageWrapper.addEventListener('wheel', (event) => {
        if (pageWrapper.scrollTop <= 0 && event.deltaY < 0) {
            event.preventDefault();
        }
    }, { passive: false });

    let touchStartY = 0;
    pageWrapper.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
    }, { passive: true });

    pageWrapper.addEventListener('touchmove', (event) => {
        const currentY = event.touches[0].clientY;
        if (pageWrapper.scrollTop <= 0 && currentY > touchStartY) {
            event.preventDefault();
        }
    }, { passive: false });
}
