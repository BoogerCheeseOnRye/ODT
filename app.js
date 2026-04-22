// ODT - 3D Preview Initialization
// Initializes Three.js scene for the dashboard preview

function init3D() {
    const canvas = document.getElementById('preview3d');
    if (!canvas) {
        console.log('[3D] Canvas not found, skipping init');
        return;
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    // Camera
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x58a6ff, 0.5);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x30363d, 0x21262d);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Demo cube
    const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x58a6ff,
        metalness: 0.3,
        roughness: 0.4
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = -0.75;
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Axes helper (small)
    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.position.set(-4, -2, -4);
    scene.add(axesHelper);

    // Initialize preview renderer if available
    if (typeof initPreviewRenderer === 'function') {
        initPreviewRenderer(scene, camera, renderer);
    }

    // Animation loop
    let lastTime = 0;
    let frameCount = 0;
    let fps = 60;

    function animate(time) {
        requestAnimationFrame(animate);

        // FPS calculation
        frameCount++;
        if (time - lastTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = time;

            // Update FPS display if exists
            const fpsDisplay = document.getElementById('preview-fps');
            if (fpsDisplay) fpsDisplay.textContent = fps + ' FPS';
        }

        // Rotate cube
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.01;

        // Gentle camera movement
        const t = time * 0.0005;
        camera.position.x = Math.sin(t) * 0.5;
        camera.position.z = 5 + Math.cos(t) * 0.5;
        camera.lookAt(cube.position);

        renderer.render(scene, camera);
    }

    animate(0);
    console.log('[3D] Scene initialized');

    // Handle resize
    window.addEventListener('resize', () => {
        if (!canvas || !camera || !renderer) return;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// Toggle fullscreen for the preview canvas
function toggleFullscreen() {
    const canvas = document.getElementById('preview3d');
    if (!canvas) return;

    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            console.log('[3D] Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Check if input is focused (for hotkeys)
function isInputFocused() {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || active.isContentEditable;
}

// Mobile/tablet detection
function checkMobile() {
    isMobile = window.innerWidth <= 1024;
    return isMobile;
}

// Switch panel for mobile
function switchPanel(panel) {
    currentPanel = panel;

    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    const centerPanel = document.querySelector('.center-panel');
    const tabs = document.querySelectorAll('.panel-tab');

    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase().includes(panel));
    });

    if (leftPanel) {
        leftPanel.classList.toggle('hidden', panel !== 'chat');
    }
    if (rightPanel) {
        rightPanel.classList.toggle('hidden', panel !== 'files');
    }
}