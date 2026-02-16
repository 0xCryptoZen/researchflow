# ResearchFlow 系统流程优化说明

最后更新：2026-02-16

## 1. 当前系统流程（As-Is）

### 1.1 用户流程
1. 登录页本地模拟 GitHub 登录。
2. 进入研究领域页选择方向并保存到用户信息。
3. 在论文搜索页调用 arXiv/DBLP，收藏到论文库。
4. 在论文库维护标签、收藏状态和笔记。
5. 并行使用任务、会议、提醒、写作大纲、投稿模块。
6. 仪表盘汇总各模块本地数据。

### 1.2 数据流程
1. 页面直接读写 localStorage。
2. 各模块使用不同 key（例如 `researchflow_papers`、`researchflow_tasks`、`researchflow_conferences`）。
3. 仪表盘读取 `papers/tasks/conferences/submissions`，与部分页面 key 不一致。
4. `db.ts` 与 `useUserSync.ts` 存在，但尚未被页面主流程调用。

### 1.3 主要问题
1. 模块 key 不统一，导致数据可见性和联动不稳定。
2. PRD 验收项与实际实现不一致（例如 OAuth、多渠道通知、云同步）。
3. 系统流程目前是“前端演示闭环”，还不是“可部署的科研生产系统”。

## 2. 优化后的目标流程（To-Be）

### 2.1 端到端流程
1. 身份层：GitHub OAuth 登录 -> 用户画像初始化（研究方向/目标会议）。
2. 数据层：统一 Repository 层，所有模块通过同一数据接口读写。
3. 检索层：并行聚合 arXiv/DBLP/Scholar/IEEE/ACM -> 标准化去重。
4. 工作流层：论文入库 -> 任务拆解 -> 截稿跟踪 -> 写作大纲 -> 投稿状态。
5. 通知层：基于规则引擎触发提醒（截止前 N 天、里程碑逾期、每日推荐）。
6. 同步层：本地缓存 + 云端 D1 双写，登录用户自动增量同步。

### 2.2 建议的模块边界
1. `auth`：登录、会话、用户配置。
2. `catalog`：论文检索与收藏。
3. `planning`：任务、会议、写作进度。
4. `writing`：大纲、参考文献、图表、模板。
5. `submission`：投稿状态与时间线。
6. `infra`：统一存储、同步、通知。

### 2.3 数据标准化建议
1. 统一 key 命名：全部改为 `researchflow_*`。
2. 引入共享主键：`paperId` 作为任务/参考文献/图表/投稿关联键。
3. 新增统一时间字段：`createdAt`、`updatedAt`、`source`。
4. 提供迁移脚本：兼容旧 key（如 `papers`、`conferences`）到新结构。

## 3. 实施优先级

### P0（先做）
1. 统一 localStorage key 与 Dashboard 读取逻辑。
2. 修正 PRD 状态，建立 completed/partial/not_started 的统一口径。
3. 将 `db.ts` 作为唯一入口，页面不再直接操作 localStorage。

### P1（次做）
1. 补齐 Scholar/IEEE/ACM 检索接入或明确降级策略。
2. 完成提醒触发引擎（本地定时 + 规则计算）。
3. 完成模板下载、参考文献格式化等“按钮占位”能力。

### P2（后做）
1. GitHub OAuth 真接入。
2. Cloudflare D1 + Workers 同步 API。
3. 邮件/飞书/Telegram 消息发送链路。

## 4. 验收口径（统一）
1. `completed`：验收项全部可用并可复现。
2. `partial`：至少 1 项核心验收未完成或仅 UI 占位。
3. `not_started`：无有效实现。
