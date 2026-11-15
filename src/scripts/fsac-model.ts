import type { ConeLandmark, FsacCourse, TrackPose } from './fsac-track';

export interface PlanPoint {
	x: number;
	z: number;
}

export interface ConePair {
	left: ConeLandmark;
	right: ConeLandmark;
	mid: PlanPoint;
}

export interface PerceptionFrame {
	visible: ConeLandmark[];
	known: ConeLandmark[];
	pairs: ConePair[];
	trajectory: PlanPoint[];
	range: number;
	/** Half of the horizontal field of view, in radians. */
	halfFov: number;
}

interface PairCandidate extends ConePair {
	width: number;
	tx: number;
	tz: number;
}

const RANGE = 24;
const HALF_FOV = (55 * Math.PI) / 180;
const ANGLE_BIN = (1.25 * Math.PI) / 180;
const EPSILON = 1e-6;

/**
 * Ideal geometric observations for an explanatory visualization, not LiDAR inference.
 * Only the sensor stage reads the procedural world. Mapping and local planning use
 * observations alone: never course stations, centreline samples or future poses.
 */
export function createFsacModel(course: FsacCourse) {
	const knownMap = new Map<number, ConeLandmark>();

	const observe = (pose: TrackPose): PerceptionFrame => {
		const headingLength = Math.hypot(pose.tx, pose.tz) || 1;
		const hx = pose.tx / headingLength;
		const hz = pose.tz / headingLength;
		const bins = new Map<number, { cone: ConeLandmark; distance: number }>();

		// A farther cone in the same narrow bearing bin is approximately occluded.
		for (const cone of course.cones) {
			const dx = cone.x - pose.x;
			const dz = cone.z - pose.z;
			const distance = Math.hypot(dx, dz);
			const forward = dx * hx + dz * hz;
			if (distance > RANGE || distance < EPSILON || forward <= 0) continue;
			const bearing = Math.atan2(hx * dz - hz * dx, forward);
			if (Math.abs(bearing) > HALF_FOV) continue;
			const bin = Math.floor((bearing + HALF_FOV) / ANGLE_BIN);
			const previous = bins.get(bin);
			if (!previous || distance < previous.distance) bins.set(bin, { cone, distance });
		}
		const visible = [...bins.values()].sort((a, b) => a.distance - b.distance).map(({ cone }) => cone);
		visible.forEach((cone) => knownMap.set(cone.id, cone));
		const known = [...knownMap.values()];

		// Keep map memory, but build a local corridor only from nearby remembered landmarks.
		const nearby = known.filter((cone) => Math.hypot(cone.x - pose.x, cone.z - pose.z) <= RANGE);
		const left = nearby.filter((cone) => cone.side === 'left');
		const right = nearby.filter((cone) => cone.side === 'right');
		const candidates: PairCandidate[] = [];
		for (const l of left) {
			for (const r of right) {
				const dx = r.x - l.x;
				const dz = r.z - l.z;
				const width = Math.hypot(dx, dz);
				if (width < course.width * 0.7 || width > course.width * 1.22) continue;
				candidates.push({
					left: l,
					right: r,
					mid: { x: (l.x + r.x) / 2, z: (l.z + r.z) / 2 },
					width,
					// A left-to-right boundary segment determines a possible travel direction.
					tx: dz / width,
					tz: -dx / width,
				});
			}
		}

		const pairs: ConePair[] = [];
		const trajectory: PlanPoint[] = [{ x: pose.x, z: pose.z }];
		const used = new Set<number>();
		let cursor: PlanPoint = pose;
		let tx = hx;
		let tz = hz;
		let travelled = 0;
		const maxGap = Math.min(7.5, course.width * 1.6);
		while (pairs.length < 12) {
			let best: PairCandidate | undefined;
			let bestScore = Infinity;
			for (const candidate of candidates) {
				if (used.has(candidate.left.id) || used.has(candidate.right.id)) continue;
				const dx = candidate.mid.x - cursor.x;
				const dz = candidate.mid.z - cursor.z;
				const step = Math.hypot(dx, dz);
				if (step < 0.65 || step > maxGap || travelled + step > RANGE) continue;
				const advance = (dx * tx + dz * tz) / step;
				const facing = candidate.tx * tx + candidate.tz * tz;
				const approach = (dx * candidate.tx + dz * candidate.tz) / step;
				// Truncate instead of jumping sideways to the adjacent leg of a hairpin.
				if (advance < 0.35 || facing < 0.3 || approach < 0.2) continue;
				const lateral = Math.abs(tx * dz - tz * dx);
				if (pairs.length === 0 && lateral > course.width * 0.65) continue;
				const widthError = Math.abs(candidate.width - course.width) / course.width;
				const score = step + (1 - advance) * 3 + (1 - facing) * 2 + widthError * 6;
				if (score < bestScore) {
					best = candidate;
					bestScore = score;
				}
			}
			if (!best) break;
			const dx = best.mid.x - cursor.x;
			const dz = best.mid.z - cursor.z;
			const step = Math.hypot(dx, dz);
			travelled += step;
			used.add(best.left.id);
			used.add(best.right.id);
			pairs.push({ left: best.left, right: best.right, mid: { ...best.mid } });
			trajectory.push({ ...best.mid });
			// Follow the evolving local corridor so a real bend can turn away from the initial heading.
			tx = dx / step + best.tx;
			tz = dz / step + best.tz;
			const length = Math.hypot(tx, tz) || 1;
			tx /= length;
			tz /= length;
			cursor = best.mid;
		}

		return { visible, known, pairs, trajectory, range: RANGE, halfFov: HALF_FOV };
	};

	return { observe, reset: () => knownMap.clear() };
}
