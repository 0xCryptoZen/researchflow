# UI 组件规格

## 概述

本文档定义 ResearchFlow 的 UI 组件规格，基于 shadcn/ui 和 Radix UI 构建。

---

## 布局组件

### 1. AppLayout

应用主布局，包含侧边栏、顶部导航和内容区域。

**属性:**
```typescript
interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}
```

**结构:**
```
┌─────────────────────────────────────────┐
│ Header (64px)                          │
├────────┬────────────────────────────────┤
│        │                                │
│ Side   │     Main Content               │
│ bar    │     (flex-1)                   │
│ (240px)│                                │
│        │                                │
└────────┴────────────────────────────────┘
```

### 2. Sidebar

左侧导航栏，包含 Logo、导航菜单和用户信息。

**导航项:**
- 首页仪表盘 (Dashboard)
- 论文检索 (Search)
- 我的论文库 (MyPapers)
- 任务管理 (Tasks)
- 会议追踪 (Conferences)
- 投稿进度 (Submissions)
- 写作进度 (Writing)
- 参考文献 (References)
- 图表库 (Charts)
- 模板库 (Templates)
- 提醒设置 (Reminders)
- 系统设置 (Settings)

---

## 通用组件

### 3. Button

按钮组件，支持多种变体和尺寸。

**变体:**
- `default` - 主要按钮 (蓝色背景)
- `destructive` - 危险操作 (红色)
- `outline` - 边框样式
- `secondary` - 次要按钮
- `ghost` - 幽灵按钮
- `link` - 链接样式

**尺寸:**
- `sm` - 32px 高度
- `default` - 36px 高度
- `lg` - 44px 高度
- `icon` - 32x32px (仅图标)

### 4. Input

输入框组件。

**属性:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}
```

### 5. Card

卡片组件，用于展示内容块。

**变体:**
- `default` - 默认卡片
- `bordered` - 边框样式
- `elevated` - 悬浮阴影

### 6. Badge

标签/徽章组件。

**变体:**
- `default` - 默认
- `secondary` - 次要
- `success` - 成功 (绿色)
- `warning` - 警告 (黄色)
- `danger` - 危险 (红色)

### 7. Dialog

对话框组件，用于模态弹窗。

### 8. Select

下拉选择器，支持单选和多选。

### 9. Tabs

标签页组件，用于内容切换。

### 10. Avatar

头像组件，支持图片和初始化。

---

## 业务组件

### 11. PaperCard

论文卡片，展示论文基本信息。

**展示信息:**
- 标题 (标题字体，高亮)
- 作者列表 (首行，灰色)
- 来源图标 (arXiv/DBLP/IEEE/ACM/Scholar)
- 发表日期
- 收藏按钮 (星标)
- 标签 (可选显示)

**交互:**
- 点击跳转详情
- 点击星标收藏/取消收藏

### 12. PaperDetail

论文详情页，展示完整论文信息。

**展示信息:**
- 标题
- 作者列表 (可点击)
- 摘要 (可展开/收起)
- 来源与链接
- 标签管理 (添加/删除)
- 笔记编辑
- 相关任务/投稿

### 13. TaskCard

任务卡片，展示任务信息。

**展示信息:**
- 标题
- 状态标签 (待办/进行中/完成)
- 优先级 (高/中/低，颜色区分)
- 截止日期 (倒计时显示)
- 关联论文/会议 (可选)

**交互:**
- 点击编辑
- 状态切换
- 删除

### 14. ConferenceCard

会议卡片，展示会议信息。

**展示信息:**
- 会议名称 + 缩写
- 截稿日期 (倒计时)
- 通知日期
- 会议日期
- 领域标签

### 15. SubmissionTimeline

投稿时间线，展示投稿进度。

**展示信息:**
- 状态节点 (投稿 → 审稿 → 接收/拒绝 → 发表)
- 时间点
- 事件描述

### 16. Countdown

倒计时组件，显示剩余天数/时间。

**格式:**
- `N days` (> 7 天)
- `N weeks` (> 30 天)
- `Expired` (已过期)

### 17. SyncStatus

同步状态指示器。

**状态:**
- 已同步 (绿色勾选)
- 同步中 (蓝色加载)
- 未同步 (黄色警告)
- 离线 (灰色)

### 18. SearchBar

搜索栏组件，支持多数据源切换。

**属性:**
```typescript
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, source?: string) => void;
  sources?: Array<{ id: string; name: string; icon: string }>;
}
```

### 19. TagInput

标签输入组件，支持添加/删除标签。

### 20. MarkdownEditor

Markdown 编辑器，用于大纲/笔记编辑。

**功能:**
- 实时预览
- 工具栏 (标题/粗体/斜体/列表/代码)
- 自动保存

### 21. Timeline

时间线组件，用于展示状态变更历史。

### 22. Progress

进度条组件，用于写作进度展示。

**属性:**
```typescript
interface ProgressProps {
  value: number;  // 0-100
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning';
}
```

### 23. Milestone

里程碑组件，用于写作阶段管理。

**展示信息:**
- 里程碑名称
- 状态 (未开始/进行中/已完成)
- 截止日期
- 勾选框

### 24. FileUpload

文件上传组件，支持图片/图表上传。

**功能:**
- 拖拽上传
- 预览
- 进度显示

### 25. ReferenceCard

参考文献卡片，展示引用信息。

**展示信息:**
- 标题
- 作者
- 年份/期刊
- DOI 链接
- BibTeX 复制按钮

---

## 表单组件

### 26. TaskForm

任务创建/编辑表单。

**字段:**
- 标题 (必填)
- 描述 (可选)
- 状态 (下拉选择)
- 优先级 (单选按钮)
- 截止日期 (日期选择)
- 关联论文 (搜索选择)
- 关联会议 (搜索选择)

### 27. ConferenceForm

会议创建/编辑表单。

### 28. SubmissionForm

投稿创建/编辑表单。

### 29. ReminderForm

提醒创建/编辑表单。

---

## 页面组件

### 30. Dashboard

首页仪表盘，包含四个核心模块：

**布局:**
```
┌──────────────────┬──────────────────┐
│ 今日推荐论文     │  待办任务        │
│ (PaperCard)     │  (TaskCard x3)  │
├──────────────────┼──────────────────┤
│ 会议截稿倒计时   │  投稿进度        │
│ (ConferenceCard)│  (SubmissionTimeline) │
└──────────────────┴──────────────────┘
```

### 31. PaperSearch

论文检索页面。

**布局:**
```
┌──────────────────────────────────────┐
│ SearchBar + Source Tabs              │
├──────────────────────────────────────┤
│ FilterBar (日期/来源/标签)            │
├──────────────────────────────────────┤
│                                      │
│ PaperCard Grid (响应式)              │
│                                      │
└──────────────────────────────────────┘
```

### 32. MyPapers

我的论文库页面。

**布局:**
```
┌──────────────────────────────────────┐
│ SearchBar + FilterBar                │
├──────────────────────────────────────┤
│ Tab: 全部 | 已收藏 | 已读 | 未读      │
├──────────────────────────────────────┤
│ PaperList / PaperGrid                │
└──────────────────────────────────────┘
```

### 33. Tasks

任务管理页面。

**布局:**
```
┌──────────────────────────────────────┐
│ Header: 新建任务按钮 + Filter         │
├──────────────────────────────────────┤
│ Board View / List View               │
│ ┌─────────┬─────────┬─────────┐      │
│ │ 待办    │ 进行中  │ 已完成  │      │
│ │ TaskCard│ TaskCard│ TaskCard│      │
│ └─────────┴─────────┴─────────┘      │
└──────────────────────────────────────┘
```

### 34. Conferences

会议列表页面。

### 35. Submissions

投稿进度页面。

### 36. Outline

大纲编辑页面。

**布局:**
```
┌──────────────────┬──────────────────┐
│ 大纲列表         │ 大纲编辑器       │
│ - 大纲 1        │ ┌──────────────┐ │
│ - 大纲 2        │ │ 章节 1       │ │
│ + 新建大纲      │ │ 章节 2       │ │
│                  │ │ 章节 3       │ │
│                  │ └──────────────┘ │
│                  │ 导出按钮         │
└──────────────────┴──────────────────┘
```

---

## 设计系统

### 颜色

| 用途 | 颜色变量 |
|------|----------|
| 主色 | `--primary` |
| 主色悬停 | `--primary-hover` |
| 背景 | `--background` |
| 卡片背景 | `--card` |
| 边框 | `--border` |
| 文本主色 | `--foreground` |
| 文本次要 | `--muted-foreground` |
| 成功 | `--success` |
| 警告 | `--warning` |
| 错误 | `--error` |

### 间距

| 名称 | 值 |
|------|-----|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

### 响应式断点

| 名称 | 宽度 |
|------|------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-02-18 | 初始版本 |
