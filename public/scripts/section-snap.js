const sections = [...document.querySelectorAll('.snap-section')];
const interactiveSelector = 'a, button, input, textarea, select, [contenteditable="true"]';

if (sections.length > 1) {
	let activeIndex = 0;
	let animationFrame;
	let isSnapping = false;
	let wheelDelta = 0;
	let touchStartY = 0;
	let touchStartX = 0;

	const getSectionTop = (section) => {
		const top = section.getBoundingClientRect().top + window.scrollY;
		const sectionHeight = section.offsetHeight;
		const viewportHeight = window.innerHeight;
		const centeredTop = top - Math.max((viewportHeight - sectionHeight) / 2, 0);
		const maximumScroll = document.documentElement.scrollHeight - window.innerHeight;

		return Math.min(Math.max(centeredTop, 0), maximumScroll);
	};

	const findNearestSectionIndex = () => {
		const viewportMiddle = window.scrollY + window.innerHeight / 2;

		return sections.reduce((nearestIndex, section, index) => {
			const nearest = sections[nearestIndex];
			const sectionMiddle = getSectionTop(section) + section.offsetHeight / 2;
			const nearestMiddle = getSectionTop(nearest) + nearest.offsetHeight / 2;

			return Math.abs(sectionMiddle - viewportMiddle) < Math.abs(nearestMiddle - viewportMiddle)
				? index
				: nearestIndex;
		}, 0);
	};

	// Elegant cubic ease-in-out curve for smooth premium transition
	const easeInOutCubic = (progress) =>
		progress < 0.5
			? 4 * progress * progress * progress
			: 1 - Math.pow(-2 * progress + 2, 3) / 2;

	const stopSnap = () => {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = undefined;
		}
		isSnapping = false;
		wheelDelta = 0;
	};

	const snapToSection = (index) => {
		const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
		const target = sections[nextIndex];

		if (!target) return;

		// Cancel ongoing snap to ensure smoothness without waiting
		stopSnap();

		const startTop = window.scrollY;
		const targetTop = getSectionTop(target);
		const distance = targetTop - startTop;

		activeIndex = nextIndex;
		wheelDelta = 0;

		if (Math.abs(distance) < 2) return;

		// Optimal duration bounds based on true distance
		const duration = Math.min(950, Math.max(500, Math.abs(distance) * 0.5));
		const startTime = performance.now();
		isSnapping = true;

		const animate = (now) => {
			const progress = Math.min((now - startTime) / duration, 1);
			window.scrollTo(0, startTop + distance * easeInOutCubic(progress));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(animate);
				return;
			}

			animationFrame = undefined;
			isSnapping = false;
		};

		animationFrame = requestAnimationFrame(animate);
	};

	const snapByDirection = (direction) => {
		activeIndex = findNearestSectionIndex();
		snapToSection(activeIndex + direction);
	};

	const isInteractiveTarget = (target) =>
		target instanceof Element && Boolean(target.closest(interactiveSelector));

	window.addEventListener(
		'wheel',
		(event) => {
			if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

			if (isSnapping) {
				event.preventDefault();
				return;
			}

			event.preventDefault();
			wheelDelta += event.deltaY;

			if (Math.abs(wheelDelta) >= 40) {
				snapByDirection(wheelDelta > 0 ? 1 : -1);
			}
		},
		{ passive: false }
	);

	window.addEventListener(
		'touchstart',
		(event) => {
			const touch = event.touches[0];
			touchStartY = touch.clientY;
			touchStartX = touch.clientX;
		},
		{ passive: true }
	);

	window.addEventListener(
		'touchend',
		(event) => {
			if (isSnapping) return;

			const touch = event.changedTouches[0];
			const deltaY = touchStartY - touch.clientY;
			const deltaX = touchStartX - touch.clientX;

			if (Math.abs(deltaY) >= 45 && Math.abs(deltaY) > Math.abs(deltaX)) {
				snapByDirection(deltaY > 0 ? 1 : -1);
			}
		},
		{ passive: true }
	);

	window.addEventListener('keydown', (event) => {
		if (isInteractiveTarget(event.target)) return;

		if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
			event.preventDefault();
			snapByDirection(1);
		} else if (['ArrowUp', 'PageUp'].includes(event.key)) {
			event.preventDefault();
			snapByDirection(-1);
		}
	});

	window.addEventListener('resize', () => {
		stopSnap();
		activeIndex = findNearestSectionIndex();
	});

	window.addEventListener('pointerdown', () => {
		if (isSnapping) stopSnap();
	});
}