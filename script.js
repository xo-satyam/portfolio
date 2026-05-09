import * as THREE from 'three';

// Setup Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x6366f1, 2);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

// Create a high-quality "Head" placeholder using a Group
const headGroup = new THREE.Group();
scene.add(headGroup);

// Face
const faceGeometry = new THREE.SphereGeometry(0.6, 32, 32);
const faceMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const face = new THREE.Mesh(faceGeometry, faceMaterial);
headGroup.add(face);

// Eyes
const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.2, 0.1, 0.5);
headGroup.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.2, 0.1, 0.5);
headGroup.add(rightEye);

// Glasses/Details
const glassesGeometry = new THREE.TorusGeometry(0.12, 0.02, 16, 100);
const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const leftGlass = new THREE.Mesh(glassesGeometry, glassesMaterial);
leftGlass.position.set(-0.2, 0.1, 0.5);
headGroup.add(leftGlass);

const rightGlass = new THREE.Mesh(glassesGeometry, glassesMaterial);
rightGlass.position.set(0.2, 0.1, 0.5);
headGroup.add(rightGlass);

// Hide loader
document.getElementById('loader-wrapper').style.opacity = '0';
setTimeout(() => {
    document.getElementById('loader-wrapper').style.display = 'none';
}, 500);

// Mouse Tracking Logic
const mouse = new THREE.Vector2();
const targetRotation = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    targetRotation.x = mouse.y * 0.4;
    targetRotation.y = mouse.x * 0.4;
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetRotation.x, 0.1);
    headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetRotation.y, 0.1);

    renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Mobile Nav Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Contact Form Handler
const contactForm = document.getElementById('portfolioContactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! This is a demo portfolio.');
        contactForm.reset();
    });
}
