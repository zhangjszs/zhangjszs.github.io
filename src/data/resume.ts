// 简历内容（中英双语）。/resume 页面渲染此数据 + 提供双语 PDF 下载。
// 用户提供 LaTeX/PDF 原料后，把此处骨架替换为真实内容（搜索 TODO-RESUME 定位）。
export interface Bilingual {
	zh: string;
	en: string;
}

export interface ResumeEntry {
	title: Bilingual;
	org: Bilingual;
	period: Bilingual;
	bullets: Bilingual[];
}

export const RESUME = {
	// TODO-RESUME: 中文姓名与头衔
	name: 'Kerwin Zhang',
	title: { zh: '自动驾驶工程学生 · ROS 2 / LiDAR 方向', en: 'Autonomous Driving Engineering Student · ROS 2 / LiDAR' },
	contact: {
		email: 'zhangjszs@foxmail.com',
		github: 'https://github.com/zhangjszs',
		website: 'https://zhangjszs.github.io',
	},
	summary: {
		zh: '湖北汽车工业学院本科生，FSAC（中国大学生方程式）车队成员，专注激光雷达感知、路径规划与 ROS 2 工程化，具备从仿真到实车闭环的完整项目经验。',
		en: 'Undergraduate at Hubei University of Automotive Technology and member of the FSAC team, focused on LiDAR perception, path planning and ROS 2 engineering, with full project experience from simulation to on-vehicle closed-loop validation.',
	},
	education: [
		{
			// TODO-RESUME: 专业、入学年份、GPA 与核心课程
			title: { zh: '本科 · 专业待补充', en: 'B.Eng. · Major TBD' },
			org: { zh: '湖北汽车工业学院', en: 'Hubei University of Automotive Technology' },
			period: { zh: '2022.09 – 至今', en: '2022.09 – Present' },
			bullets: [],
		},
	],
	experience: [
		{
			title: { zh: '感知与规划方向核心成员', en: 'Core Member, Perception & Planning' },
			org: { zh: 'FSAC 车队 · HUAT', en: 'FSAC Team · HUAT' },
			period: { zh: '至今', en: 'Present' },
			bullets: [
				{
					zh: '负责激光雷达点云的地面分割与锥桶检测（RANSAC + 区域建模），满足实时性要求。',
					en: 'Implemented LiDAR ground segmentation and cone detection (RANSAC + region modeling) under real-time constraints.',
				},
				{
					zh: '搭建感知到规控的工程链路，使用 rosbag 做可复现实验。',
					en: 'Built the perception-to-planning pipeline with reproducible rosbag-based experiments.',
				},
			],
		},
	],
	projects: [] as ResumeEntry[], // TODO-RESUME: 从精选项目里挑 2-3 个填入
	skills: {
		zh: ['ROS 2', 'LiDAR 点云处理', '路径规划', 'C++', 'Python', 'PyTorch', 'CUDA', 'Git / CI'],
		en: ['ROS 2', 'LiDAR Point Cloud', 'Path Planning', 'C++', 'Python', 'PyTorch', 'CUDA', 'Git / CI'],
	},
};
