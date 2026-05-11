import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * PIRATE LOADING SCREEN LOGIC
 */
class PirateLoader {
    constructor() {
        this.progressFill = document.getElementById('loading-progress');
        this.loaderWrapper = document.getElementById('loader-wrapper');
        this.isLoaded = false;
        this.simulateProgress();
    }

    simulateProgress() {
        let progress = 0;
        const duration = 5000; // 5 seconds for a cinematic feel
        const intervalTime = 20; // 50fps for smooth movement
        const increment = 100 / (duration / intervalTime);

        const interval = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.onLoadComplete();
            }
            this.updateProgress(progress);
        }, intervalTime);
    }

    updateProgress(percent) {
        if (this.progressFill) {
            this.progressFill.style.width = percent + '%';
        }
    }

    onLoadComplete() {
        this.isLoaded = true;
        setTimeout(() => {
            if (this.loaderWrapper) {
                this.loaderWrapper.style.opacity = '0';
                document.body.classList.remove('loading');
                setTimeout(() => {
                    this.loaderWrapper.style.display = 'none';
                    // Trigger hero scene initialization
                    initHero();
                }, 800);
            }
        }, 1000);
    }
}

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

// Start Loader
new PirateLoader();

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
