// 生成合成激光雷达点云占位数据（真实数据交付前的首屏内容）。
// 输出格式与 convert-pointcloud.mjs 一致：
//   public/assets/pointcloud/hero.bin  —— Uint16(x,y,z 归一化) + Uint8(intensity)，每点 7 字节
//   public/assets/pointcloud/meta.json —— { count, bounds }
// 用法：mise x -- node scripts/gen-synth-pointcloud.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'pointcloud');

const COUNT = 118000;
// 场景包络（米），bounds 同时供运行时居中/缩放使用
const BOUNDS = { x: [-13, 13], y: [-3, 6.5], z: [4, 48] };

const points = []; // [x, y, z, intensity(0..1)]

// 地面：带坡度的路块
for (let i = 0; i < COUNT * 0.3; i++) {
	const x = (Math.random() * 2 - 1) * 13;
	const z = 4 + Math.random() * 44;
	const y = -2.2 + Math.random() * 0.15 + Math.abs(x) * 0.04;
	points.push([x, y, z, 0.12 + Math.random() * 0.18]);
}

// 两侧立面（建筑/护栏，分段留出门洞）
for (const side of [-1, 1]) {
	for (let seg = 0; seg < 6; seg++) {
		const z0 = 6 + seg * 7 + Math.random() * 2;
		if (Math.random() < 0.35) continue; // 门洞
		const n = COUNT * 0.09;
		for (let i = 0; i < n; i++) {
			const x = side * (9.5 + Math.random() * 1.5);
			const y = -2.2 + Math.random() * 7;
			const z = z0 + Math.random() * 5;
			points.push([x, y, z, 0.3 + Math.random() * 0.35]);
		}
	}
}

// 路侧立柱
for (let k = 0; k < 14; k++) {
	const side = k % 2 === 0 ? -1 : 1;
	const x = side * (7 + Math.random());
	const z = 6 + k * 3 + Math.random() * 1.5;
	const n = 260;
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const r = Math.random() * 0.12;
		points.push([x + Math.cos(a) * r, -2.2 + Math.random() * 2.6, z + Math.sin(a) * r, 0.55 + Math.random() * 0.3]);
	}
}

// 远处车辆轮廓（盒面点）
for (let k = 0; k < 4; k++) {
	const cx = (Math.random() * 2 - 1) * 5;
	const cz = 24 + k * 5.5 + Math.random() * 2;
	const w = 1.8;
	const h = 1.4;
	const l = 4.2;
	const n = COUNT * 0.045;
	for (let i = 0; i < n; i++) {
		const face = Math.floor(Math.random() * 5);
		let x = cx + (Math.random() - 0.5) * w;
		let y = -2.2 + Math.random() * h;
		let z = cz + (Math.random() - 0.5) * l;
		if (face === 0) z = cz - l / 2;
		else if (face === 1) z = cz + l / 2;
		else if (face === 2) x = cx - w / 2;
		else if (face === 3) x = cx + w / 2;
		else y = -2.2 + h;
		points.push([x, y, z, 0.45 + Math.random() * 0.25]);
	}
}

// 稀疏空中噪点（灰尘/多径）
for (let i = 0; i < COUNT * 0.02; i++) {
	points.push([
		(Math.random() * 2 - 1) * 12,
		-1 + Math.random() * 6,
		5 + Math.random() * 40,
		0.05 + Math.random() * 0.08,
	]);
}

// 体素抽稀（0.12m 栅格）保留点数到目标值以下
const VOXEL = 0.12;
const seen = new Set();
const culled = [];
for (const p of points) {
	const key = `${Math.round(p[0] / VOXEL)},${Math.round(p[1] / VOXEL)},${Math.round(p[2] / VOXEL)}`;
	if (seen.has(key)) continue;
	seen.add(key);
	culled.push(p);
}
const final = culled.slice(0, COUNT);

// 量化写入
const [xmin, xmax] = BOUNDS.x;
const [ymin, ymax] = BOUNDS.y;
const [zmin, zmax] = BOUNDS.z;
const buf = Buffer.alloc(final.length * 7);
final.forEach((p, i) => {
	const o = i * 7;
	buf.writeUInt16LE(Math.max(0, Math.min(65535, Math.round(((p[0] - xmin) / (xmax - xmin)) * 65535))), o);
	buf.writeUInt16LE(Math.max(0, Math.min(65535, Math.round(((p[1] - ymin) / (ymax - ymin)) * 65535))), o + 2);
	buf.writeUInt16LE(Math.max(0, Math.min(65535, Math.round(((p[2] - zmin) / (zmax - zmin)) * 65535))), o + 4);
	buf.writeUInt8(Math.max(0, Math.min(255, Math.round(p[3] * 255))), o + 6);
});

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'hero.bin'), buf);
writeFileSync(
	join(OUT_DIR, 'meta.json'),
	JSON.stringify(
		{ count: final.length, bounds: { x: BOUNDS.x, y: BOUNDS.y, z: BOUNDS.z }, synthetic: true },
		null,
		'\t'
	)
);
console.log(
	`✓ synthetic point cloud: ${final.length} points, ${(buf.length / 1024 / 1024).toFixed(2)} MB → public/assets/pointcloud/`
);
