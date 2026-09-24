/**
 * R. MAHALAKSHMY - 3D WebGL Scene Engine
 * Built with Three.js (r128)
 * Features:
 * - Dynamic Cybernetic Hologram Core (Wireframe Icosahedron + Specular Core + Orbital Rings)
 * - 1,200+ Particle Constellation responding to mouse gravity
 * - Smooth scroll-linked camera interpolation across all page sections
 * - Performance-optimized render loop with DPR capping and tab visibility throttling
 */

(function () {
  'use strict';

  // Check WebGL availability
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    console.warn('Three.js or WebGL canvas not available');
    return;
  }

  // --- Scene, Camera, Renderer ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06080e, 0.045);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x00f2fe, 3, 50);
  cyanLight.position.set(6, 6, 8);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0x8b5cf6, 3.5, 50);
  purpleLight.position.set(-6, -5, 6);
  scene.add(purpleLight);

  const emeraldLight = new THREE.PointLight(0x10b981, 2, 40);
  emeraldLight.position.set(0, -8, -2);
  scene.add(emeraldLight);

  // --- Master 3D Group ---
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // --- Central Cyber Core ---
  const coreGroup = new THREE.Group();
  masterGroup.add(coreGroup);

  // 1. Outer Wireframe Polyhedron
  const outerGeo = new THREE.IcosahedronGeometry(2.2, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    emissive: 0x005577,
    emissiveIntensity: 0.5
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  coreGroup.add(outerMesh);

  // 2. Inner Energy Sphere
  const innerGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.25,
    metalness: 0.85,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.8
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerSphere);

  // 3. Inner Lattice Nodes
  const latticeGeo = new THREE.DodecahedronGeometry(1.6, 0);
  const latticeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
  coreGroup.add(latticeMesh);

  // 4. Concentric Orbital Rings
  const ring1Geo = new THREE.TorusGeometry(3.2, 0.035, 16, 120);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.6,
    roughness: 0.3
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI * 0.35;
  coreGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(3.7, 0.025, 16, 120);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0xa855f7,
    emissiveIntensity: 0.5,
    roughness: 0.3
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI * 0.45;
  ring2.rotation.x = Math.PI * 0.15;
  coreGroup.add(ring2);

  const ring3Geo = new THREE.TorusGeometry(4.3, 0.02, 16, 120);
  const ring3Mat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.4,
    roughness: 0.3
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.z = Math.PI * 0.3;
  coreGroup.add(ring3);

  // Small Orbital Satellites
  const satGeo = new THREE.OctahedronGeometry(0.12, 0);
  const satMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const satelliteCount = 6;
  const satellites = [];

  for (let i = 0; i < satelliteCount; i++) {
    const sat = new THREE.Mesh(satGeo, satMat);
    const angle = (i / satelliteCount) * Math.PI * 2;
    sat.userData = {
      angle: angle,
      radius: 3.2 + (i % 3) * 0.5,
      speed: 0.015 + (i % 2) * 0.008,
      axis: i % 2 === 0 ? 'ring1' : 'ring2'
    };
    coreGroup.add(sat);
    satellites.push(sat);
  }

  // --- Procedural Glowing Particle Texture ---
  function createParticleTexture() {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const ctx = pCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(0, 242, 254, 0.8)');
    grad.addColorStop(0.6, 'rgba(139, 92, 246, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(pCanvas);
  }

  // --- Quantum Particle Constellation ---
  const particleCount = 1400;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x00f2fe), // Cyan
    new THREE.Color(0x8b5cf6), // Violet
    new THREE.Color(0x10b981), // Emerald
    new THREE.Color(0xffffff)  // White
  ];

  for (let i = 0; i < particleCount; i++) {
    // Spread in a cylindrical / spherical field
    const radius = 5 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);

    const pickedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    particleColors[i * 3] = pickedColor.r;
    particleColors[i * 3 + 1] = pickedColor.g;
    particleColors[i * 3 + 2] = pickedColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  masterGroup.add(particleSystem);

  // --- Interactive Mouse & Scroll State ---
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  let targetScrollY = 0;
  let currentScrollY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // --- Visibility Throttle (Save CPU/GPU when unfocused) ---
  let isTabActive = true;
  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  // --- Section Camera Choreography ---
  // Calculates smooth coordinates for the 3D core and camera based on scroll depth
  function updateScrollTransforms() {
    const maxScroll = Math.max(
      document.body.scrollHeight - window.innerHeight,
      1
    );
    const scrollFraction = Math.min(Math.max(currentScrollY / maxScroll, 0), 1);

    // Dynamic camera and core positions across 5 main sections
    // 0.0: Hero (Centered, slightly right)
    // 0.2: About (Shifts right as text is on left/right)
    // 0.4: Experience (Shifts left)
    // 0.6: Projects (Elevated, tilted)
    // 0.8: Skills (Centrally focused, rings open)
    // 1.0: Contact (Smooth descent)

    // Lerp camera coordinates
    const targetCamX = Math.sin(scrollFraction * Math.PI * 2) * 1.5;
    const targetCamY = -scrollFraction * 4 + currentMouseY * 0.4;
    const targetCamZ = 8 + Math.cos(scrollFraction * Math.PI) * 1.8;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;

    // Shift core group positioning
    const targetCoreX = 2.2 * Math.cos(scrollFraction * Math.PI * 2.5);
    const targetCoreY = -scrollFraction * 5;
    coreGroup.position.x += (targetCoreX - coreGroup.position.x) * 0.05;
    coreGroup.position.y += (targetCoreY - coreGroup.position.y) * 0.05;

    // Look slightly towards the core
    camera.lookAt(coreGroup.position.x * 0.5, coreGroup.position.y, 0);
  }

  // --- Animation Loop ---
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isTabActive) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth inertia for mouse & scroll
    currentMouseX += (targetMouseX - currentMouseX) * 0.06;
    currentMouseY += (targetMouseY - currentMouseY) * 0.06;
    currentScrollY += (targetScrollY - currentScrollY) * 0.08;

    // Apply scroll-driven camera choreography
    updateScrollTransforms();

    // Constant rotations with mouse reactivity
    outerMesh.rotation.x = elapsedTime * 0.25 + currentMouseY * 0.5;
    outerMesh.rotation.y = elapsedTime * 0.35 + currentMouseX * 0.5;

    innerSphere.rotation.y = -elapsedTime * 0.5;
    latticeMesh.rotation.x = -elapsedTime * 0.2;
    latticeMesh.rotation.z = elapsedTime * 0.15;

    ring1.rotation.z = elapsedTime * 0.4;
    ring2.rotation.x = elapsedTime * 0.35;
    ring3.rotation.y = elapsedTime * 0.25;

    // Orbiting satellites
    satellites.forEach((sat) => {
      sat.userData.angle += sat.userData.speed;
      const a = sat.userData.angle;
      const r = sat.userData.radius;
      if (sat.userData.axis === 'ring1') {
        sat.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.5, Math.sin(a) * r * 0.8);
      } else {
        sat.position.set(Math.sin(a) * r * 0.7, Math.cos(a) * r, Math.cos(a) * r * 0.7);
      }
      sat.rotation.x += 0.02;
      sat.rotation.y += 0.03;
    });

    // Gentle floating particle constellation
    particleSystem.rotation.y = elapsedTime * 0.02 + currentMouseX * 0.15;
    particleSystem.rotation.x = currentMouseY * 0.1;

    // Gentle breathing scale on the core
    const breathe = 1 + Math.sin(elapsedTime * 2) * 0.04;
    coreGroup.scale.set(breathe, breathe, breathe);

    // Subtle light pulsation
    cyanLight.intensity = 2.5 + Math.sin(elapsedTime * 3) * 0.8;
    purpleLight.intensity = 3 + Math.cos(elapsedTime * 2.5) * 0.7;

    renderer.render(scene, camera);
  }

  animate();

  // Expose global controller for app.js interaction if needed
  window.Portfolio3D = {
    setAuraColor: function (hexColor) {
      if (cyanLight) cyanLight.color.setHex(hexColor);
    },
    resetCorePosition: function () {
      if (coreGroup) {
        coreGroup.position.set(0, 0, 0);
      }
    }
  };
})();
