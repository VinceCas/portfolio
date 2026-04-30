const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
	root.classList.add('night-mode');
}

const profileFrames = [
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_001.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_002.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_003.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_004.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_005.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_006.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_007.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_008.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_009.png', import.meta.url).href,
	new URL('../assets/profile_transfrom/the-grey-background-slowly-transitions-to-a-solid-_010.png', import.meta.url).href,
];
const profileLightImage = profileFrames[0];
const profileDarkImage = profileFrames[profileFrames.length - 1];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let profileAnimationTimer;

const preloadProfileFrames = () => {
	profileFrames.forEach((frame) => {
		const image = new Image();
		image.src = frame;
	});
};

const syncToggle = (themeToggle) => {
	const isNightMode = root.classList.contains('night-mode');
	themeToggle.setAttribute('aria-pressed', String(isNightMode));
	themeToggle.setAttribute(
		'aria-label',
		isNightMode ? 'Switch to day mode' : 'Switch to night mode'
	);
};

const playProfileFrames = (profileImage, frames, fallbackImage) => {
	clearTimeout(profileAnimationTimer);

	if (!profileImage) return;

	if (reducedMotion) {
		profileImage.src = fallbackImage;
		return;
	}

	let frameIndex = 0;
	const frameDuration = 70;

	const showNextFrame = () => {
		profileImage.src = frames[frameIndex];
		frameIndex += 1;

		if (frameIndex < frames.length) {
			profileAnimationTimer = setTimeout(showNextFrame, frameDuration);
		} else {
			profileImage.src = fallbackImage;
		}
	};

	showNextFrame();
};

const syncProfileImage = (profileImage) => {
	if (!profileImage) return;

	profileImage.src = root.classList.contains('night-mode')
		? profileDarkImage
		: profileLightImage;
};

const initThemeToggle = () => {
	const themeToggle = document.getElementById('theme-toggle');
	const profileImage = document.getElementById('profile-image');

	if (!themeToggle) return;

	preloadProfileFrames();
	syncToggle(themeToggle);
	syncProfileImage(profileImage);

	themeToggle.addEventListener('click', () => {
		const isNightMode = root.classList.toggle('night-mode');
		localStorage.setItem('theme', isNightMode ? 'dark' : 'light');
		syncToggle(themeToggle);
		playProfileFrames(
			profileImage,
			isNightMode ? profileFrames : [...profileFrames].reverse(),
			isNightMode ? profileDarkImage : profileLightImage
		);
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
	initThemeToggle();
}
