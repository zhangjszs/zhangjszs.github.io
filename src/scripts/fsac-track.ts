/** Original procedural layouts inspired by FSAC events; never an official surveyed circuit. */
export type CourseId = 'autocross' | 'skidpad' | 'acceleration';

export interface TrackPose {
	x: number;
	z: number;
	tx: number;
	tz: number;
	curvature: number;
	distance: number;
}

export interface ConeLandmark {
	id: number;
	x: number;
	z: number;
	side: 'left' | 'right' | 'start';
	station: number;
}

export interface FsacCourse {
	id: CourseId;
	label: string;
	length: number;
	width: number;
	closed: boolean;
	samples: TrackPose[];
	cones: ConeLandmark[];
	poseAt(distance: number): TrackPose;
}

interface Point {
	x: number;
	z: number;
}

const SAMPLE_COUNT = 600;
const TAU = Math.PI * 2;
const clamp = (value: number, minimum: number, maximum: number) => Math.max(minimum, Math.min(maximum, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A long start straight, upper chicane, eastern sweeper, tight U-turn and linked S-bends. */
function autocrossPoints(): Point[] {
	const controls: Point[] = [
		{ x: -25, z: -15 },
		{ x: -25, z: -5 },
		{ x: -25, z: 8 },
		{ x: -23, z: 16 },
		{ x: -18, z: 20 },
		{ x: -7, z: 20 },
		{ x: 1, z: 17 },
		{ x: 8, z: 20 },
		{ x: 18, z: 20 },
		{ x: 26, z: 14 },
		{ x: 28, z: 5 },
		{ x: 28, z: -9 },
		{ x: 24, z: -19 },
		{ x: 17, z: -22 },
		{ x: 11, z: -19 },
		{ x: 9, z: -12 },
		{ x: 14, z: -6 },
		{ x: 13, z: 1 },
		{ x: 6, z: 4 },
		{ x: -2, z: 0 },
		{ x: -5, z: -7 },
		{ x: -4, z: -14 },
		{ x: -7, z: -21 },
		{ x: -17, z: -24 },
		{ x: -23, z: -22 },
		{ x: -25, z: -18.5 },
	];
	const points: Point[] = [];
	for (let segment = 0; segment < controls.length; segment++) {
		const p0 = controls[(segment - 1 + controls.length) % controls.length];
		const p1 = controls[segment];
		const p2 = controls[(segment + 1) % controls.length];
		const p3 = controls[(segment + 2) % controls.length];
		for (let j = 0; j < 40; j++) {
			const t = j / 40;
			const t2 = t * t;
			const t3 = t2 * t;
			const axis = (a: number, b: number, c: number, d: number) =>
				0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
			points.push({ x: axis(p0.x, p1.x, p2.x, p3.x), z: axis(p0.z, p1.z, p2.z, p3.z) });
		}
	}
	points.push({ ...points[0] });
	// Keep the tightest bend wider than the half-width of the lane.
	return points.map((point) => ({ x: point.x * 1.15, z: point.z * 1.15 }));
}

function skidpadPoints(): Point[] {
	// Two tangent circles traversed in opposite directions, meeting with the same northbound tangent.
	const radius = 9.125;
	return Array.from({ length: 1201 }, (_, i) => {
		const phase = (i / 600) * TAU;
		if (i <= 600) return { x: -radius + Math.cos(phase) * radius, z: Math.sin(phase) * radius };
		const angle = Math.PI - (phase - TAU);
		return { x: radius + Math.cos(angle) * radius, z: Math.sin(angle) * radius };
	});
}

/** Resample by travelled distance so vehicle motion and cone spacing are independent of spline knots. */
function resample(points: Point[], closed: boolean): { samples: TrackPose[]; length: number } {
	const accumulated = [0];
	for (let i = 1; i < points.length; i++) {
		accumulated.push(accumulated[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z));
	}
	const length = accumulated.at(-1)!;
	const positions: Point[] = [];
	let segment = 0;
	for (let i = 0; i <= SAMPLE_COUNT; i++) {
		const station = (i / SAMPLE_COUNT) * length;
		while (segment < points.length - 2 && accumulated[segment + 1] < station) segment++;
		const span = accumulated[segment + 1] - accumulated[segment];
		const phase = span > 0 ? (station - accumulated[segment]) / span : 0;
		positions.push({
			x: lerp(points[segment].x, points[segment + 1].x, phase),
			z: lerp(points[segment].z, points[segment + 1].z, phase),
		});
	}
	const samples = positions.map((point, i): TrackPose => {
		const index = closed && i === SAMPLE_COUNT ? 0 : i;
		const before = positions[closed ? (index - 1 + SAMPLE_COUNT) % SAMPLE_COUNT : Math.max(0, i - 1)];
		const after = positions[closed ? (index + 1) % SAMPLE_COUNT : Math.min(SAMPLE_COUNT, i + 1)];
		const dx = after.x - before.x;
		const dz = after.z - before.z;
		const tangentLength = Math.hypot(dx, dz);
		const ax = point.x - before.x;
		const az = point.z - before.z;
		const bx = after.x - point.x;
		const bz = after.z - point.z;
		const denominator = Math.hypot(ax, az) * Math.hypot(bx, bz) * tangentLength;
		return {
			x: point.x,
			z: point.z,
			tx: dx / tangentLength,
			tz: dz / tangentLength,
			curvature: denominator > 1e-9 ? (2 * (ax * bz - az * bx)) / denominator : 0,
			distance: (i / SAMPLE_COUNT) * length,
		};
	});
	return { samples, length };
}

export function createFsacCourse(id: CourseId = 'autocross'): FsacCourse {
	const closed = id !== 'acceleration';
	const width = id === 'skidpad' ? 3 : 4.2;
	// Acceleration includes a distinct 25 m runoff after the illustrative 75 m timing gate.
	const points =
		id === 'autocross'
			? autocrossPoints()
			: id === 'skidpad'
				? skidpadPoints()
				: [
						{ x: 0, z: 0 },
						{ x: 0, z: 100 },
					];
	const { samples, length } = resample(points, closed);
	// Finite differences around a spline knot must not introduce an artificial yaw at the gate.
	samples[0].tx = 0;
	samples[0].tz = 1;
	if (closed) {
		samples[SAMPLE_COUNT].tx = 0;
		samples[SAMPLE_COUNT].tz = 1;
	}
	const poseAt = (distance: number): TrackPose => {
		const station = closed ? ((distance % length) + length) % length : clamp(distance, 0, length);
		const index = (station / length) * SAMPLE_COUNT;
		const first = Math.min(SAMPLE_COUNT - 1, Math.floor(index));
		const phase = index - first;
		const a = samples[first];
		const b = samples[first + 1];
		const tx = lerp(a.tx, b.tx, phase);
		const tz = lerp(a.tz, b.tz, phase);
		const tangentLength = Math.hypot(tx, tz);
		return {
			x: lerp(a.x, b.x, phase),
			z: lerp(a.z, b.z, phase),
			tx: tx / tangentLength,
			tz: tz / tangentLength,
			curvature: lerp(a.curvature, b.curvature, phase),
			distance: station,
		};
	};
	const cones: ConeLandmark[] = [];
	const addCone = (x: number, z: number, side: ConeLandmark['side'], station: number) => {
		if (cones.some((cone) => Math.hypot(cone.x - x, cone.z - z) < 0.42)) return;
		cones.push({ id: cones.length, x, z, side, station });
	};
	// Boundaries are staggered: real cone layouts need not form matching left/right pairs.
	for (const side of ['left', 'right'] as const) {
		for (let station = side === 'left' ? 2 : 3.4; station < length - 1.5;) {
			const pose = poseAt(station);
			const offset = (side === 'left' ? 1 : -1) * width * 0.5;
			// Three.js: +Y is up and the car's +Z axis points forward; driver-left is +X.
			const x = pose.x + pose.tz * offset;
			const z = pose.z - pose.tx * offset;
			// Leave the common crossover open rather than putting one circle's outer cones in the other's lane.
			const crossesOtherLane =
				id === 'skidpad' &&
				samples.some(
					(other) => Math.abs(other.distance - station) > 9 && Math.hypot(other.x - x, other.z - z) < width * 0.43
				);
			if (!crossesOtherLane) addCone(x, z, side, station);
			const spacing = id === 'skidpad' ? 2.5 : side === 'left' ? 3.3 : 3.8;
			station += clamp(spacing - Math.abs(pose.curvature) * 7, 2.2, spacing);
		}
	}
	// `start` is the renderer's marker category: yellow denotes parking, never a road boundary.
	const addParkingMarkers = (station: number) => {
		for (const row of [0, 1.2]) {
			const pose = poseAt(station + row);
			for (const side of [-1, 1]) {
				const offset = side * (width * 0.5 + 1.2);
				addCone(pose.x - pose.tz * offset, pose.z + pose.tx * offset, 'start', station);
			}
		}
	};
	addParkingMarkers(id === 'acceleration' ? 98.5 : length - 2.5);
	return {
		id,
		label: id === 'autocross' ? '高速循迹' : id === 'skidpad' ? '八字环绕' : '直线加速',
		length,
		width,
		closed,
		samples,
		cones,
		poseAt,
	};
}
