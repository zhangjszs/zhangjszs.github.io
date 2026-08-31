// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// ============================================================
	// 站点地址：GitHub Pages 用户页（根路径）
	//   部署地址：https://zhangjszs.github.io/
	//   - 仓库需命名为 zhangjszs.github.io（用户页约定）
	//   - 站内绝对路径经 src/utils/paths.ts 的 withBase() 拼接，
	//     无 base 时自动退化为根路径，组件代码无需改动
	//   - 若切到 Cloudflare Pages / 自有域名：仅改 site
	// ============================================================
	site: 'https://zhangjszs.github.io',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
	},
});
