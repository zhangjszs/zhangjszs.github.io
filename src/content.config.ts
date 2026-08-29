import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const collections = {
	projects: defineCollection({
		loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			/** 作品分类：personal = 个人项目（默认展示在前），labwork = 课程实验（HUAT Labwork） */
			category: z.enum(['personal', 'labwork']).default('labwork'),
			/** 源码仓库完整地址；未填时详情页回退到课程实验仓库 */
			repoUrl: z.string().optional(),
			repoPath: z.string().optional(),
			tags: z.array(z.string()),
			keywords: z.array(z.string()).optional(),
			techStack: z.array(z.string()),
			screenshotsDir: z.string().optional(),
			codeSnippets: z.array(z.string()).optional(),
			demoUrl: z.string().optional(),
			externalDeployUrl: z.string().optional(),
			featured: z.boolean().default(false),
			date: z.string().optional(),
			difficulty: z.enum(['入门', '进阶', '深度']).optional(),
			status: z.enum(['Completed', 'In Progress', 'Archived']).optional().default('Completed'),
			architecture: z.string().optional(),
			challenges: z.array(z.string()).optional(),
			lessons: z.array(z.string()).optional(),
		}),
	}),
	// 博客文章集合（原 deep-dives 升级为通用博客）
	blog: defineCollection({
		loader: glob({ base: './src/content/blog', pattern: '**/*.mdx' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			date: z.string(),
			tags: z.array(z.string()).optional().default([]),
			relatedProject: z.string().optional(),
		}),
	}),
};
