import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('minimal-3d-canvas');

if (canvas) {
	const section = canvas.parentElement;
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
	const renderer = new THREE.WebGLRenderer({
		canvas,
		alpha: true,
		antialias: true,
	});

	const geometry = new THREE.IcosahedronGeometry(1.35, 2);
	const material = new THREE.MeshBasicMaterial({
		color: 0x111111,
		wireframe: true,
		transparent: true,
		opacity: 0.95,
	});
	const mesh = new THREE.Mesh(geometry, material);

	const accentGeometry = new THREE.TorusGeometry(1.95, 0.006, 8, 128);
	const accentMaterial = new THREE.MeshBasicMaterial({
		color: 0x111111,
		transparent: true,
		opacity: 0.45,
	});
	const ring = new THREE.Mesh(accentGeometry, accentMaterial);
	ring.rotation.x = Math.PI / 2;

	const group = new THREE.Group();
	group.add(mesh, ring);
	scene.add(group);

	camera.position.z = 6;

	const pointer = new THREE.Vector2(0, 0);
	const targetRotation = new THREE.Vector2(0.25, -0.2);
	const dragRotation = new THREE.Vector2(0, 0);
	let isDragging = false;
	let previousPointer = { x: 0, y: 0 };

	const getThemeColor = () => {
		return document.documentElement.classList.contains('night-mode')
			? 0xf3f4f6
			: 0x111111;
	};

	const syncTheme = () => {
		const color = getThemeColor();
		material.color.setHex(color);
		accentMaterial.color.setHex(color);
	};

	const resize = () => {
		const width = section.clientWidth;
		const height = section.clientHeight;
		const pixelRatio = Math.min(window.devicePixelRatio, 2);

		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};

	const setPointerFromEvent = (event) => {
		const rect = canvas.getBoundingClientRect();
		pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
	};

	canvas.addEventListener('pointermove', (event) => {
		setPointerFromEvent(event);

		if (!isDragging) return;

		dragRotation.y += (event.clientX - previousPointer.x) * 0.008;
		dragRotation.x += (event.clientY - previousPointer.y) * 0.008;
		previousPointer = { x: event.clientX, y: event.clientY };
	});

	canvas.addEventListener('pointerdown', (event) => {
		isDragging = true;
		previousPointer = { x: event.clientX, y: event.clientY };
		canvas.setPointerCapture(event.pointerId);
	});

	canvas.addEventListener('pointerup', (event) => {
		isDragging = false;
		canvas.releasePointerCapture(event.pointerId);
	});

	canvas.addEventListener('pointerleave', () => {
		isDragging = false;
	});

	const themeObserver = new MutationObserver(syncTheme);
	themeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['class'],
	});

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(section);

	const animate = () => {
		targetRotation.x = pointer.y * 0.45 + dragRotation.x;
		targetRotation.y = pointer.x * 0.65 + dragRotation.y;

		group.rotation.x += (targetRotation.x - group.rotation.x) * 0.05;
		group.rotation.y += (targetRotation.y - group.rotation.y) * 0.05;
		group.rotation.z += 0.003;
		ring.rotation.z -= 0.002;

		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	};

	syncTheme();
	resize();
	animate();
}
