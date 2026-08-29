// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// TODO: 部署后替换为你自己的域名或 GitHub Pages 地址（如 https://<你的用户名>.github.io）
	site: 'https://your-username.github.io',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
	},
});
