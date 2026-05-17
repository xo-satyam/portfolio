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

// Mobile Nav
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}
