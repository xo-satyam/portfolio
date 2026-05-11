import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';

/**
 * PIRATE LOADING SCREEN LOGIC
 */
class PirateLoader {
    constructor() {
        this.container = document.getElementById('loading-canvas-container');
        this.progressFill = document.getElementById('loading-progress');
        this.percentageText = document.getElementById('loading-percentage');
        this.loaderWrapper = document.getElementById('loader-wrapper');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
        this.camera.position.set(30, 30, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        this.sun = new THREE.Vector3();
        this.clock = new THREE.Clock();

        this.water = null;
        this.sky = null;
        this.ship = null;
        this.clouds = [];
        this.birds = [];
        this.islands = [];
        this.particles = null;
        this.particleCount = 500;
        this.isLoaded = false;
        this.animationId = null;

        this.init();
    }

    init() {
        // Water
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x006994,
                distortionScale: 5.5,
                fog: this.scene.fog !== undefined
            }
        );
        this.water.rotation.x = -Math.PI / 2;
        this.scene.add(this.water);

        // Skybox
        this.sky = new Sky();
        this.sky.scale.setScalar(10000);
        this.scene.add(this.sky);

        const skyUniforms = this.sky.material.uniforms;
        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const parameters = {
            elevation: 25,
            azimuth: 180
        };

        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        let renderTarget;

        const updateSun = () => {
            const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
            const theta = THREE.MathUtils.degToRad(parameters.azimuth);

            this.sun.setFromSphericalCoords(1, phi, theta);

            this.sky.material.uniforms['sunPosition'].value.copy(this.sun);
            this.water.material.uniforms['sunDirection'].value.copy(this.sun).normalize();

            if (renderTarget !== undefined) renderTarget.dispose();

            renderTarget = pmremGenerator.fromScene(this.sky);

            this.scene.environment = renderTarget.texture;
        };

        updateSun();

        // Clouds
        this.createClouds();

        // Birds
        this.createBirds();

        // Islands
        this.createIslands();

        // Splashes
        this.createSplashes();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.set(-1, 1, 1);
        this.scene.add(directionalLight);

        // Procedural Ship
        this.createProceduralShip();

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
        this.simulateProgress();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateFlowStep(step, status) {
        const cards = document.querySelectorAll('.flow-card');
        cards.forEach(card => {
            if (parseInt(card.dataset.step) === step) {
                card.classList.add('active');
                card.querySelector('.step-status').innerText = status;
            } else if (parseInt(card.dataset.step) < step) {
                card.querySelector('.step-status').innerText = 'Complete';
            }
        });
    }

    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 2; // Slower, more cinematic progress
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.onLoadComplete();
            }
            this.updateProgress(progress);

            if (progress > 10) this.updateFlowStep(1, 'Complete');
            if (progress > 30) this.updateFlowStep(2, 'Complete');
            if (progress > 50) this.updateFlowStep(3, 'Complete');
            if (progress > 70) this.updateFlowStep(4, 'Complete');
            if (progress >= 100) this.updateFlowStep(5, 'Active');
        }, 150);
    }

    updateProgress(percent) {
        this.progressFill.style.width = percent + '%';
        this.percentageText.innerText = Math.floor(percent);
    }

    onLoadComplete() {
        this.isLoaded = true;
        this.updateFlowStep(5, 'Active');
        setTimeout(() => {
            this.loaderWrapper.style.opacity = '0';
            document.body.classList.remove('loading');
            setTimeout(() => {
                this.loaderWrapper.style.display = 'none';
                // Stop the loading animation loop to save resources
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
                // Trigger hero scene initialization
                initHero();
            }, 800);
        }, 1000);
    }

    createClouds() {
        const cloudGeometry = new THREE.PlaneGeometry(500, 250);
        const cloudTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lensflare/lensflare0.png'); // Using a soft glow texture for clouds

        for (let i = 0; i < 20; i++) {
            const cloudMaterial = new THREE.MeshBasicMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.3,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

            cloud.position.set(
                (Math.random() - 0.5) * 5000,
                300 + Math.random() * 200,
                (Math.random() - 0.5) * 5000
            );
            cloud.rotation.x = Math.PI / 2;
            cloud.scale.setScalar(1 + Math.random() * 2);

            this.scene.add(cloud);
            this.clouds.push({
                mesh: cloud,
                speed: 0.1 + Math.random() * 0.2
            });
        }
    }

    createIslands() {
        const geometries = [
            new THREE.ConeGeometry(40, 60, 6),
            new THREE.ConeGeometry(60, 40, 5),
            new THREE.ConeGeometry(30, 80, 4)
        ];

        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x4d3319, flatShading: true }), // Brown Rock
            new THREE.MeshStandardMaterial({ color: 0x2c3e50, flatShading: true }), // Slate
            new THREE.MeshStandardMaterial({ color: 0x2d4c1e, flatShading: true })  // Mossy Green
        ];

        for (let i = 0; i < 30; i++) {
            const geom = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = materials[Math.floor(Math.random() * materials.length)];
            const island = new THREE.Mesh(geom, mat);

            // Bring some islands closer for better depth
            const dist = 400 + Math.random() * 2000;
            const angle = Math.random() * Math.PI * 2;

            island.position.set(
                Math.cos(angle) * dist,
                -15, // Partially submerged
                Math.sin(angle) * dist
            );

            island.rotation.y = Math.random() * Math.PI;
            island.scale.set(1 + Math.random() * 2, 0.5 + Math.random() * 1.5, 1 + Math.random() * 2);

            this.scene.add(island);
            this.islands.push(island);
        }
    }

    createProceduralShip() {
        this.ship = new THREE.Group();

        // Hull - Stylized Box with curved front (simple representation)
        const hullGeom = new THREE.BoxGeometry(10, 8, 25);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, flatShading: true });
        const hull = new THREE.Mesh(hullGeom, hullMat);
        hull.position.y = 2;
        this.ship.add(hull);

        // Deck
        const deckGeom = new THREE.BoxGeometry(11, 2, 26);
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const deck = new THREE.Mesh(deckGeom, deckMat);
        deck.position.y = 6;
        this.ship.add(deck);

        // Masts
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x2a1d15 });
        const mastGeom = new THREE.CylinderGeometry(0.5, 0.8, 20);

        const mastPositions = [5, -5]; // Front and back masts
        mastPositions.forEach(z => {
            const mast = new THREE.Mesh(mastGeom, mastMat);
            mast.position.set(0, 15, z);
            this.ship.add(mast);

            // Sails
            const sailGeom = new THREE.PlaneGeometry(12, 10, 10, 10);
            const sailMat = new THREE.MeshStandardMaterial({
                color: 0xf5f5dc,
                side: THREE.DoubleSide,
                flatShading: true
            });
            const sail = new THREE.Mesh(sailGeom, sailMat);
            sail.position.set(0, 18, z + 0.1);

            // Curve the sail
            const pos = sailGeom.attributes.position;
            for(let i=0; i<pos.count; i++) {
                const zVal = pos.getZ(i);
                const xVal = pos.getX(i);
                pos.setZ(i, zVal + Math.sin(xVal * 0.5) * 2);
            }
            pos.needsUpdate = true;

            this.ship.add(sail);
            this.clouds.push({ mesh: sail, isSail: true }); // Use clouds array for animation logic or custom
        });

        this.ship.position.y = -2;
        this.scene.add(this.ship);
        this.camera.lookAt(this.ship.position);

        this.updateFlowStep(2, 'Complete');
        this.updateFlowStep(3, 'Active');
    }

    createSplashes() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        const lifespans = new Float32Array(this.particleCount);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            lifespans[i] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.userData.velocities = velocities;
        this.particles.userData.lifespans = lifespans;
        this.scene.add(this.particles);
    }

    updateSplashes(time) {
        if (!this.particles || !this.ship) return;

        const positions = this.particles.geometry.attributes.position.array;
        const vels = this.particles.userData.velocities;
        const lives = this.particles.userData.lifespans;

        for (let i = 0; i < this.particleCount; i++) {
            if (lives[i] <= 0) {
                // Reset particle at ship bow
                lives[i] = 1.0 + Math.random();
                positions[i * 3] = this.ship.position.x + (Math.random() - 0.5) * 4;
                positions[i * 3 + 1] = this.ship.position.y - 1;
                positions[i * 3 + 2] = this.ship.position.z + 5; // Near bow

                vels[i * 3] = (Math.random() - 0.5) * 0.2;
                vels[i * 3 + 1] = Math.random() * 0.1;
                vels[i * 3 + 2] = Math.random() * 0.1;
            } else {
                positions[i * 3] += vels[i * 3];
                positions[i * 3 + 1] += vels[i * 3 + 1];
                positions[i * 3 + 2] += vels[i * 3 + 2];

                vels[i * 3 + 1] -= 0.005; // Gravity
                lives[i] -= 0.02;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    createBirds() {
        const birdGroup = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const bird = new THREE.Group();

            // Simple V-shape bird
            const wingGeom = new THREE.PlaneGeometry(2, 0.5);
            const wingMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });

            const leftWing = new THREE.Mesh(wingGeom, wingMat);
            leftWing.position.x = -1;
            bird.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeom, wingMat);
            rightWing.position.x = 1;
            bird.add(rightWing);

            bird.position.set(
                (Math.random() - 0.5) * 100,
                50 + Math.random() * 20,
                (Math.random() - 0.5) * 100
            );

            this.scene.add(bird);
            this.birds.push({
                mesh: bird,
                leftWing,
                rightWing,
                angle: Math.random() * Math.PI * 2,
                radius: 50 + Math.random() * 50,
                speed: 0.01 + Math.random() * 0.01
            });
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();

        if (this.water) {
            this.water.material.uniforms['time'].value += 1.0 / 60.0;
        }

        // Animate Clouds & Sails
        this.clouds.forEach(item => {
            if (item.isSail) {
                // Sail wind reaction
                item.mesh.rotation.y = Math.sin(time * 0.5) * 0.05;
                item.mesh.position.x = Math.sin(time * 0.8) * 0.1;
            } else {
                item.mesh.position.x += item.speed;
                if (item.mesh.position.x > 2500) item.mesh.position.x = -2500;
            }
        });

        // Animate Birds
        this.birds.forEach(bird => {
            bird.angle += bird.speed;
            bird.mesh.position.x = Math.cos(bird.angle) * bird.radius;
            bird.mesh.position.z = Math.sin(bird.angle) * bird.radius;

            // Flapping
            bird.leftWing.rotation.z = Math.sin(time * 10) * 0.5;
            bird.rightWing.rotation.z = -Math.sin(time * 10) * 0.5;

            bird.mesh.lookAt(
                Math.cos(bird.angle + 0.1) * bird.radius,
                bird.mesh.position.y,
                Math.sin(bird.angle + 0.1) * bird.radius
            );
        });

        if (this.ship) {
            this.updateSplashes(time);
            // Rocking motion
            this.ship.rotation.z = Math.sin(time) * 0.05;
            this.ship.rotation.x = Math.cos(time * 0.5) * 0.03;
            this.ship.position.y = -1 + Math.sin(time * 0.7) * 0.2;

            // Move forward based on progress or time
            const speed = this.isLoaded ? 0.2 : 0.05;
            this.ship.position.z -= speed;

            // Subtle camera following ship
            this.camera.position.z = this.ship.position.z + 100;
            this.camera.lookAt(this.ship.position);
        }

        this.renderer.render(this.scene, this.camera);
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
    // Using the same model.glb as it seems to be the main asset available
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
