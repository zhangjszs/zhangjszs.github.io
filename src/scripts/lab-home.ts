// Keep the static content visible; animate only as a progressive enhancement.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealAnimations = new Set<Animation>();
if (!reducedMotion.matches) {
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				observer.unobserve(entry.target);
				if (reducedMotion.matches) continue;
				const animation = entry.target.animate(
					[
						{ opacity: 0.35, transform: 'translateY(24px)' },
						{ opacity: 1, transform: 'translateY(0)' },
					],
					{ duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
				);
				revealAnimations.add(animation);
				animation.addEventListener('finish', () => revealAnimations.delete(animation), { once: true });
			}
		},
		{ threshold: 0.12 }
	);
	document.querySelectorAll('[data-lab-reveal]').forEach((element) => observer.observe(element));
	window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}
reducedMotion.addEventListener('change', () => {
	if (!reducedMotion.matches) return;
	revealAnimations.forEach((animation) => animation.cancel());
	revealAnimations.clear();
});
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener('click', (event) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		const hash = anchor.hash;
		if (!hash) return;
		const target = document.getElementById(decodeURIComponent(hash.slice(1)));
		if (!target) return;
		event.preventDefault();
		target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
		history.replaceState(null, '', hash);
	});
});
