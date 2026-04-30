const revealSections = [...document.querySelectorAll('.snap-section')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
	revealSections.forEach((section) => section.classList.add('is-visible'));
} else {
	const revealObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
				} else {
					entry.target.classList.remove('is-visible');
				}
			});
		},
		{
			threshold: 0.35,
			rootMargin: '0px 0px -8% 0px',
		}
	);

	revealSections.forEach((section) => revealObserver.observe(section));
}
