const sections = [...document.querySelectorAll('.snap-section')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (sections.length > 1) {

let activeIndex = 0;
let isSnapping = false;
let wheelDelta = 0;
let touchStartY = 0;
let touchStartX = 0;

const getSectionTop = (section) => {
	const top = section.getBoundingClientRect().top + window.scrollY;
	const sectionHeight = section.offsetHeight;
	const viewportHeight = window.innerHeight;
	const centeredTop = top - Math.max((viewportHeight - sectionHeight) / 2, 0);

	return Math.max(centeredTop, 0);
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

const snapToSection = (index) => {
	const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
	const target = sections[nextIndex];

	if (!target || isSnapping) return;

	activeIndex = nextIndex;
	isSnapping = true;

	window.scrollTo({
		top: getSectionTop(target),
		behavior: reduceMotion ? 'auto' : 'smooth',
	});

	window.setTimeout(() => {
		isSnapping = false;
		wheelDelta = 0;
	}, reduceMotion ? 80 : 720);
};

const snapByDirection = (direction) => {
	activeIndex = findNearestSectionIndex();
	snapToSection(activeIndex + direction);
};

window.addEventListener(
	'wheel',
	(event) => {
		if (isSnapping) {
			event.preventDefault();
			return;
		}

		if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

		event.preventDefault();
		wheelDelta += event.deltaY;

		if (Math.abs(wheelDelta) < 45) return;

		snapByDirection(wheelDelta > 0 ? 1 : -1);
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

		if (Math.abs(deltaY) < 45 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

		snapByDirection(deltaY > 0 ? 1 : -1);
	},
	{ passive: true }
);

window.addEventListener('keydown', (event) => {
	if (isSnapping) return;

	if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
		event.preventDefault();
		snapByDirection(1);
	}

	if (['ArrowUp', 'PageUp'].includes(event.key)) {
		event.preventDefault();
		snapByDirection(-1);
	}
});

window.addEventListener('resize', () => {
	activeIndex = findNearestSectionIndex();
});
}
