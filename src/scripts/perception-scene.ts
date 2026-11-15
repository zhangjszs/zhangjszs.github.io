import type * as Three from 'three';
import { createFsacWorld } from './fsac-world';
import type { CourseId } from './fsac-track';

type SceneMode = 'perception' | 'planning' | 'orbit';

const captions: Record<SceneMode, [string, string]> = {
	perception: ['01 / CONE PERCEPTION', '有限视域 → 锥桶回波 → 聚类与累计地图。'],
	planning: ['02 / LOCAL PLANNING', '只用已观测锥桶，连接局部走廊与平滑轨迹。'],
	orbit: ['03 / ORBITAL SANDBOX', '把视线移向更远的坐标系。'],
};

async function initScene(root: HTMLElement) {
	const canvas = root.querySelector<HTMLCanvasElement>('.scene-canvas');
	const pauseButton = root.querySelector<HTMLButtonElement>('[data-scene-pause]');
	const pauseLabel = root.querySelector<HTMLElement>('[data-scene-pause-label]');
	const status = root.querySelector<HTMLElement>('[data-scene-status]');
	const interaction = root.querySelector<HTMLElement>('[data-scene-interaction]');
	const speedInput = root.querySelector<HTMLInputElement>('[data-scene-speed]');
	const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	if (!canvas || !pauseButton || !pauseLabel || !status) return;

	let mode: SceneMode = (root.dataset.mode as SceneMode) || 'perception';
	let perceptionLayer: 'raw' | 'clusters' | 'map' = 'clusters';
	const updateCaption = () => {
		root.querySelector('[data-scene-kicker]')!.textContent = captions[mode][0];
		const notes = {
			raw: '地面与锥桶表面的几何回波采样 · 仅限前方观测区域。',
			clusters: '去地面后的目标框 · 红蓝颜色为融合分类示意。',
			map: '只累计已观测地标 · 灰桶是未知区域的场景参考。',
		};
		root.querySelector('[data-scene-caption]')!.textContent =
			mode === 'perception' ? notes[perceptionLayer] : captions[mode][1];
	};
	updateCaption();
	let paused = motionQuery.matches;
	let speed = Number(speedInput?.value) || 1;
	let renderOnce: (() => void) | undefined;
	let updateSceneMode: (() => void) | undefined;
	const controls = new AbortController();
	const setControlsAvailable = (available: boolean) => {
		root
			.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>(
				'[data-scene-mode], [data-scene-speed], [data-scene-pause], [data-fsac-course], [data-fsac-layer], [data-fsac-follow], [data-fsac-reset]'
			)
			.forEach((control) => {
				control.disabled = !available;
			});
		if (interaction) interaction.tabIndex = available ? 0 : -1;
	};

	root.querySelectorAll<HTMLButtonElement>('[data-scene-mode]').forEach((button) => {
		button.addEventListener(
			'click',
			() => {
				mode = button.dataset.sceneMode as SceneMode;
				root.dataset.mode = mode;
				root.querySelectorAll('[data-scene-mode]').forEach((item) => {
					item.setAttribute('aria-pressed', String((item as HTMLElement).dataset.sceneMode === mode));
				});
				updateCaption();
				updateSceneMode?.();
				renderOnce?.();
			},
			{ signal: controls.signal }
		);
	});

	try {
		const THREE = await import('three');
		if (!root.isConnected) return;
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
		const compact = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 1.75));
		renderer.setClearColor(0x10120f, 1);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x10120f, 0.006);
		const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
		const baseCamera = new THREE.Vector3(compact ? 24 : 21, compact ? 26 : 23, compact ? 29 : 27);
		camera.position.copy(baseCamera);
		camera.lookAt(0, 0, 0);
		scene.add(new THREE.AmbientLight(0xffffff, 2.1));
		const light = new THREE.DirectionalLight(0xe4f5b4, 3.5);
		light.position.set(6, 12, 8);
		scene.add(light);

		const fsac = createFsacWorld(THREE, scene, compact, root);
		let followCamera = true;
		const viewButton = root.querySelector<HTMLButtonElement>('[data-fsac-follow]');
		if (viewButton) {
			viewButton.setAttribute('aria-pressed', 'true');
			viewButton.textContent = '跟车视角';
		}

		const orbitWorld = new THREE.Group();
		orbitWorld.position.y = 2;
		scene.add(orbitWorld);
		const planetGeometry = new THREE.SphereGeometry(5, 30, 18);
		orbitWorld.add(new THREE.Mesh(planetGeometry, new THREE.MeshBasicMaterial({ color: 0x151e0e })));
		orbitWorld.add(
			new THREE.LineSegments(
				new THREE.WireframeGeometry(planetGeometry),
				new THREE.LineBasicMaterial({ color: 0x6c8149, transparent: true, opacity: 0.34 })
			)
		);
		const orbiters: { satellite: Three.Group; curve: Three.EllipseCurve; inclination: Three.Euler; radius: number }[] =
			[];
		for (let i = 0; i < 3; i++) {
			const radius = 8.5 + i * 2.3;
			const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.82, 0, Math.PI * 2, false, 0);
			const inclination = new THREE.Euler(i * 0.8 + 0.3, i * 0.65, i * 0.6 - 0.4);
			const points = curve.getPoints(220).map((p) => new THREE.Vector3(p.x, 0, p.y).applyEuler(inclination));
			orbitWorld.add(
				new THREE.LineLoop(
					new THREE.BufferGeometry().setFromPoints(points),
					new THREE.LineBasicMaterial({
						color: i === 0 ? 0xceff56 : 0x839568,
						transparent: true,
						opacity: i === 0 ? 1 : 0.45,
					})
				)
			);
			const satellite = new THREE.Group();
			satellite.add(
				new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.5), new THREE.MeshBasicMaterial({ color: 0xf0ffca }))
			);
			const panels = new THREE.Mesh(
				new THREE.BoxGeometry(1.5, 0.08, 0.45),
				new THREE.MeshBasicMaterial({ color: 0xceff56 })
			);
			satellite.add(panels);
			orbitWorld.add(satellite);
			orbiters.push({ satellite, curve, inclination, radius });
		}
		const equator = new THREE.GridHelper(42, 20, 0x485d2d, 0x28331d);
		equator.position.y = -7;
		orbitWorld.add(equator);

		let elapsed = 1.5,
			frame = 0,
			lastTime = 0,
			intersecting = true,
			disposed = false;
		let dragPointer: number | null = null,
			lastX = 0,
			lastY = 0,
			orbitYaw = 0,
			orbitPitch = 0;
		const pointer = new THREE.Vector2();
		const desiredCamera = new THREE.Vector3();
		let previousElapsed = elapsed;
		const update = () => {
			fsac.update(elapsed - previousElapsed, mode);
			previousElapsed = elapsed;
			orbiters.forEach(({ satellite, curve, inclination }, i) => {
				const p = curve.getPoint((elapsed * (0.025 + i * 0.008) + i * 0.3) % 1);
				satellite.position.set(p.x, 0, p.y).applyEuler(inclination);
				satellite.rotation.set(elapsed * 0.1, elapsed * 0.15, 0);
			});
			orbitWorld.rotation.y = elapsed * 0.012;
			const state = fsac.camera();
			const target = mode === 'orbit' ? new THREE.Vector3(0, 2, 0) : state.center.clone();
			let radius = mode === 'orbit' ? baseCamera.length() : state.extent * (compact ? 1.7 : 1.1);
			let yaw = Math.atan2(baseCamera.x, baseCamera.z) + orbitYaw;
			if (followCamera && mode !== 'orbit') {
				target.set(state.pose.x + state.pose.tx * 6, 0, state.pose.z + state.pose.tz * 6);
				yaw = Math.atan2(-state.pose.tx, -state.pose.tz) + orbitYaw;
				radius = compact ? 34 : 32;
			}
			const pitch = Math.max(0.22, Math.min(1.25, 0.8 + orbitPitch));
			desiredCamera
				.set(
					Math.sin(yaw) * Math.cos(pitch) * radius,
					Math.sin(pitch) * radius,
					Math.cos(yaw) * Math.cos(pitch) * radius
				)
				.add(target);
			desiredCamera.add(new THREE.Vector3(pointer.x * 1.4, pointer.y * 0.8, -pointer.x));
			camera.position.lerp(desiredCamera, paused || motionQuery.matches ? 1 : 0.14);
			camera.lookAt(target);
			fsac.projectLabels(camera, root.clientWidth, root.clientHeight);
		};
		renderOnce = () => {
			if (!disposed) {
				update();
				renderer.render(scene, camera);
			}
		};
		updateSceneMode = () => {
			fsac.world.visible = mode !== 'orbit';
			orbitWorld.visible = mode === 'orbit';
		};
		updateSceneMode();
		root.querySelector<HTMLSelectElement>('[data-fsac-course]')?.addEventListener(
			'change',
			(event) => {
				fsac.setCourse((event.currentTarget as HTMLSelectElement).value as CourseId);
				orbitYaw = 0;
				orbitPitch = 0;
				renderOnce?.();
			},
			{ signal: controls.signal }
		);
		root.querySelectorAll<HTMLButtonElement>('[data-fsac-layer]').forEach((button) => {
			button.addEventListener(
				'click',
				() => {
					perceptionLayer = button.dataset.fsacLayer as 'raw' | 'clusters' | 'map';
					fsac.setLayer(perceptionLayer);
					updateCaption();
					root
						.querySelectorAll<HTMLElement>('[data-fsac-layer]')
						.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
					renderOnce?.();
				},
				{ signal: controls.signal }
			);
		});
		root.querySelector<HTMLButtonElement>('[data-fsac-follow]')?.addEventListener(
			'click',
			(event) => {
				followCamera = !followCamera;
				const button = event.currentTarget as HTMLButtonElement;
				button.setAttribute('aria-pressed', String(followCamera));
				button.textContent = '跟车视角';
				orbitYaw = 0;
				orbitPitch = 0;
				renderOnce?.();
			},
			{ signal: controls.signal }
		);
		root.querySelector<HTMLButtonElement>('[data-fsac-reset]')?.addEventListener(
			'click',
			() => {
				fsac.reset();
				renderOnce?.();
			},
			{ signal: controls.signal }
		);
		const resize = () => {
			if (disposed) return;
			const width = root.clientWidth,
				height = root.clientHeight;
			if (!width || !height) return;
			renderer.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderOnce?.();
		};
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(root);
		resize();
		root.dataset.state = 'ready';
		setControlsAvailable(true);
		const updateStatus = () => {
			pauseButton.setAttribute('aria-pressed', String(paused));
			pauseButton.setAttribute('aria-label', paused ? '继续三维演示' : '暂停三维演示');
			pauseLabel.textContent = paused ? '继续 ▷' : '暂停 II';
			status.textContent = paused ? '演示已暂停 · 可拖动旋转或切换模式' : 'WEBGL · 拖动旋转 · 方向键调整 · R 重置';
		};
		const shouldAnimate = () => !paused && !motionQuery.matches && intersecting && !document.hidden && !disposed;
		const tick = (now: number) => {
			frame = 0;
			if (!shouldAnimate()) {
				lastTime = 0;
				return;
			}
			if (lastTime) elapsed += Math.min((now - lastTime) / 1000, 0.05) * speed;
			lastTime = now;
			renderOnce?.();
			frame = requestAnimationFrame(tick);
		};
		const schedule = () => {
			if (shouldAnimate() && !frame) frame = requestAnimationFrame(tick);
			else if (!shouldAnimate() && frame) {
				cancelAnimationFrame(frame);
				frame = 0;
				lastTime = 0;
			}
		};
		pauseButton.addEventListener(
			'click',
			() => {
				paused = !paused;
				if (motionQuery.matches && !paused) {
					paused = true;
					status.textContent = '系统已启用减少动态效果，保留静态三维场景。';
					return;
				}
				updateStatus();
				schedule();
			},
			{ signal: controls.signal }
		);
		speedInput?.addEventListener(
			'input',
			() => {
				speed = Number(speedInput.value);
				root.querySelector('[data-scene-speed-value]')!.textContent = `${speed}×`;
			},
			{ signal: controls.signal }
		);
		interaction?.addEventListener(
			'pointerdown',
			(event) => {
				dragPointer = event.pointerId;
				lastX = event.clientX;
				lastY = event.clientY;
				interaction.setPointerCapture(event.pointerId);
			},
			{ signal: controls.signal }
		);
		interaction?.addEventListener(
			'pointermove',
			(event) => {
				if (event.pointerId !== dragPointer) return;
				orbitYaw -= (event.clientX - lastX) * 0.007;
				orbitPitch = Math.max(-0.45, Math.min(0.55, orbitPitch + (event.clientY - lastY) * 0.005));
				lastX = event.clientX;
				lastY = event.clientY;
				renderOnce?.();
			},
			{ signal: controls.signal }
		);
		const endDrag = () => {
			dragPointer = null;
		};
		interaction?.addEventListener('pointerup', endDrag, { signal: controls.signal });
		interaction?.addEventListener('pointercancel', endDrag, { signal: controls.signal });
		interaction?.addEventListener(
			'keydown',
			(event) => {
				if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'r', 'R'].includes(event.key)) return;
				event.preventDefault();
				if (event.key === 'ArrowLeft') orbitYaw += 0.16;
				if (event.key === 'ArrowRight') orbitYaw -= 0.16;
				if (event.key === 'ArrowUp') orbitPitch += 0.08;
				if (event.key === 'ArrowDown') orbitPitch -= 0.08;
				if (event.key.toLowerCase() === 'r') {
					orbitYaw = 0;
					orbitPitch = 0;
					pointer.set(0, 0);
				}
				orbitPitch = Math.max(-0.45, Math.min(0.55, orbitPitch));
				renderOnce?.();
			},
			{ signal: controls.signal }
		);
		root.addEventListener(
			'pointermove',
			(event) => {
				if (paused || motionQuery.matches || event.pointerType === 'touch') return;
				const bounds = root.getBoundingClientRect();
				pointer.set(
					((event.clientX - bounds.left) / bounds.width) * 2 - 1,
					((event.clientY - bounds.top) / bounds.height) * 2 - 1
				);
			},
			{ signal: controls.signal }
		);
		root.addEventListener('pointerleave', () => pointer.set(0, 0), { signal: controls.signal });
		const intersectionObserver = new IntersectionObserver(
			([entry]) => {
				intersecting = entry.isIntersecting;
				schedule();
			},
			{ threshold: 0.05 }
		);
		intersectionObserver.observe(root);
		document.addEventListener('visibilitychange', schedule, { signal: controls.signal });
		motionQuery.addEventListener(
			'change',
			() => {
				paused = motionQuery.matches;
				updateStatus();
				renderOnce?.();
				schedule();
			},
			{ signal: controls.signal }
		);
		const dispose = () => {
			disposed = true;
			root.dataset.state = 'static';
			setControlsAvailable(false);
			cancelAnimationFrame(frame);
			controls.abort();
			intersectionObserver.disconnect();
			resizeObserver.disconnect();
			const geometries = new Set<Three.BufferGeometry>(),
				materials = new Set<Three.Material>();
			scene.traverse((object) => {
				const mesh = object as Three.Mesh;
				if ((object as Three.InstancedMesh).isInstancedMesh) (object as Three.InstancedMesh).dispose();
				if (mesh.geometry) geometries.add(mesh.geometry);
				if (mesh.material)
					(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) =>
						materials.add(material)
					);
			});
			geometries.forEach((geometry) => geometry.dispose());
			materials.forEach((material) => material.dispose());
			renderer.dispose();
		};
		window.addEventListener(
			'pagehide',
			(event) => {
				dispose();
				if (event.persisted) {
					window.addEventListener(
						'pageshow',
						() => {
							void initScene(root);
						},
						{ once: true }
					);
				}
			},
			{ once: true }
		);
		updateStatus();
		renderOnce();
		schedule();
	} catch {
		root.dataset.state = 'static';
		setControlsAvailable(false);
		status.textContent = '静态预览 · 当前设备未启用 WebGL';
	}
}

document.querySelectorAll<HTMLElement>('[data-perception-scene]').forEach((root) => {
	void initScene(root);
});
