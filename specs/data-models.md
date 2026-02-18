# 数据模型规格

## 概述

本文档定义 ResearchFlow 的核心数据模型，包括论文、任务、会议、投稿、用户等实体。

---

## 核心实体

### 1. 用户 (User)

```typescript
interface User {
  id: string;              // UUID
  githubId: string;         // GitHub OAuth ID
  name: string;            // 显示名称
  email: string;           // 邮箱
  avatar?: string;         // 头像 URL
  researchFields: string[]; // 研究领域 ID 列表
  createdAt: string;       // 创建时间 ISO8601
  updatedAt: string;       // 更新时间 ISO8601
}
```

**存储 Key:** `researchflow_user`

---

### 2. 论文 (Paper)

```typescript
interface Paper {
  id: string;               // UUID
  title: string;            // 标题
  authors: string[];        // 作者列表
  abstract?: string;        // 摘要
  source: 'arxiv' | 'scholar' | 'dblp' | 'ieee' | 'acm';  // 来源
  url: string;              // 原文链接
  pdfUrl?: string;          // PDF 链接
  publishedDate: string;    // 发表日期 YYYY-MM-DD
  tags: string[];           // 标签
  notes?: string;           // 个人笔记
  isFavorite: boolean;     // 是否收藏
  addedAt: string;          // 添加时间 ISO8601
  userId: string;           // 所属用户 ID
}
```

**存储 Key:** `researchflow_papers`

---

### 3. 任务 (Task)

```typescript
interface Task {
  id: string;               // UUID
  title: string;            // 标题
  description?: string;     // 描述
  status: 'todo' | 'in-progress' | 'completed';  // 状态
  priority: 'high' | 'medium' | 'low';           // 优先级
  dueDate?: string;         // 截止日期 YYYY-MM-DD
  relatedPaperId?: string;  // 关联论文 ID
  relatedConferenceId?: string;  // 关联会议 ID
  createdAt: string;        // 创建时间 ISO8601
  completedAt?: string;     // 完成时间 ISO8601
  userId: string;           // 所属用户 ID
}
```

**存储 Key:** `researchflow_tasks`

---

### 4. 会议 (Conference)

```typescript
interface Conference {
  id: string;               // UUID
  name: string;             // 全称
  shortName: string;        // 缩写 (如 IEEE S&P)
  year: number;             // 年份
  deadline: string;         // 截稿日期 YYYY-MM-DD
  notificationDate?: string;  // 通知日期
  conferenceDate?: string;  // 会议日期
  website: string;          // 官网 URL
  category: 'blockchain' | 'security' | 'ai' | 'network' | 'other';  // 领域
  location?: string;        // 地点
  createdAt: string;        // 创建时间 ISO8601
  userId: string;           // 所属用户 ID
}
```

**存储 Key:** `researchflow_conferences`

---

### 5. 投稿 (Submission)

```typescript
interface Submission {
  id: string;               // UUID
  paperTitle: string;       // 论文标题
  venue: string;            // 投稿期刊/会议
  status: 'submitted' | 'under-review' | 'accepted' | 'rejected' | 'published';  // 状态
  submittedDate: string;    // 投稿日期 YYYY-MM-DD
  notificationDate?: string;  // 通知日期
  publishedDate?: string;   // 发表日期
  notes?: string;           // 备注
  timeline: SubmissionEvent[];  // 状态变更历史
  createdAt: string;       // 创建时间 ISO8601
  updatedAt: string;        // 更新时间 ISO8601
  userId: string;           // 所属用户 ID
}

interface SubmissionEvent {
  date: string;             // 事件日期
  status: Submission['status'];  // 状态
  note?: string;           // 事件备注
}
```

**存储 Key:** `researchflow_submissions`

---

### 6. 提醒 (Reminder)

```typescript
interface Reminder {
  id: string;               // UUID
  type: 'daily-paper' | 'deadline' | 'task' | 'writing' | 'custom';  // 类型
  title: string;            // 标题
  content?: string;         // 内容
  triggerAt: string;        // 触发时间 ISO8601
  channels: ('email' | 'feishu' | 'telegram')[];  // 通知渠道
  enabled: boolean;         // 是否启用
  relatedId?: string;       // 关联实体 ID
  createdAt: string;        // 创建时间 ISO8601
  userId: string;           // 所属用户 ID
}
```

**存储 Key:** `researchflow_reminders`

---

### 7. 研究领域 (ResearchField)

```typescript
interface ResearchField {
  id: string;               // ID (如 'blockchain')
  name: string;             // 显示名称
  keywords: string[];       // 关键词
  recommendedConferences: string[];  // 推荐会议 ID 列表
}

// 预设领域
const RESEARCH_FIELDS: ResearchField[] = [
  { id: 'blockchain', name: '区块链', keywords: ['blockchain', 'cryptocurrency'], recommendedConferences: [] },
  { id: 'ai', name: '人工智能', keywords: ['machine learning', 'deep learning'], recommendedConferences: [] },
  { id: 'security', name: '网络安全', keywords: ['security', 'privacy'], recommendedConferences: [] },
  { id: 'network', name: '网络', keywords: ['networking', 'distributed systems'], recommendedConferences: [] },
  { id: 'software', name: '软件工程', keywords: ['software engineering', 'programming'], recommendedConferences: [] },
  { id: 'other', name: '其他', keywords: [], recommendedConferences: [] },
];
```

**存储 Key:** `researchflow_research_fields`

---

### 8. 写作大纲 (Outline)

```typescript
interface Outline {
  id: string;               // UUID
  title: string;            // 大纲标题
  paperId?: string;         // 关联论文 ID
  sections: OutlineSection[];  // 章节列表
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: string;        // 创建时间 ISO8601
  updatedAt: string;        // 更新时间 ISO8601
  userId: string;           // 所属用户 ID
}

interface OutlineSection {
  id: string;               // 章节 ID
  title: string;            // 章节标题
  content?: string;         // 内容 (Markdown)
  status: 'todo' | 'writing' | 'done';
  order: number;           // 顺序
}
```

**存储 Key:** `researchflow_outlines`

---

### 9. 参考文献 (Reference)

```typescript
interface Reference {
  id: string;               // UUID
  title: string;            // 标题
  authors: string[];        // 作者
  year: number;             // 年份
  venue?: string;           // 发表场所
  doi?: string;             // DOI
  bibtex?: string;          // BibTeX 内容
  tags: string[];           // 标签
  notes?: string;           // 笔记
  createdAt: string;        // 创建时间 ISO8601
  userId: string;           // 所属用户 ID
}
```

**存储 Key:** `researchflow_references`

---

### 10. 图表 (Chart)

```typescript
interface Chart {
  id: string;               // UUID
  title: string;            // 标题
  description?: string;     // 描述
  fileUrl: string;          // 文件 URL (Cloudflare R2/Images)
  fileType: 'image' | 'table';
  tags: string[];           // 标签
  paperId?: string;         // 关联论文 ID
  createdAt: string;        // 创建时间 ISO8601
  userId: string;           // 所属用户 ID
}
```

**存储 Key:** `researchflow_charts`

---

### 11. 模板 (Template)

```typescript
interface Template {
  id: string;               // UUID
  name: string;             // 模板名称
  venue: string;            // 适用会议/期刊
  category: string;        // 分类
  content: string;         // LaTeX 内容
  description?: string;     // 描述
  downloads: number;       // 下载次数
  createdAt: string;       // 创建时间 ISO8601
}
```

**存储 Key:** `researchflow_templates`

---

## D1 数据库 Schema

```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  research_fields TEXT, -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 论文表
CREATE TABLE papers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT, -- JSON array
  abstract TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  pdf_url TEXT,
  published_date TEXT,
  tags TEXT, -- JSON array
  notes TEXT,
  is_favorite INTEGER DEFAULT 0,
  added_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 任务表
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TEXT,
  related_paper_id TEXT,
  related_conference_id TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 会议表
CREATE TABLE conferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  deadline TEXT NOT NULL,
  notification_date TEXT,
  conference_date TEXT,
  website TEXT,
  category TEXT,
  location TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 投稿表
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  paper_title TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL,
  submitted_date TEXT NOT NULL,
  notification_date TEXT,
  published_date TEXT,
  notes TEXT,
  timeline TEXT, -- JSON array
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 提醒表
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  trigger_at TEXT NOT NULL,
  channels TEXT, -- JSON array
  enabled INTEGER DEFAULT 1,
  related_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 同步日志表
CREATE TABLE sync_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL, -- create, update, delete
  synced_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-02-18 | 初始版本 |
