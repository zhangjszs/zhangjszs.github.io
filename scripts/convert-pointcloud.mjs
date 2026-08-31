// 真实激光雷达数据 → 网页用压缩二进制点云。
// 用法：mise x -- node scripts/convert-pointcloud.mjs <输入文件> [--max <点数>]
// 支持：.pcd（ASCII/binary/binary_compressed 部分）、.ply（ASCII/binary）、.bin（Velodyne 16 字节 xyzif）
// 输出（与合成管线共用格式）：
//   public/assets/pointcloud/hero.bin  —— 每点 7 字节：Uint16 x/y/z（归一化到包围盒）+ Uint8 intensity
//   public/assets/pointcloud/meta.json —— { count, bounds, synthetic: false }
// 若未提供强度通道（如纯 xyz 的 .ply），用距离反推伪强度，保证渲染观感一致。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'pointcloud');

const args = process.argv.slice(2);
if (args.length === 0) {
	console.error('用法: node scripts/convert-pointcloud.mjs <input.(pcd|ply|bin)> [--max 250000]');
	process.exit(1);
}
const input = args[0];
const maxIdx = args.indexOf('--max');
const MAX_POINTS = maxIdx >= 0 ? Number(args[maxIdx + 1]) : 250000;

const bytes = readFileSync(input);
const ext = extname(input).toLowerCase();
/** @type {Array<[number, number, number, number]>} xyz + intensity(0..1) */
let pts = [];

function parsePCD(buf) {
	const head = buf.subarray(0, 2048).toString('latin1');
	const headerEnd = buf.indexOf('DATA');
	const headerText = buf.subarray(0, headerEnd).toString('latin1');
	const fields = {};
	for (const line of headerText.split('\n')) {
		const m = line.match(/^(\w+)\s+(.+)$/);
		if (m) fields[m[1].toUpperCase()] = m[2].trim().split(/\s+/);
	}
	const FIELDS = fields.FIELDS ?? [];
	const SIZE = (fields.SIZE ?? []).map(Number);
	const TYPE = fields.TYPE ?? [];
	const COUNT = (fields.COUNT ?? []).map(Number).fill(1);
	const POINTS = Number((fields.POINTS ?? ['0'])[0]);
	const WIDTH = Number((fields.WIDTH ?? ['0'])[0]);
	const dataMode = head
		.slice(headerEnd, headerEnd + 64)
		.split('\n')[0]
		.replace(/^DATA\s+/i, '')
		.trim()
		.toLowerCase();
	const fieldOffsets = [];
	let stride = 0;
	for (let i = 0; i < FIELDS.length; i++) {
		fieldOffsets.push({ name: FIELDS[i].toLowerCase(), offset: stride, size: SIZE[i] ?? 4, type: TYPE[i] ?? 'F' });
		stride += (SIZE[i] ?? 4) * (COUNT[i] ?? 1);
	}
	const n = POINTS || WIDTH;
	const data = buf.subarray(
		headerEnd + 64 > buf.length ? headerEnd : headerEnd + buf.subarray(headerEnd).toString('latin1').indexOf('\n') + 1
	);
	const out = [];
	if (dataMode === 'ascii') {
		const text = data.toString('latin1');
		for (const row of text.split('\n')) {
			const v = row.trim().split(/\s+/).map(Number);
			if (v.length < 3 || Number.isNaN(v[0])) continue;
			const i = fieldOffsets.findIndex((f) => f.name === 'intensity');
			out.push([v[0], v[1], v[2], i >= 0 ? v[i] : -1]);
		}
	} else {
		const dv = new DataView(buf.buffer, buf.byteOffset + data.byteOffset, data.byteLength);
		for (let p = 0; p < n; p++) {
			const base = p * stride;
			let x = NaN;
			let y = NaN;
			let z = NaN;
			let inten = -1;
			for (const f of fieldOffsets) {
				const o = base + f.offset;
				let v = 0;
				if (f.type === 'F') v = f.size === 4 ? dv.getFloat32(o, true) : dv.getFloat64(o, true);
				else if (f.type === 'U') v = f.size === 4 ? dv.getUint32(o, true) : dv.getUint16(o, true);
				else if (f.type === 'I') v = f.size === 4 ? dv.getInt32(o, true) : dv.getInt16(o, true);
				if (f.name === 'x') x = v;
				else if (f.name === 'y') y = v;
				else if (f.name === 'z') z = v;
				else if (f.name === 'intensity') inten = f.size === 4 && f.type === 'F' ? v : v / 255;
			}
			if (Number.isNaN(x)) continue;
			out.push([x, y, z, inten]);
		}
	}
	return out;
}

function parsePLY(buf) {
	const headerEndStr = buf.toString('latin1', 0, 4096);
	const endTag = 'end_header';
	const headerLen = headerEndStr.indexOf(endTag) + endTag.length + 1;
	const header = headerEndStr.slice(0, headerLen);
	const props = [];
	let vertexCount = 0;
	let binary = false;
	for (const line of header.split('\n')) {
		const t = line.trim();
		if (t.startsWith('element vertex')) vertexCount = Number(t.split(/\s+/)[2]);
		else if (t.startsWith('format')) binary = !t.includes('ascii');
		else if (t.startsWith('property')) {
			const [, type, name] = t.split(/\s+/);
			props.push({ name, type });
		}
	}
	const sizeMap = { char: 1, uchar: 1, short: 2, ushort: 2, int: 4, uint: 4, float: 4, double: 8 };
	const stride = props.reduce((s, p) => s + sizeMap[p.type], 0);
	const dv = new DataView(buf.buffer, buf.byteOffset + headerLen);
	const out = [];
	if (!binary) {
		const text = buf.toString('latin1', headerLen);
		const lines = text.split('\n');
		for (let i = 0; i < vertexCount && i < lines.length; i++) {
			const v = lines[i].trim().split(/\s+/).map(Number);
			const idx = (n) => props.findIndex((p) => p.name === n);
			out.push([v[idx('x')], v[idx('y')], v[idx('z')], idx('intensity') >= 0 ? v[idx('intensity')] : -1]);
		}
		return out;
	}
	for (let p = 0; p < vertexCount; p++) {
		let o = p * stride;
		const vals = {};
		for (const prop of props) {
			const s = sizeMap[prop.type];
			if (prop.type === 'float') vals[prop.name] = dv.getFloat32(o, true);
			else if (prop.type === 'double') vals[prop.name] = dv.getFloat64(o, true);
			else if (prop.type === 'uchar') vals[prop.name] = dv.getUint8(o);
			else if (prop.type === 'char') vals[prop.name] = dv.getInt8(o);
			else if (prop.type === 'ushort') vals[prop.name] = dv.getUint16(o, true);
			else if (prop.type === 'short') vals[prop.name] = dv.getInt16(o, true);
			else if (prop.type === 'uint') vals[prop.name] = dv.getUint32(o, true);
			else vals[prop.name] = dv.getInt32(o, true);
			o += s;
		}
		out.push([vals.x, vals.y, vals.z, 'intensity' in vals ? vals.intensity : -1]);
	}
	return out;
}

function parseVelodyne(bin) {
	const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength - (bin.byteLength % 20));
	const out = [];
	for (let o = 0; o + 20 <= dv.byteLength; o += 20) {
		const x = dv.getFloat32(o, true);
		const y = dv.getFloat32(o + 4, true);
		const z = dv.getFloat32(o + 8, true);
		const inten = dv.getFloat32(o + 16, true);
		if (Number.isNaN(x)) continue;
		out.push([x, y, z, inten]);
	}
	return out;
}

if (ext === '.pcd') pts = parsePCD(bytes);
else if (ext === '.ply') pts = parsePLY(bytes);
else if (ext === '.bin') pts = parseVelodyne(bytes);
else {
	console.error(`不支持的格式: ${ext}（支持 .pcd / .ply / .bin）`);
	process.exit(1);
}
pts = pts.filter((p) => p.every((v) => Number.isFinite(v)));
if (pts.length === 0) {
	console.error('未解析出任何点，请检查文件格式');
	process.exit(1);
}
console.log(`解析到 ${pts.length} 个点`);

// 包围盒（剔除 1% 离群点后的范围）
const sorted = (axis) => pts.map((p) => p[axis]).sort((a, b) => a - b);
const bounds = {};
['x', 'y', 'z'].forEach((ax, i) => {
	const s = sorted(i);
	bounds[ax] = [s[Math.floor(s.length * 0.005)], s[Math.floor(s.length * 0.995)]];
});
pts = pts.filter((p) => [0, 1, 2].every((i) => p[i] >= bounds['xyz'[i]][0] && p[i] <= bounds['xyz'[i]][1]));

// 体素抽稀到目标点数以下
let voxel = 0.05;
let culled = pts;
while (culled.length > MAX_POINTS && voxel < 2) {
	const seen = new Set();
	culled = [];
	for (const p of pts) {
		const key = `${Math.round(p[0] / voxel)},${Math.round(p[1] / voxel)},${Math.round(p[2] / voxel)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		culled.push(p);
	}
	voxel *= 1.4;
}

// 强度归一化；缺失时用到原点距离反推
const intens = culled.map((p) => p[3]);
const valid = intens.filter((v) => v >= 0 && Number.isFinite(v));
let imin = 0;
let imax = 1;
if (valid.length > culled.length * 0.5) {
	const s = [...valid].sort((a, b) => a - b);
	imin = s[Math.floor(s.length * 0.02)];
	imax = s[Math.floor(s.length * 0.98)];
}
const hasIntensity = valid.length > culled.length * 0.5;

const buf = Buffer.alloc(culled.length * 7);
culled.forEach((p, i) => {
	const o = i * 7;
	const norm = (v, [lo, hi]) => Math.max(0, Math.min(65535, Math.round(((v - lo) / (hi - lo)) * 65535)));
	buf.writeUInt16LE(norm(p[0], bounds.x), o);
	buf.writeUInt16LE(norm(p[1], bounds.y), o + 2);
	buf.writeUInt16LE(norm(p[2], bounds.z), o + 4);
	let inten;
	if (hasIntensity) inten = Math.max(0, Math.min(1, (p[3] - imin) / (imax - imin || 1)));
	else {
		const d = Math.hypot(p[0], p[1], p[2]);
		inten = Math.max(0, Math.min(1, 1 - d / 60));
	}
	buf.writeUInt8(Math.round(inten * 255), o + 6);
});

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'hero.bin'), buf);
writeFileSync(
	join(OUT_DIR, 'meta.json'),
	JSON.stringify({ count: culled.length, bounds, synthetic: false, source: input }, null, '\t')
);
console.log(`✓ ${culled.length} 点 → public/assets/pointcloud/hero.bin (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
