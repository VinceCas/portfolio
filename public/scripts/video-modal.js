const modal = document.getElementById('eos-video-modal');
const video = document.getElementById('eos-video');
const openButton = document.querySelector('[data-video-open]');
const closeButton = document.querySelector('[data-video-close]');

const openModal = () => {
	if (!modal || !video || !openButton) return;

	modal.hidden = false;
	document.body.classList.add('video-modal-open');
	closeButton?.focus();
	video.currentTime = 0;
	video.play().catch(() => {});
};

const closeModal = () => {
	if (!modal || !video || !openButton) return;

	video.pause();
	modal.hidden = true;
	document.body.classList.remove('video-modal-open');
	openButton.focus();
};

openButton?.addEventListener('click', openModal);
closeButton?.addEventListener('click', closeModal);

modal?.addEventListener('click', (event) => {
	if (event.target === modal) {
		closeModal();
	}
});

window.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && modal && !modal.hidden) {
		closeModal();
	}
});
