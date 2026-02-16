# ResearchFlow

科研论文管理助手（前端原型版），用于打通个人科研流程：论文检索、收藏管理、任务拆解、会议截稿、写作组织、投稿跟踪。

## 技术栈
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

## 快速启动
```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 当前能力范围
- 本地模拟登录（GitHub UI 流程）
- 研究领域选择与推荐会议
- arXiv/DBLP 论文搜索与收藏
- 论文库标签、笔记、收藏管理
- 任务、会议、提醒、写作大纲、参考文献、图表、投稿进度管理
- 仪表盘概览

## 重要说明
- 当前数据持久化基于 `localStorage`。
- `Cloudflare D1`、真实 OAuth、真实通知发送和跨设备同步尚未完成。
- 已在 `prd.json` 标注每个用户故事的真实完成状态。

## 文档
- 产品需求文档：`prd.json`
- 系统流程优化：`docs/system-flow.md`
