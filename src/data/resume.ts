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
	title: { zh: '自动驾驶工程实践 · ROS 2 / LiDAR 方向', en: 'Autonomous Driving Engineering · ROS 2 / LiDAR' },
	contact: {
		email: 'zhangjszs@foxmail.com',
		github: 'https://github.com/zhangjszs',
		website: 'https://zhangjszs.github.io',
	},
	summary: {
		zh: '具有计算机科学与技术背景，参与过湖北汽车工业学院 FSAC 无人赛车相关项目，关注激光雷达感知、路径规划与 ROS / ROS 2 工程化。通过公开源码和可复现的仿真实验展示工程实践，也持续开发交互式物理仿真与数据分析项目。',
		en: 'With a background in Computer Science and Technology and FSAC project experience at Hubei University of Automotive Technology, I focus on LiDAR perception, path planning and ROS / ROS 2 engineering. My work includes public-source projects, reproducible simulations, interactive physics visualization and data analysis.',
	},
	education: [
		{
			title: { zh: '本科 · 计算机科学与技术', en: 'B.Eng. · Computer Science and Technology' },
			org: { zh: '湖北汽车工业学院', en: 'Hubei University of Automotive Technology' },
			period: { zh: '2022.09 入学', en: 'Entered Sep 2022' },
			bullets: [
				{
					zh: '核心课程:数据结构、算法设计与分析、操作系统、计算机网络、编译原理、数据库系统',
					en: 'Core coursework: Data Structures, Algorithm Design & Analysis, Operating Systems, Computer Networks, Compiler Principles, Database Systems',
				},
				{
					zh: '项目驱动:完成 8 门课程设计与多个个人项目,覆盖前后端、移动端、嵌入式与自动驾驶方向',
					en: 'Project-driven: completed 8 course designs and multiple personal projects spanning full-stack, mobile, embedded systems, and autonomous driving',
				},
			],
		},
	],
	experience: [
		{
			title: { zh: '感知与规划工程实践', en: 'Perception & Planning Engineering' },
			org: { zh: 'FSAC 车队 · HUAT', en: 'FSAC Team · HUAT' },
			period: { zh: 'FSAC 项目经历', en: 'FSAC Project Experience' },
			bullets: [
				{
					zh: '参与激光雷达点云地面分割与锥桶检测，使用 RANSAC 与区域建模方法。',
					en: 'Worked on LiDAR ground segmentation and cone detection using RANSAC and region modeling.',
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
				{
					zh: 'C++20 实现 SGP4/SDP4 轨道传播模型,输出卫星过境时间窗口与仰角/方位角',
					en: 'Implemented SGP4/SDP4 orbit propagation in C++20, outputting pass time windows with elevation and azimuth',
				},
				{
					zh: '实现坐标转换链路(地心惯性系 ↔ 地固系 ↔ 站地平坐标系)，配有 Google Test 测试',
					en: 'Implemented the coordinate transformation chain (ECI ↔ ECEF ↔ NEU) with Google Test tests',
				},
			],
		},
		{
			title: {
				zh: '自动驾驶感知、规划、控制模块化框架',
				en: 'Modular Autonomous Driving Framework (Perception / Planning / Control)',
			},
			org: { zh: 'FSAC 车队', en: 'FSAC Team' },
			period: { zh: 'ROS 1 / ROS 2 工程实践', en: 'ROS 1 / ROS 2 Engineering' },
			bullets: [
				{
					zh: '激光雷达点云地面分割与锥桶检测，使用 RANSAC 与区域建模方法',
					en: 'LiDAR ground segmentation and cone detection using RANSAC and region modeling',
				},
				{
					zh: '搭建感知到规控的端到端工程链路,rosbag 可复现实验',
					en: 'Built end-to-end perception-to-planning pipeline with reproducible rosbag experiments',
				},
			],
		},
	],
	skills: {
		zh: ['ROS 2', 'LiDAR 点云处理', '路径规划', 'C++', 'Python', 'PyTorch', 'CUDA', 'Git / CI'],
		en: ['ROS 2', 'LiDAR Point Cloud', 'Path Planning', 'C++', 'Python', 'PyTorch', 'CUDA', 'Git / CI'],
	},
};
