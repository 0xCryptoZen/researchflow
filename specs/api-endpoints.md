# API 端点规格

## 概述

本文档定义 ResearchFlow 后端 API（Cloudflare Workers + D1）的端点规格。

**Base URL:** `https://researchflow-api.pages.dev/api`

**认证方式:** Bearer Token (GitHub OAuth)

---

## 通用规范

### 请求格式
```json
Content-Type: application/json
Authorization: Bearer <token>
```

### 响应格式
```json
{
  "success": true,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "错误信息"
  }
}
```

### 分页
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "hasMore": true
  }
}
```

---

## 认证相关

### 1. GitHub OAuth 登录

```
GET /api/auth/github
```

重定向到 GitHub OAuth 授权页面。

### 2. OAuth 回调

```
GET /api/auth/github/callback?code=<code>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-uuid",
      "githubId": "github-id",
      "name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

### 3. 验证 Token

```
GET /api/auth/verify
```

**响应:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": { ... }
  }
}
```

---

## 用户相关

### 4. 获取当前用户

```
GET /api/users/me
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "githubId": "github-id",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "https://...",
    "researchFields": ["blockchain", "security"],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-02-18T00:00:00Z"
  }
}
```

### 5. 更新用户信息

```
PATCH /api/users/me
```

**请求体:**
```json
{
  "name": "New Name",
  "researchFields": ["blockchain", "ai"]
}
```

---

## 论文相关

### 6. 搜索论文

```
GET /api/papers/search?q=<query>&source=<source>&limit=<limit>&offset=<offset>
```

**参数:**
- `q` - 搜索关键词 (必填)
- `source` - 来源 `arxiv|dblp|ieee|acm|scholar` (可选，默认 all)
- `limit` - 返回数量 (默认 20)
- `offset` - 偏移量 (默认 0)

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "paper-uuid",
      "title": "Paper Title",
      "authors": ["Author 1", "Author 2"],
      "abstract": "...",
      "source": "arxiv",
      "url": "https://...",
      "publishedDate": "2026-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "hasMore": true
  }
}
```

### 7. 获取用户收藏论文

```
GET /api/papers?page=<page>&pageSize=<pageSize>&tag=<tag>&search=<search>
```

**参数:**
- `page` - 页码 (默认 1)
- `pageSize` - 每页数量 (默认 20)
- `tag` - 按标签筛选 (可选)
- `search` - 关键词搜索 (可选)

### 8. 添加论文到收藏

```
POST /api/papers
```

**请求体:**
```json
{
  "title": "Paper Title",
  "authors": ["Author 1", "Author 2"],
  "abstract": "...",
  "source": "arxiv",
  "url": "https://...",
  "publishedDate": "2026-01-15",
  "tags": ["AI", "ML"]
}
```

### 9. 更新论文

```
PATCH /api/papers/:id
```

**请求体:**
```json
{
  "tags": ["AI", "ML", "NewTag"],
  "notes": "Some notes",
  "isFavorite": true
}
```

### 10. 删除论文

```
DELETE /api/papers/:id
```

---

## 任务相关

### 11. 获取任务列表

```
GET /api/tasks?status=<status>&priority=<priority>&page=<page>&pageSize=<pageSize>
```

**参数:**
- `status` - 状态筛选 `todo|in-progress|completed`
- `priority` - 优先级筛选 `high|medium|low`

### 12. 创建任务

```
POST /api/tasks
```

**请求体:**
```json
{
  "title": "Task Title",
  "description": "Task Description",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-03-01",
  "relatedPaperId": "paper-uuid",
  "relatedConferenceId": "conference-uuid"
}
```

### 13. 更新任务

```
PATCH /api/tasks/:id
```

### 14. 删除任务

```
DELETE /api/tasks/:id
```

---

## 会议相关

### 15. 获取会议列表

```
GET /api/conferences?category=<category>&year=<year>
```

### 16. 创建会议

```
POST /api/conferences
```

**请求体:**
```json
{
  "name": "IEEE Symposium on Security and Privacy",
  "shortName": "IEEE S&P",
  "year": 2026,
  "deadline": "2026-08-15",
  "notificationDate": "2026-10-15",
  "conferenceDate": "2027-05-15",
  "website": "https://...",
  "category": "security",
  "location": "San Francisco, CA"
}
```

### 17. 更新会议

```
PATCH /api/conferences/:id
```

### 18. 删除会议

```
DELETE /api/conferences/:id
```

---

## 投稿相关

### 19. 获取投稿列表

```
GET /api/submissions?status=<status>
```

### 20. 创建投稿

```
POST /api/submissions
```

**请求体:**
```json
{
  "paperTitle": "My Paper Title",
  "venue": "IEEE S&P",
  "status": "submitted",
  "submittedDate": "2026-02-01",
  "notes": "First submission"
}
```

### 20. 更新投稿状态

```
PATCH /api/submissions/:id
```

**请求体:**
```json
{
  "status": "under-review",
  "notificationDate": "2026-03-15"
}
```

### 21. 添加投稿时间线事件

```
POST /api/submissions/:id/timeline
```

**请求体:**
```json
{
  "date": "2026-03-15",
  "status": "under-review",
  "note": "Under review"
}
```

---

## 提醒相关

### 22. 获取提醒列表

```
GET /api/reminders?enabled=<enabled>
```

### 23. 创建提醒

```
POST /api/reminders
```

**请求体:**
```json
{
  "type": "deadline",
  "title": "会议截稿提醒",
  "content": "IEEE S&P 截稿还有 7 天",
  "triggerAt": "2026-08-08T09:00:00Z",
  "channels": ["email", "feishu"],
  "enabled": true,
  "relatedId": "conference-uuid"
}
```

### 24. 更新提醒

```
PATCH /api/reminders/:id
```

### 25. 删除提醒

```
DELETE /api/reminders/:id
```

---

## 同步相关

### 26. 全量同步

```
POST /api/sync
```

**请求体:**
```json
{
  "lastSyncAt": "2026-02-17T00:00:00Z"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "papers": [...],
    "tasks": [...],
    "conferences": [...],
    "submissions": [...],
    "reminders": [...],
    "serverTime": "2026-02-18T00:00:00Z"
  }
}
```

### 27. 增量同步

```
GET /api/sync/changes?since=<timestamp>
```

---

## 参考文献相关

### 28. 解析 DOI

```
POST /api/references/parse-doi
```

**请求体:**
```json
{
  "doi": "10.1000/xyz123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "title": "Paper Title",
    "authors": ["Author 1", "Author 2"],
    "year": 2026,
    "venue": "Journal Name",
    "doi": "10.1000/xyz123",
    "bibtex": "@article{...}"
  }
}
```

### 29. 导入 BibTeX

```
POST /api/references/import
```

**请求体:**
```json
{
  "bibtex": "@article{key,\n  author = {Author},\n  title = {Title}\n}"
}
```

### 30. 导出 BibTeX

```
GET /api/references/export?format=bibtex
```

---

## 模板相关

### 31. 获取模板列表

```
GET /api/templates?category=<category>&venue=<venue>
```

### 32. 下载模板

```
GET /api/templates/:id/download
```

返回 LaTeX 文件内容或文件下载。

---

## 图表相关

### 33. 上传图表

```
POST /api/charts/upload
```

Content-Type: `multipart/form-data`

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "chart-uuid",
    "fileUrl": "https://.../chart.png"
  }
}
```

### 34. 获取图表列表

```
GET /api/charts?paperId=<paperId>
```

---

## 错误码

| 错误码 | 描述 |
|--------|------|
| AUTH_REQUIRED | 需要登录 |
| AUTH_INVALID | Token 无效 |
| NOT_FOUND | 资源不存在 |
| VALIDATION_ERROR | 参数校验失败 |
| RATE_LIMIT | 请求过于频繁 |
| SERVER_ERROR | 服务器错误 |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-02-18 | 初始版本 |
