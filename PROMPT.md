# ResearchFlow PRD

## 项目概述

**Project Name:** ResearchFlow - 科研论文管理助手  
**Version:** 2.0  
**Last Updated:** 2026-02-18

## 项目背景

面向个人研究者的论文工作流应用，覆盖**选题 → 检索 → 管理 → 写作 → 投稿 → 复盘**的核心流程。当前版本为前端本地化实现，重点验证交互闭环，未来将演进为云端化应用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite |
| 路由 | React Router v6 |
| 样式 | Tailwind CSS |
| UI 组件 | Radix UI + shadcn/ui |
| 本地存储 | localStorage + Repository 模式 |
| 后端 | Cloudflare Workers (Hono) |
| 数据库 | Cloudflare D1 |
| 部署平台 | Cloudflare Pages |

## 当前状态 (As-Is)

### 已完成 ✅
- **US-002**: 研究领域选择 - 预设6领域 + 推荐会议
- **US-004**: 论文收藏与管理 - 收藏/标签/笔记/筛选
- **US-013**: 投稿进度追踪 - 状态流转 + 时间线
- **US-015**: 首页仪表盘 - 四块核心汇总

### 部分完成 🔄
- **US-001**: GitHub 登录 - 模拟登录完成，需真实 OAuth + D1
- **US-003**: 论文来源 - arXiv/DBLP 已接入，IEEE/ACM/Scholar 待接入
- **US-006**: 会议截稿 - 本地倒计时，需自动更新
- **US-007**: 任务管理 - CRUD 完成，编辑待优化
- **US-008**: 提醒系统 - UI 完成，通知未接入
- **US-009**: LaTeX 模板 - 列表完成，下载未实现
- **US-010**: 大纲生成 - 模板化完成，自动生成未实现
- **US-011**: 参考文献 - BibTeX 导入导出，DOI解析待完成
- **US-012**: 图表管理 - 元信息完成，文件上传未实现
- **US-014**: 写作进度 - 里程碑完成，自动提醒未实现

### 未开始 ⬜
- **US-005**: 每日论文推荐
- **US-016**: 数据同步 (Cloudflare D1)

## 架构目标 (To-Be)

### 演进路线
```
Phase 1 (当前)     Phase 2 (M2)           Phase 3 (M3)
本地 localStorage → 统一存储服务 + Repository → Cloudflare D1 云端化
```

### 核心架构改进
1. **统一存储服务** - `src/services/storage.ts` 已实现
2. **Repository 层** - 5个核心域已仓储化
3. **Cloudflare D1** - 用户数据持久化 (待实现)
4. **GitHub OAuth** - 真实认证 (待实现)
5. **跨设备同步** - 实时数据同步 (待实现)

### 数据流
```
UI Components → Repository → Storage Service → localStorage
                    ↓
              Cloudflare D1 (未来)
```

## 用户故事详情

详见 `prd.json` - 包含 16 个用户故事的完整验收标准

## 里程碑

| 里程碑 | 状态 | 范围 |
|--------|------|------|
| M1 - 本地单机闭环 | ✅ completed | 登录、论文、任务、会议等核心页面 |
| M2 - 能力补齐 | 🔄 in_progress | 多源检索、统一存储、高价值模块真实交互 |
| M3 - 云端化 | ⬜ planned | OAuth + D1 + 同步 + 通知 |

## 关键风险

1. **数据模型分散** - 存储 key 虽已统一为 `researchflow_*`，但部分模块仍需完善
2. **验收与实现不匹配** - 多故事仅完成 UI，后端能力缺失
3. **高价值能力占位** - 同步、通知、自动化待实现

## 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

默认地址：`http://localhost:5173`

## 相关文档

- 系统流程: `docs/system-flow.md`
- 组件规格: `specs/ui-components.md`
- 数据模型: `specs/data-models.md`
- API 端点: `specs/api-endpoints.md`
