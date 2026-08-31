/**
 * 生成 1200×630 的暗色技术风 og-image.png
 *
 * 配色（与 src/styles/global.css 保持一致）：
 *   - 背景：石墨黑 #0b0d10 + 激光绿 #3fe0a1 辉光
 *   - 点云点阵呼应首页签名交互
 *
 * 用法：node scripts/generate-og-image.mjs
 * 输出：public/og-image.png
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const W = 1200;
const H = 630;

const BG = '#0b0d10'; // 石墨黑
const SURFACE = '#12161c';
const ACCENT = '#3fe0a1'; // 激光绿
const TEXT = '#e6e9ef'; // 雾白
const TEXT_DIM = '#98a2b3'; // 弱化

// 确定性伪随机：同一份脚本永远生成同一张图
let seed = 20260831;
const rand = () => {
	seed = (seed * 1664525 + 1013904223) % 4294967296;
	return seed / 4294967296;
};

// 点云装饰：右下区域一片透视感的散点（模拟街道扫描）
const points = [];
for (let i = 0; i < 420; i++) {
	const x = 560 + rand() * 620;
	const depth = rand(); // 0 远 → 1 近
	const y = 180 + depth * 420 + (rand() - 0.5) * 60;
	const r = 1 + depth * 2.2;
	const op = 0.12 + depth * 0.55;
	points.push(
		`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${ACCENT}" opacity="${op.toFixed(2)}"/>`
	);
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow1" cx="75%" cy="35%" r="55%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="95%" r="45%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 底色与辉光 -->
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <!-- 点云装饰 -->
  ${points.join('\n  ')}

  <!-- 终端提示行 -->
  <text x="80" y="180" font-family="JetBrains Mono, Consolas, monospace" font-size="24" fill="${ACCENT}">
    ~/fsac $ ros2 topic echo /points
  </text>

  <!-- 主标题 -->
  <text x="80" y="285" font-family="system-ui, sans-serif" font-size="88" font-weight="700" fill="${TEXT}">
    Kerwin Zhang
  </text>

  <!-- 副标题 -->
  <text x="80" y="352" font-family="system-ui, sans-serif" font-size="30" font-weight="400" fill="${TEXT_DIM}">
    自动驾驶工程学生 · ROS 2 / LiDAR / 路径规划
  </text>

  <!-- 域名 -->
  <text x="80" y="545" font-family="JetBrains Mono, Consolas, monospace" font-size="24" fill="${TEXT_DIM}">
    zhangjszs.github.io
  </text>
  <rect x="80" y="565" width="96" height="3" rx="1.5" fill="${ACCENT}"/>
</svg>`;

const out = resolve(__dirname, '..', 'public', 'og-image.png');
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`✓ Generated: ${out}`);
