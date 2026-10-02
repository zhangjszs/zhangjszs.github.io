// audit-links.mjs — dist 产物死链审计（纯 Node，零依赖）。
// 用法：先 `npm run build` 生成最新 dist，再 `mise x -- node scripts/audit-links.mjs`。
// 逻辑：递归扫描 dist/**/*.html 的 href/src 属性；以 `/` 开头的站内目标
//（剥掉 #hash 与 ?query 后）必须能在 dist 内解析到真实文件——依次尝试
// 原样、`.html` 后缀、`/index.html` 后缀。另校验 og:image / twitter:image
// meta 的 content：站内路径（/ 开头）或指向本站域名（SITE_HOSTS）的绝对 URL
// 都必须能在 dist 解析到真实文件（防 og 图全站坏链复发）。发现死链 exit 1，
// 否则 exit 0。
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

// 本站生产域名：og:image 经 new URL(site) 生成的是绝对 URL，需剥掉该 origin 再校验。
// 若迁移自定义域名，请同步更新此处。
const SITE_HOSTS = new Set(['zhangjszs.github.io']);

const distDir = resolve(process.cwd(), 'dist');
if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
	console.error(`[audit-links] 未找到构建产物 ${distDir}，请先运行 npm run build`);
	process.exit(2);
}

/** 递归收集目录下所有 .html 文件 */
function walkHtml(dir, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) walkHtml(p, out);
		else if (entry.name.endsWith('.html')) out.push(p);
	}
	return out;
}

/** 提取 HTML 里所有 href/src 属性值（Astro 产物属性值总带引号） */
function extractAttrs(html) {
	const values = [];
	for (const m of html.matchAll(/(?:href|src)="([^"]*)"/g)) values.push(m[1]);
	for (const m of html.matchAll(/(?:href|src)='([^']*)'/g)) values.push(m[1]);
	return values;
}

/** 站内目标判定：以 `/` 开头、非 `//`、非 mailto:/tel:/data:、非纯 `#` 锚点 */
function isInternal(raw) {
	if (!raw.startsWith('/') || raw.startsWith('//')) return false;
	if (/^(mailto|tel|data):/i.test(raw)) return false;
	return true;
}

/**
 * 提取 HTML 里 og:image / twitter:image meta 的 content 值。
 * meta 属性顺序不固定（content 可能在 name/property 之前），
 * 故先整段匹配 <meta ...>，再在标签内逐属性解析。
 */
const META_IMAGE_KEYS = new Set(['og:image', 'twitter:image']);
function extractMetaImageContents(html) {
	const values = [];
	for (const m of html.matchAll(/<meta\s[^>]*>/gi)) {
		const tag = m[0];
		const key = /property=["']([^"']+)["']/i.exec(tag)?.[1] ?? /name=["']([^"']+)["']/i.exec(tag)?.[1];
		if (!key || !META_IMAGE_KEYS.has(key.toLowerCase())) continue;
		const content = /content=["']([^"']*)["']/i.exec(tag)?.[1];
		if (content) values.push(content);
	}
	return values;
}

/** og/twitter meta 图片目标 → 站内路径：/ 开头原样；本站绝对 URL 剥 origin；其余返回 null（外域跳过） */
function metaImageToPath(raw) {
	const value = raw.replace(/&amp;/g, '&');
	if (value.startsWith('/') && !value.startsWith('//')) return value;
	let url;
	try {
		url = new URL(value);
	} catch {
		return null; // 相对路径或非法值不在此审计范围
	}
	if ((url.protocol === 'https:' || url.protocol === 'http:') && SITE_HOSTS.has(url.hostname)) {
		return url.pathname + url.search;
	}
	return null;
}

/** 剥掉 #hash 与 ?query，判断目标能否在 dist 内解析到真实文件 */
function targetExists(rawLink) {
	let p = rawLink.split('#')[0].split('?')[0];
	if (p === '') return true; // 纯 "#hash" 锚点在 isInternal 已排除，防御兜底
	try {
		p = decodeURIComponent(p);
	} catch {
		/* 含非法百分号编码时保留原样 */
	}
	const candidates = p.endsWith('/')
		? [p + 'index.html', p.slice(0, -1) + '.html']
		: [p, p + '.html', p + '/index.html'];
	return candidates.some((c) => {
		const fp = join(distDir, c.replace(/^\/+/, ''));
		return existsSync(fp) && statSync(fp).isFile();
	});
}

const htmlFiles = walkHtml(distDir);
let extracted = 0;
let internalChecked = 0;
let metaImagesChecked = 0;
const deadLinks = [];

for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf8');
	for (const raw of extractAttrs(html)) {
		extracted++;
		if (!isInternal(raw)) continue;
		internalChecked++;
		if (!targetExists(raw)) {
			deadLinks.push({ href: raw, from: relative(distDir, file) });
		}
	}
	for (const raw of extractMetaImageContents(html)) {
		extracted++;
		const path = metaImageToPath(raw);
		if (path === null) continue; // 外域图片不校验
		metaImagesChecked++;
		if (!targetExists(path)) {
			deadLinks.push({ href: `${raw}（og/twitter meta 图）`, from: relative(distDir, file) });
		}
	}
}

if (deadLinks.length > 0) {
	console.log(`[audit-links] 发现 ${deadLinks.length} 条站内死链：`);
	for (const { href, from } of deadLinks) {
		console.log(`  ✗ ${href}    （引用页 dist/${from}）`);
	}
} else {
	console.log('[audit-links] 站内死链为零 ✓');
}
console.log(
	`[audit-links] 统计：扫描页面 ${htmlFiles.length} 个 / 提取引用 ${extracted} 处 / 站内链接 ${internalChecked} 条 / og·twitter meta 图 ${metaImagesChecked} 张 / 死链 ${deadLinks.length} 条`
);
process.exit(deadLinks.length > 0 ? 1 : 0);
