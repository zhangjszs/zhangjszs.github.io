// 站点级常量。任何页面/组件需要拼接站名、默认描述、默认 author 时都从这里 import。
// 修改这里即同步全站（Nav / Footer / MainHead / 详情页标题等）。
export const SITE_NAME = 'Kerwin Zhang';
export const SITE_ROLE = '自动驾驶 · 感知与规划';
export const SITE_DESCRIPTION =
	'湖北汽车工业学院 · FSAC 车队成员，专注 ROS 2、激光雷达感知与路径规划。本站收录项目作品、技术笔记与联系方式。';
export const SITE_AUTHOR = 'Kerwin Zhang';
export const SITE_LOCALE = 'zh_CN';

/**
 * 联系方式单一事实源（Nav / Footer / 首页 / 关于页都从这里取）。
 * href 缺省即代表「用户尚未提供」——页面会渲染为「待补充」而不是编造内容。
 */
export interface ContactChannel {
	label: string;
	/** 展示用的值（邮箱地址、账号等） */
	value: string;
	/** 可点击地址；未提供时省略，页面标注「待补充」 */
	href?: string;
}

export const CONTACT: ContactChannel[] = [
	{ label: 'Email', value: 'zhangjszs@foxmail.com', href: 'mailto:zhangjszs@foxmail.com' },
	{ label: 'GitHub', value: 'github.com/zhangjszs', href: 'https://github.com/zhangjszs' },
	{ label: 'CSDN', value: 'blog.csdn.net/zcw_jszs', href: 'https://blog.csdn.net/zcw_jszs' },
	{ label: '博客园', value: 'cnblogs.com/jszs0013', href: 'https://www.cnblogs.com/jszs0013/' },
	{ label: '微信', value: '待补充' },
	{ label: '常驻城市', value: '待补充' },
];
