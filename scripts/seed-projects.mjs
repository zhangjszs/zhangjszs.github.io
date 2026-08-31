// 从用户的 GitHub 公开仓库自动起草项目条目（MDX），作为首页/作品页的种子内容。
// 用法：mise x -- node scripts/seed-projects.mjs [repoName ...]
//   不带参数时使用默认首批清单；同名文件已存在则跳过，绝不覆盖人工内容。
import { existsSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src', 'content', 'projects');
const OWNER = 'zhangjszs';

const DEFAULT_REPOS = ['LIDAR_YE', 'SatelliteOverpass', 'weibo-sentiment-analysis', 'The-Gold-Miner'];
const repos = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_REPOS;

/** gh api 的薄封装：失败返回 null（脚本整体继续跑） */
function ghApi(path) {
	try {
		return JSON.parse(execSync(`gh api ${path}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }));
	} catch {
		return null;
	}
}

const mdString = (s) => JSON.stringify(s ?? '');

for (const name of repos) {
	const out = join(OUT_DIR, `${name.toLowerCase()}.mdx`);
	if (existsSync(out)) {
		console.log(`· 跳过 ${name}（文件已存在，不覆盖人工内容）`);
		continue;
	}

	const repo = ghApi(`repos/${OWNER}/${name}`);
	if (!repo) {
		console.warn(`× ${name}: gh api 读取失败，跳过`);
		continue;
	}

	const languages = ghApi(`repos/${OWNER}/${name}/languages`) ?? {};
	const techStack = Object.keys(languages).slice(0, 4);
	const tags = (repo.topics ?? []).slice(0, 6);
	if (tags.length === 0) tags.push('待补充');
	const date = (repo.pushed_at ?? '').slice(0, 7);
	const description = repo.description || '（项目简介待补充）';

	const frontmatter = `---
title: ${mdString(repo.name)}
description: ${mdString(description)}
category: personal
repoUrl: ${mdString(repo.html_url)}
tags: ${JSON.stringify(tags)}
techStack: ${JSON.stringify(techStack)}
featured: false
date: ${mdString(date)}
status: Completed
---
`;

	const body = `
> **TODO**：这是从 GitHub 仓库自动起草的草稿，请替换为正式内容后删除本提示。

## 项目背景

（项目要解决的问题、在车队/课程中的定位）

## 技术方案

（架构、关键算法与实现要点，可配架构图）

## 成果与数据

（量化结果：性能、精度、耗时等）
`;

	writeFileSync(out, frontmatter + body);
	console.log(`✓ 起草 ${name} → src/content/projects/${name.toLowerCase()}.mdx`);
}
console.log('完成。请逐个校订草稿后再标记 featured。');
