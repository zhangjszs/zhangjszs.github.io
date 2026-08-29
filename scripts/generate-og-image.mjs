/**
 * 生成 1200×630 的莫兰迪色 og-image.png
 *
 * 配色（与 src/styles/global.css 保持一致）：
 *   - 背景渐变：米白 #f5f1ec → 雾绿 #e6e2dc → 旧玫瑰 #c4a4a7
 *   - 主色：雾绿 #5e6e60 / 玫瑰 #c4a4a7
 *   - 文字：炭灰 #3a3d3b
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

// 莫兰迪色（亮色主题，社交分享图通用亮色背景更友好）
const BG_TOP = '#f5f1ec'; // 米白
const BG_MID = '#e6e2dc'; // 浅雾
const BG_BOT = '#d8dbd9'; // 雾绿灰
const ACCENT = '#5e6e60'; // 森林阴影
const ACCENT_2 = '#c4a4a7'; // 旧玫瑰
const TEXT = '#3a3d3b'; // 炭灰
const TEXT_LIGHT = '#6b6e6c'; // 弱化

// 构造 SVG：渐变背景 + 装饰圆 + 站点名 + 副标题 + 角标
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${BG_TOP}"/>
      <stop offset="55%" stop-color="${BG_MID}"/>
      <stop offset="100%" stop-color="${BG_BOT}"/>
    </linearGradient>
    <radialGradient id="blob1" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob2" cx="10%" cy="90%" r="60%">
      <stop offset="0%" stop-color="${ACCENT_2}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${ACCENT_2}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- 背景渐变 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- 装饰雾团 -->
  <rect width="${W}" height="${H}" fill="url(#blob1)"/>
  <rect width="${W}" height="${H}" fill="url(#blob2)"/>

  <!-- 左侧色条（莫兰迪点缀） -->
  <rect x="80" y="200" width="6" height="230" rx="3" fill="${ACCENT}"/>
  <rect x="92" y="200" width="6" height="160" rx="3" fill="${ACCENT_2}"/>

  <!-- 主标题：站点名 -->
  <text x="120" y="270" font-family="Public Sans, system-ui, sans-serif" font-size="78" font-weight="700" fill="${TEXT}">
    Kerwin Zhang
  </text>

  <!-- 副标题（一句话介绍） -->
  <text x="120" y="340" font-family="Public Sans, system-ui, sans-serif" font-size="30" font-weight="400" fill="${TEXT_LIGHT}">
    自动驾驶工程学生 · ROS 2 / C++ / Python
  </text>

  <!-- 装饰小点 -->
  <circle cx="120" cy="430" r="5" fill="${ACCENT}"/>
  <circle cx="142" cy="430" r="5" fill="${ACCENT_2}"/>
  <circle cx="164" cy="430" r="5" fill="${TEXT_LIGHT}"/>

  <!-- 域名（项目页路径 /huat-showcase） -->
  <text x="120" cy="490" font-family="JetBrains Mono, monospace" font-size="22" font-weight="400" fill="${TEXT_LIGHT}">
    zhangjszs.github.io/huat-showcase
  </text>

  <!-- 右下角装饰圆环 -->
  <circle cx="${W - 140}" cy="${H - 140}" r="80" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.3"/>
  <circle cx="${W - 140}" cy="${H - 140}" r="50" fill="none" stroke="${ACCENT_2}" stroke-width="2" opacity="0.4"/>
</svg>`;

const out = resolve(__dirname, '..', 'public', 'og-image.png');
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`✓ Generated: ${out}`);
