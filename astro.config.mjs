// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// ============================================================
	// 站点地址：GitHub Pages 项目页（仓库名 huat-showcase）
	//   部署地址：https://zhangjszs.github.io/huat-showcase/
	//   - 切换到 GitHub 用户页（仓库名 <user>.github.io，根路径）：
	//       1) 在 GitHub 新建 zhangjszs/zhangjszs.github.io 仓库并 push
	//       2) 把下面 base 改为 ''（删掉这一行）
	//   - 切换到 Cloudflare Pages / 自有域名：改 site 为你的域名，base 留空
	// 站内绝对路径（/projects/... 等）都通过 src/utils/paths.ts 的 withBase()
	// 自动拼接 base 前缀，所以切换部署方式时无需改组件代码。
	// ============================================================
	site: 'https://zhangjszs.github.io',
	base: '/huat-showcase',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
	},
});
