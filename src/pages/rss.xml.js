import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { withBase } from '../utils/paths';

// 站点元数据（与 MainHead.astro / astro.config.mjs 保持一致）
const SITE_TITLE = 'Kerwin Zhang';
const SITE_DESC = '自动驾驶工程学生 · 项目作品、技术笔记与联系方式。';
// 兜底 URL（与 astro.config.mjs 的 site 一致；context.site 优先）
// 当前部署在 GitHub Pages 用户页（根路径）
const SITE_URL = 'https://zhangjszs.github.io';

export async function GET(context) {
	const site = context.site ?? new URL(SITE_URL);
	// 从 blog 集合取文章，按日期倒序
	const posts = (await getCollection('blog'))
		.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
		.filter((p) => !!p.data.date);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESC,
		site,
		// 列表项
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: new Date(post.data.date),
			// /blog/<id>/ 的完整 URL（带 base 前缀，兼容子路径部署）
			link: new URL(withBase(`/blog/${post.id}/`), site).toString(),
			categories: post.data.tags ?? [],
		})),
		// 站点级元数据
		customData: `<language>zh-CN</language>`,
		trailingSlash: true,
	});
}
