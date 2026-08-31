// 站点更新时间线（渲染在关于页；条目手动追加，保持倒序）
export interface UpdateEntry {
	date: string;
	title: string;
	type: 'design' | 'content' | 'feature' | 'fix';
}

export const UPDATES: UpdateEntry[] = [
	{ date: '2026-08-31', title: '全站重设计：暗色技术风、真实点云首页、滚动叙事', type: 'design' },
	{ date: '2026-08-31', title: '字体自托管（Inter / Cal Sans / JetBrains Mono），国内访问提速', type: 'fix' },
];

export const UPDATE_TYPE_LABEL: Record<UpdateEntry['type'], string> = {
	design: '设计',
	content: '内容',
	feature: '功能',
	fix: '修复',
};
