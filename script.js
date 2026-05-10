import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, model, head, mixer, clock;
let targetRotation = { x: 0, y: 0 };

const container = document.getElementById('canvas-container');
const loaderWrapper = document.getElementById('loader-wrapper');

function init() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10000);
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 10, 10);
    scene.add(dl);

    const loader = new GLTFLoader();
    console.log('Starting model load...');
    loader.load('model.glb',
        (gltf) => {
            model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const scale = 12 / size.y;
            model.scale.set(scale, scale, scale);

            model.position.x = -center.x * scale;
            model.position.y = -box.max.y * scale + 2.0;
            model.position.z = -center.z * scale;

            scene.add(model);

            model.traverse((child) => {
                if (child.isBone && child.name.toLowerCase().includes('head')) {
                    head = child;
                }
            });

            // Animations
            mixer = new THREE.AnimationMixer(model);
            const animations = gltf.animations;
            if (animations && animations.length > 0) {
                // Look for a wave or hello animation
                let waveAction;
                const waveClip = animations.find(a => a.name.toLowerCase().includes('wave') || a.name.toLowerCase().includes('hello'));
                if (waveClip) {
                    waveAction = mixer.clipAction(waveClip);
                } else {
                    // Fallback to first animation
                    waveAction = mixer.clipAction(animations[0]);
                }

                if (waveAction) {
                    waveAction.setLoop(THREE.LoopOnce);
                    waveAction.clampWhenFinished = true;
                    waveAction.play();
                }
            }

            if (loaderWrapper) {
                setTimeout(() => {
                    loaderWrapper.style.opacity = '0';
                    setTimeout(() => loaderWrapper.style.display = 'none', 1000);
                }, 1500); // Give time for wave animation to start
            }
        },
        (xhr) => {
            if (xhr.total > 0) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }
        },
        (error) => {
            console.error('An error happened during loading:', error);
        }
    );

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotation.y = x * 0.5;
        targetRotation.x = -y * 0.3;
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (head) {
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetRotation.y, 0.1);
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetRotation.x, 0.1);
    }
    renderer.render(scene, camera);
}

init();

// Simple scroll reveal
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
