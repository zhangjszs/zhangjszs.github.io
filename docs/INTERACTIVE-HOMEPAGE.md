# 交互首页 · 自动驾驶实验场

本次方向由站主明确选择：3D 自动驾驶实验场，可操控场景、雷达扫描与路径规划。首页采用深色与荧光绿；现有项目详情、笔记和简历继续沿用原有版式。

## 结构

- `src/pages/index.astro`：首页导航、介绍、项目、能力和联系入口。
- `src/layouts/LabLayout.astro`：首页视觉 token；复用 MainHead 保留 SEO、RSS 与 sitemap 元信息。
- `src/components/hero/PerceptionScene.astro`：场景、静态降级、模式与播放控件。
- `src/scripts/perception-scene.ts`：按需加载 Three.js，构建赛道、点云、车辆和卫星轨道。
- `src/scripts/fsac-track.ts`：高速循迹、八字环绕、直线加速的原创锥桶几何。
- `src/scripts/fsac-model.ts`：有限视域观测、累计地标与局部锥桶配对轨迹。
- `src/scripts/fsac-world.ts`：场景、感知图层、可通行走廊和跟车视角。
- `src/components/MissionProjects.astro`：从内容集合读取最多四个 `featured` 项目，个人项目优先，再按年份排序；同年优先自动驾驶项目。其他个人项目展示在「更多探索」，课程作品保留在全部作品页。
- `src/scripts/lab-home.ts`：渐进式入场与锚点焦点转移。

## 操作

切换感知、规划、轨道模式；拖动或触摸旋转视角。场景取得键盘焦点后，方向键调整视角，R 重置。滑块调整程序化演示的播放倍速，暂停键停止动画。

感知和规划共享可切换的 FSAC 赛道；感知层提供原始回波、锥桶聚类、累计地图，规划显示已观测地标的局部配对、参考轨迹和走廊。“跟车视角”开关选中时跟随车辆，关闭后全场观察；重放清除累计地图。规则、年份与算法表达边界见 [FSAC-SCENE-RESEARCH.md](FSAC-SCENE-RESEARCH.md)。

所有三维几何与项目图示均为程序化示意，不代表真实传感器扫描或实测结果，未读取 `public/assets/pointcloud/hero.bin`。实际作品资料仍来自项目 MDX。

## 降级与性能

首页文字、作品和链接由 Astro 静态渲染，无需 JavaScript。WebGL 不可用时保留静态 SVG；减少动态效果时保留静态三维和手动模式操作。页面离屏或进入后台时暂停连续渲染，限制像素比与点数，离开页面时释放 GPU 资源。

## 参考

- [Bruno Simon](https://bruno-simon.com/)：交互本身体现工程能力，多种输入方式。
- [Lusion](https://lusion.co/)：用 3D 承担视觉叙事，同时提供直接的作品和联系入口。
- [Dennis Snellenberg](https://www.dennissnellenberg.com/)：鲜明身份、简洁导航与精选项目结构。

实现为原创程序化场景，未复制上述站点的代码或素材。
