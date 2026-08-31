// 友情链接（/links 页渲染；由用户陆续提供）
export interface LinkEntry {
	name: string;
	url: string;
	description?: string;
}

export const LINKS: LinkEntry[] = [];
