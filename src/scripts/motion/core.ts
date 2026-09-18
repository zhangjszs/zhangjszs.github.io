// 全站动效统一网关：Lenis 平滑滚动 + GSAP ScrollTrigger + 降级收口。
// - prefers-reduced-motion → html[data-motion="reduced"]，不初始化任何动画
// - 触屏/窄屏 → html[data-motion-tier="mobile"]，页面脚本据此减少粒子数、禁用视差等
// - reveal：[data-reveal] 元素进入视口一次性淡入上移，可用 data-reveal-delay 错峰
// 用法：页面 <script> 里 `import { initMotion } from '../scripts/motion/core'; initMotion();`
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = (): boolean => window.matchMedia('(pointer: coarse)').matches;

export const isMobileTier = (): boolean => isCoarsePointer() || window.innerWidth < 820;

export interface MotionOptions {
	/** reveal 目标选择器，默认 [data-reveal] */
	reveals?: string;
	/** 是否启用 Lenis 平滑滚动（详情页长文可关闭以免与锚点/选中冲突） */
	smoothScroll?: boolean;
}

export function initMotion(opts: MotionOptions = {}) {
	const html = document.documentElement;

	initAnchorScroll();

	if (prefersReducedMotion()) {
		html.dataset.motion = 'reduced';
		return { lenis: null };
	}

	html.dataset.motion = 'full';
	html.dataset.motionTier = isMobileTier() ? 'mobile' : 'desktop';

	let lenis: Lenis | null = null;
	if (opts.smoothScroll !== false) {
		lenis = new Lenis({ duration: 1.1, smoothWheel: true });
		lenis.on('scroll', ScrollTrigger.update);
		gsap.ticker.add((time) => lenis!.raf(time * 1000));
		gsap.ticker.lagSmoothing(0);
	}

	const targets = gsap.utils.toArray<HTMLElement>(opts.reveals ?? '[data-reveal]');
	targets.forEach((el) => {
		const delay = Number(el.dataset.revealDelay ?? 0);
		gsap.fromTo(
			el,
			{ opacity: 0, y: 28 },
			{
				opacity: 1,
				y: 0,
				duration: 0.9,
				delay,
				ease: 'power3.out',
				scrollTrigger: { trigger: el, start: 'top 88%', once: true },
			}
		);
	});

	anchorLenis = lenis;

	// 跨页跳转来的 #锚点 由浏览器原生完成，Lenis 会把位置拉回去，这里立即对齐一次
	if (location.hash) {
		const pending = document.getElementById(decodeURIComponent(location.hash.slice(1)));
		if (pending) lenis?.scrollTo(pending, { immediate: true, offset: anchorOffset() });
	}

	return { lenis };
}

/** 顶栏是 sticky 的，锚点落点要让开它的高度 */
let anchorLenis: Lenis | null = null;

function anchorOffset() {
	const nav = document.getElementById('main-nav');
	return -(nav?.getBoundingClientRect().height ?? 0) - 16;
}

export function initAnchorScroll() {
	if (document.documentElement.dataset.anchorScroll) return;
	document.documentElement.dataset.anchorScroll = 'true';

	document.addEventListener('click', (event) => {
		const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
		const href = anchor?.getAttribute('href');
		if (!href || href === '#') return;

		const id = decodeURIComponent(href.slice(1));
		const target = document.getElementById(id);
		if (!target) return;

		event.preventDefault();

		const offset = anchorOffset();

		if (anchorLenis && !prefersReducedMotion()) {
			anchorLenis.scrollTo(target, { offset });
		} else {
			target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
		}

		// 把焦点交给目标区块：键盘与读屏用户跳转后从那里继续，而不是停在页头
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		(target as HTMLElement).focus({ preventScroll: true });
		history.replaceState(null, '', href);
	});
}
