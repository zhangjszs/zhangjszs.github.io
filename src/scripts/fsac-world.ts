import type * as Three from 'three';
import { createFsacCourse, type CourseId, type ConeLandmark } from './fsac-track';
import { createFsacModel, type PerceptionFrame } from './fsac-model';

type Layer = 'raw' | 'clusters' | 'map';
type Mode = 'perception' | 'planning' | 'orbit';

// An ideal geometric teaching simulation. No real sensor data, ML or vehicle controller is executed here.
export function createFsacWorld(
	THREE: typeof import('three'),
	scene: Three.Scene,
	compact: boolean,
	root: HTMLElement
) {
	const world = new THREE.Group();
	scene.add(world);
	let course = createFsacCourse('autocross');
	let model = createFsacModel(course);
	let content = new THREE.Group();
	world.add(content);
	let clock = 0;
	let lastObservation = -1;
	let layer: Layer = 'clusters';
	let mode: Mode = 'perception';
	let frame: PerceptionFrame;
	let pose = course.poseAt(0);
	let cones: Three.InstancedMesh;
	let stripes: Three.InstancedMesh;
	let boxes: Three.InstancedMesh;
	let landmarks: Three.InstancedMesh;
	let cloud: Three.Points;
	let pointsGeometry: Three.BufferGeometry;
	let pairsGeometry: Three.BufferGeometry;
	let planGeometry: Three.BufferGeometry;
	let corridorGeometry: Three.BufferGeometry;
	let planGroup: Three.Group;
	let candidates: Three.Line[] = [];
	let car: Three.Group;
	let sensorFan: Three.Group;
	let sweep: Three.Line;
	let trailGeometry: Three.BufferGeometry;
	const trail: Three.Vector3[] = [];
	const transform = new THREE.Object3D();
	const color = new THREE.Color();
	const pointLimit = compact ? 1800 : 3600;
	let center = new THREE.Vector3();
	let extent = 40;
	let labelElements: HTMLSpanElement[] = [];
	let labelLandmarks: ConeLandmark[] = [];
	const hash = (value: number) => {
		const n = Math.sin(value * 127.1 + 311.7) * 43758.5453;
		return n - Math.floor(n);
	};
	const coneColor = (cone: ConeLandmark) =>
		cone.side === 'left' ? 0xff6559 : cone.side === 'right' ? 0x62b8ff : 0xffd166;
	const makeDynamicGeometry = (capacity: number, colored = false) => {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(THREE.DynamicDrawUsage)
		);
		if (colored)
			geometry.setAttribute(
				'color',
				new THREE.BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(THREE.DynamicDrawUsage)
			);
		geometry.setDrawRange(0, 0);
		return geometry;
	};
	const release = (group: Three.Group) => {
		const geometries = new Set<Three.BufferGeometry>();
		const materials = new Set<Three.Material>();
		group.traverse((object) => {
			const mesh = object as Three.Mesh;
			if ((object as Three.InstancedMesh).isInstancedMesh) (object as Three.InstancedMesh).dispose();
			if (mesh.geometry) geometries.add(mesh.geometry);
			if (mesh.material)
				(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => materials.add(m));
		});
		geometries.forEach((geometry) => geometry.dispose());
		materials.forEach((material) => material.dispose());
	};
	const line = (geometry: Three.BufferGeometry, lineColor: number, opacity = 1) => {
		const result = new THREE.Line(
			geometry,
			new THREE.LineBasicMaterial({ color: lineColor, transparent: opacity < 1, opacity })
		);
		result.frustumCulled = false;
		return result;
	};
	const writeLine = (geometry: Three.BufferGeometry, points: { x: number; y?: number; z: number }[], height = 0.08) => {
		const positions = geometry.getAttribute('position') as Three.BufferAttribute;
		points
			.slice(0, positions.count)
			.forEach((point, index) => positions.setXYZ(index, point.x, point.y ?? height, point.z));
		positions.needsUpdate = true;
		geometry.setDrawRange(0, Math.min(points.length, positions.count));
	};
	function build() {
		world.remove(content);
		release(content);
		content = new THREE.Group();
		world.add(content);
		const xs = course.samples.map((p) => p.x),
			zs = course.samples.map((p) => p.z);
		center = new THREE.Vector3((Math.min(...xs) + Math.max(...xs)) / 2, 0, (Math.min(...zs) + Math.max(...zs)) / 2);
		extent = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) + 10;
		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(extent * 2, extent * 2),
			new THREE.MeshBasicMaterial({ color: 0x151914 })
		);
		floor.rotation.x = -Math.PI / 2;
		floor.position.copy(center).setY(-0.045);
		content.add(floor);
		const grid = new THREE.GridHelper(extent * 1.6, 36, 0x344331, 0x212b20);
		grid.position.copy(center).setY(-0.025);
		content.add(grid);

		cones = new THREE.InstancedMesh(
			new THREE.ConeGeometry(0.18, 0.48, 12),
			new THREE.MeshBasicMaterial({ color: 0xffffff }),
			course.cones.length
		);
		stripes = new THREE.InstancedMesh(
			new THREE.CylinderGeometry(0.075, 0.1, 0.075, 12),
			new THREE.MeshBasicMaterial({ color: 0xffffff }),
			course.cones.length
		);
		boxes = new THREE.InstancedMesh(
			new THREE.BoxGeometry(0.64, 0.72, 0.64),
			new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.75 }),
			course.cones.length
		);
		landmarks = new THREE.InstancedMesh(
			new THREE.RingGeometry(0.22, 0.31, 12),
			new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
			course.cones.length
		);
		for (const mesh of [cones, stripes, boxes, landmarks]) {
			mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
			mesh.frustumCulled = false;
			content.add(mesh);
		}
		pointsGeometry = makeDynamicGeometry(pointLimit, true);
		cloud = new THREE.Points(
			pointsGeometry,
			new THREE.PointsMaterial({
				size: compact ? 0.085 : 0.07,
				vertexColors: true,
				transparent: true,
				opacity: 0.9,
				sizeAttenuation: true,
				depthWrite: false,
			})
		);
		cloud.frustumCulled = false;
		content.add(cloud);

		car = new THREE.Group();
		const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xceff56, metalness: 0.3, roughness: 0.5 });
		const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x1a2218, metalness: 0.2, roughness: 0.6 });
		const addBox = (size: [number, number, number], position: [number, number, number], material: Three.Material) => {
			const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
			mesh.position.set(...position);
			car.add(mesh);
			return mesh;
		};
		addBox([0.85, 0.24, 1.7], [0, 0.4, 0], bodyMaterial);
		addBox([0.34, 0.16, 0.9], [0, 0.32, 1], bodyMaterial);
		addBox([1.5, 0.06, 0.3], [0, 0.21, 1.28], darkMaterial);
		addBox([1.48, 0.08, 0.28], [0, 0.74, -1.04], bodyMaterial);
		addBox([0.48, 0.26, 0.66], [0, 0.63, -0.15], darkMaterial);
		for (const x of [-0.65, 0.65])
			for (const z of [-0.7, 0.75]) {
				const wheel = new THREE.Mesh(
					new THREE.CylinderGeometry(0.24, 0.24, 0.22, 12),
					new THREE.MeshStandardMaterial({ color: 0x090c09, roughness: 1 })
				);
				wheel.rotation.z = Math.PI / 2;
				wheel.position.set(x, 0.25, z);
				car.add(wheel);
			}
		const sensor = new THREE.Mesh(
			new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12),
			new THREE.MeshBasicMaterial({ color: 0xf4f5dc })
		);
		sensor.position.set(0, 0.88, -0.1);
		car.add(sensor);
		content.add(car);

		sensorFan = new THREE.Group();
		const fanPositions: number[] = [];
		const radius = 24,
			halfFov = (55 * Math.PI) / 180;
		for (let i = 0; i < 32; i++) {
			const a = -halfFov + (i / 32) * halfFov * 2,
				b = -halfFov + ((i + 1) / 32) * halfFov * 2;
			fanPositions.push(
				0,
				0.035,
				0,
				Math.sin(a) * radius,
				0.035,
				Math.cos(a) * radius,
				Math.sin(b) * radius,
				0.035,
				Math.cos(b) * radius
			);
		}
		const fanGeometry = new THREE.BufferGeometry();
		fanGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fanPositions, 3));
		sensorFan.add(
			new THREE.Mesh(
				fanGeometry,
				new THREE.MeshBasicMaterial({
					color: 0x89b55c,
					transparent: true,
					opacity: 0.055,
					side: THREE.DoubleSide,
					depthWrite: false,
				})
			)
		);
		const arc = Array.from({ length: 65 }, (_, i) => {
			const a = -halfFov + (i / 64) * halfFov * 2;
			return new THREE.Vector3(Math.sin(a) * radius, 0.06, Math.cos(a) * radius);
		});
		const outline = line(
			new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.06, 0), ...arc, new THREE.Vector3(0, 0.06, 0)]),
			0x799b5e,
			0.6
		);
		sensorFan.add(outline);
		sweep = line(
			new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 0.1, radius)]),
			0xceff56,
			0.65
		);
		sensorFan.add(sweep);
		content.add(sensorFan);

		planGroup = new THREE.Group();
		content.add(planGroup);
		pairsGeometry = makeDynamicGeometry(240);
		const pairLines = new THREE.LineSegments(
			pairsGeometry,
			new THREE.LineBasicMaterial({ color: 0xb4c0a1, transparent: true, opacity: 0.42 })
		);
		pairLines.frustumCulled = false;
		planGroup.add(pairLines);
		planGeometry = makeDynamicGeometry(100);
		planGroup.add(line(planGeometry, 0xceff56));
		corridorGeometry = makeDynamicGeometry(450);
		const corridor = new THREE.Mesh(
			corridorGeometry,
			new THREE.MeshBasicMaterial({
				color: 0xceff56,
				transparent: true,
				opacity: 0.12,
				side: THREE.DoubleSide,
				depthWrite: false,
			})
		);
		corridor.frustumCulled = false;
		planGroup.add(corridor);
		candidates = [-1, 1].map(() => {
			const geometry = makeDynamicGeometry(100);
			const candidate = line(geometry, 0x8e9e7c, 0.6);
			planGroup.add(candidate);
			return candidate;
		});
		trailGeometry = makeDynamicGeometry(250);
		content.add(line(trailGeometry, 0x526644, 0.7));
		const labelRoot = root.querySelector<HTMLElement>('[data-fsac-labels]');
		if (labelRoot) {
			labelRoot.replaceChildren();
			labelElements = Array.from({ length: compact ? 4 : 7 }, () => {
				const label = document.createElement('span');
				label.className = 'fsac-cone-label';
				label.hidden = true;
				labelRoot.appendChild(label);
				return label;
			});
		}
		root.querySelector('[data-fsac-total]')!.textContent = String(course.cones.length);
	}

	function updateObservation() {
		frame = model.observe(pose);
		const visible = new Set(frame.visible.map((cone) => cone.id));
		const known = new Set(frame.known.map((cone) => cone.id));
		const mapLayer = layer === 'map' || mode === 'planning';
		course.cones.forEach((cone, index) => {
			const active = visible.has(cone.id),
				mapped = known.has(cone.id);
			color.setHex(coneColor(cone));
			if (!mapped && !active) color.setHex(0x62705a);
			else color.multiplyScalar(active ? 1 : 0.55);
			transform.position.set(cone.x, 0.24, cone.z);
			transform.rotation.set(0, 0, 0);
			transform.scale.setScalar(1);
			transform.updateMatrix();
			cones.setMatrixAt(index, transform.matrix);
			cones.setColorAt(index, color);
			transform.position.y = 0.285;
			transform.updateMatrix();
			stripes.setMatrixAt(index, transform.matrix);
			stripes.setColorAt(index, color.setHex(active ? 0xe9e9db : mapped ? 0x737e6a : 0x30372d));
			transform.position.y = 0.36;
			transform.scale.setScalar(active && layer === 'clusters' && mode === 'perception' ? 1 : 0);
			transform.updateMatrix();
			boxes.setMatrixAt(index, transform.matrix);
			boxes.setColorAt(index, color.setHex(coneColor(cone)));
			transform.position.y = 0.045;
			transform.rotation.x = -Math.PI / 2;
			transform.scale.setScalar(mapped && mapLayer ? 1.8 : 0);
			transform.updateMatrix();
			landmarks.setMatrixAt(index, transform.matrix);
			landmarks.setColorAt(index, color.setHex(coneColor(cone)));
		});
		for (const mesh of [cones, stripes, boxes, landmarks]) {
			mesh.instanceMatrix.needsUpdate = true;
			if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
		}
		const pos = pointsGeometry.getAttribute('position') as Three.BufferAttribute;
		const colors = pointsGeometry.getAttribute('color') as Three.BufferAttribute;
		let count = 0;
		const pushPoint = (x: number, y: number, z: number, r: number, g: number, b: number) => {
			if (count >= pointLimit) return;
			pos.setXYZ(count, x, y, z);
			colors.setXYZ(count, r, g, b);
			count++;
		};
		if (layer === 'raw') {
			for (let a = 0; a < 45; a++)
				for (let r = 1; r < 18; r++) {
					const angle = (a / 44 - 0.5) * frame.halfFov * 2,
						radius = (r / 18) * frame.range;
					const localX = Math.sin(angle) * radius,
						localZ = Math.cos(angle) * radius;
					pushPoint(
						pose.x + localX * pose.tz + localZ * pose.tx,
						0.02,
						pose.z - localX * pose.tx + localZ * pose.tz,
						0.3,
						0.36,
						0.28
					);
				}
		}
		for (const cone of frame.visible) {
			const distance = Math.hypot(cone.x - pose.x, cone.z - pose.z);
			const returns = Math.max(8, Math.round((compact ? 36 : 65) * (1 - (distance / frame.range) * 0.7)));
			for (let i = 0; i < returns; i++) {
				const height = hash(cone.id * 131 + i * 7) * 0.48,
					angle = hash(cone.id * 31 + i * 13) * Math.PI * 2;
				const radius = (1 - height / 0.48) * 0.18;
				pushPoint(cone.x + Math.sin(angle) * radius, height, cone.z + Math.cos(angle) * radius, 0.82, 0.93, 0.67);
			}
		}
		pos.needsUpdate = true;
		colors.needsUpdate = true;
		pointsGeometry.setDrawRange(0, count);
		cloud.visible = mode === 'perception' && layer !== 'map';
		planGroup.visible = mode === 'planning';
		const pairPoints = frame.pairs.flatMap((pair) => [
			{ x: pair.left.x, z: pair.left.z },
			{ x: pair.right.x, z: pair.right.z },
		]);
		writeLine(pairsGeometry, pairPoints, 0.09);
		let path: Three.Vector3[] = [];
		if (frame.trajectory.length >= 2) {
			const curve = new THREE.CatmullRomCurve3(
				frame.trajectory.map((p) => new THREE.Vector3(p.x, 0.12, p.z)),
				false,
				'centripetal'
			);
			path = curve.getPoints(70);
		}
		writeLine(planGeometry, path);
		const ribbon: { x: number; y: number; z: number }[] = [];
		for (let i = 0; i < path.length - 1; i++) {
			const a = path[i],
				b = path[i + 1],
				length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
			const nx = (-(b.z - a.z) / length) * 0.65,
				nz = ((b.x - a.x) / length) * 0.65;
			ribbon.push(
				{ x: a.x + nx, y: 0.07, z: a.z + nz },
				{ x: a.x - nx, y: 0.07, z: a.z - nz },
				{ x: b.x + nx, y: 0.07, z: b.z + nz },
				{ x: a.x - nx, y: 0.07, z: a.z - nz },
				{ x: b.x - nx, y: 0.07, z: b.z - nz },
				{ x: b.x + nx, y: 0.07, z: b.z + nz }
			);
		}
		writeLine(corridorGeometry, ribbon);
		candidates.forEach((candidate, index) => {
			const offset = index === 0 ? -0.5 : 0.5;
			const alternative = path.map((p, i) => {
				const next = path[Math.min(i + 1, path.length - 1)],
					prev = path[Math.max(0, i - 1)],
					length = Math.hypot(next.x - prev.x, next.z - prev.z) || 1;
				const amplitude = Math.sin((i / Math.max(1, path.length - 1)) * Math.PI) * offset;
				return { x: p.x - ((next.z - prev.z) / length) * amplitude, z: p.z + ((next.x - prev.x) / length) * amplitude };
			});
			const safe = alternative.every((p) => frame.known.every((cone) => Math.hypot(p.x - cone.x, p.z - cone.z) > 0.8));
			writeLine(candidate.geometry, safe ? alternative : [], 0.1);
		});
		labelLandmarks =
			layer === 'clusters' && mode === 'perception'
				? frame.visible
						.filter((cone) => cone.side !== 'start')
						.sort((a, b) => Math.hypot(a.x - pose.x, a.z - pose.z) - Math.hypot(b.x - pose.x, b.z - pose.z))
						.slice(0, labelElements.length)
				: [];
		root.querySelector('[data-fsac-visible]')!.textContent = String(frame.visible.length);
		root.querySelector('[data-fsac-known]')!.textContent = String(frame.known.length);
		const lookahead = root.querySelector('[data-fsac-lookahead]');
		if (lookahead)
			lookahead.textContent =
				path.length > 1
					? `${path
							.slice(1)
							.reduce((sum, p, i) => sum + p.distanceTo(path[i]), 0)
							.toFixed(1)} m`
					: '等待观测';
	}

	function reset() {
		clock = 0;
		lastObservation = -1;
		trail.length = 0;
		model.reset();
		pose = course.poseAt(0);
		updateObservation();
	}
	build();
	reset();
	return {
		world,
		setCourse(id: CourseId) {
			course = createFsacCourse(id);
			model = createFsacModel(course);
			build();
			reset();
		},
		setLayer(value: Layer) {
			layer = value;
			updateObservation();
		},
		reset,
		update(delta: number, currentMode: Mode) {
			const changed = mode !== currentMode;
			mode = currentMode;
			world.visible = mode !== 'orbit';
			if (!world.visible) return;
			clock += delta;
			const progress = clock * 5;
			pose = course.poseAt(course.closed ? progress : Math.min(progress, course.length));
			car.position.set(pose.x, 0, pose.z);
			car.rotation.y = Math.atan2(pose.tx, pose.tz);
			sensorFan.position.copy(car.position);
			sensorFan.rotation.y = car.rotation.y;
			sensorFan.visible = mode === 'perception';
			sweep.rotation.y = (Math.sin(clock * 3) * 55 * Math.PI) / 180;
			if (clock - lastObservation > 0.12 || lastObservation < 0 || changed) {
				updateObservation();
				lastObservation = clock;
			}
			if (!trail.length || trail[trail.length - 1].distanceTo(car.position) > 0.4) {
				trail.push(car.position.clone().setY(0.035));
				if (trail.length > 240) trail.shift();
				writeLine(trailGeometry, trail);
			}
		},
		camera() {
			return { pose, center, extent };
		},
		projectLabels(camera: Three.Camera, width: number, height: number) {
			labelElements.forEach((label, index) => {
				const cone = labelLandmarks[index];
				if (!cone || mode !== 'perception') {
					label.hidden = true;
					return;
				}
				const p = new THREE.Vector3(cone.x, 0.9, cone.z).project(camera);
				label.hidden = p.z > 1 || p.z < -1 || Math.abs(p.x) > 0.94 || Math.abs(p.y) > 0.82;
				label.style.transform = `translate(${(p.x * 0.5 + 0.5) * width}px,${(-p.y * 0.5 + 0.5) * height}px)`;
				label.style.color = cone.side === 'left' ? '#ff8276' : '#7fc8ff';
				label.textContent = `${cone.side === 'left' ? 'L' : 'R'}${String(cone.id).padStart(2, '0')}`;
			});
		},
	};
}
