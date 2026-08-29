/**
 * 站内路径工具：统一处理部署子路径（base）。
 *
 * GitHub Pages 项目页地址形如 https://<user>.github.io/<repo>/，
 * 所有站内绝对路径（/projects/...）都必须带上 base 前缀才能正确跳转。
 * 如果以后部署到根域名（自定义域名或 <user>.github.io 仓库），
 * 只需删除 astro.config.mjs 里的 base 配置，这里的拼接依然正确（base 为空）。
 */

/** 部署子路径，如 '/huat-showcase'；根域名部署时为 '' */
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 给站内绝对路径拼接 base 前缀，如 withBase('/projects/') → '/huat-showcase/projects/' */
export const withBase = (path: string): string => `${base}${path.startsWith('/') ? path : `/${path}`}`;
