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
			title: { zh: '本科 · 计算机科学与技术', en: 'B.Eng. · Computer Science and Technology' },
			org: { zh: '湖北汽车工业学院', en: 'Hubei University of Automotive Technology' },
			period: { zh: '2022.09 – 至今', en: '2022.09 – Present' },
			bullets: [
				{ zh: '核心课程:数据结构、算法设计与分析、操作系统、计算机网络、编译原理、数据库系统', en: 'Core coursework: Data Structures, Algorithm Design & Analysis, Operating Systems, Computer Networks, Compiler Principles, Database Systems' },
				{ zh: '项目驱动:完成 8 门课程设计与多个个人项目,覆盖前后端、移动端、嵌入式与自动驾驶方向', en: 'Project-driven: completed 8 course designs and multiple personal projects spanning full-stack, mobile, embedded systems, and autonomous driving' },
			],
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
	projects: [
		{
			title: { zh: '卫星过境预报与可见性计算工具', en: 'Satellite Pass Prediction & Visibility Analysis' },
			org: { zh: '个人项目 · MIT 开源', en: 'Personal Project · MIT Open Source' },
			period: { zh: '2026.02', en: '2026.02' },
			bullets: [
				{ zh: 'C++20 实现 SGP4/SDP4 轨道传播模型,输出卫星过境时间窗口与仰角/方位角', en: 'Implemented SGP4/SDP4 orbit propagation in C++20, outputting pass time windows with elevation and azimuth' },
				{ zh: '高精度坐标转换链路(地心惯性系 ↔ 地固系 ↔ 站地平坐标系),Google Test 全覆盖', en: 'High-precision coordinate transformation chain (ECI ↔ ECEF ↔ NEU) with full Google Test coverage' },
			],
		},
		{
			title: { zh: '自动驾驶感知、规划、控制模块化框架', en: 'Modular Autonomous Driving Framework (Perception / Planning / Control)' },
			org: { zh: 'FSAC 车队', en: 'FSAC Team' },
			period: { zh: '至今', en: 'Present' },
			bullets: [
				{ zh: '激光雷达点云地面分割与锥桶检测(RANSAC + 区域建模),满足实时性要求', en: 'LiDAR ground segmentation and cone detection (RANSAC + region modeling) under real-time constraints' },
				{ zh: '搭建感知到规控的端到端工程链路,rosbag 可复现实验', en: 'Built end-to-end perception-to-planning pipeline with reproducible rosbag experiments' },
			],
		},
	],
	skills: {
		zh: ['ROS 2', 'LiDAR 点云处理', '路径规划', 'C++', 'Python', 'PyTorch', 'CUDA', 'Git / CI'],
		en: ['ROS 2', 'LiDAR Point Cloud', 'Path Planning', 'C++', 'Python', 'PyTorch', 'CUDA', 'Git / CI'],
	},
};
