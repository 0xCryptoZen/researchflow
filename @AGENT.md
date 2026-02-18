# ResearchFlow 构建和运行指南

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

## 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd researchflow
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

---

## 可用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 (热重载) |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run type-check` | 运行 TypeScript 类型检查 |

---

## 项目结构

```
researchflow/
├── src/
│   ├── components/       # React 组件
│   │   ├── ui/          # 通用 UI 组件 (shadcn/ui)
│   │   ├── layout/      # 布局组件
│   │   └── ...          # 业务组件
│   ├── pages/           # 页面组件
│   ├── repositories/    # 数据仓储层
│   ├── services/        # 服务层 (存储/认证/论文API)
│   ├── hooks/           # React Hooks
│   ├── types/           # TypeScript 类型定义
│   ├── constants/       # 常量定义
│   ├── lib/             # 工具函数
│   └── App.tsx          # 应用入口
├── server/              # Cloudflare Workers 后端
├── specs/               # 规格文档
├── docs/                # 项目文档
├── public/              # 静态资源
├── prd.json             # 产品需求文档
├── PROMPT.md            # AI 代理提示词
├── @AGENT.md            # 本文件
└── package.json
```

---

## 技术栈详情

### 前端

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router v6** - 路由管理
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无样式 UI 组件库
- **shadcn/ui** - UI 组件库

### 后端 (规划中)

- **Cloudflare Workers** - 无服务器运行时
- **Hono** - Web 框架
- **Cloudflare D1** - SQL 数据库
- **Cloudflare R2** - 对象存储 (图表/文件)

---

## 本地开发

### 配置环境变量

创建 `.env.local` 文件：

```env
# 开发环境 (可选)
VITE_API_URL=http://localhost:8787/api
VITE_ENABLE_MOCK=true
```

### 启动后端 (本地模拟)

后端目前处于规划阶段，本地开发使用 localStorage 模拟数据。

如需测试 Cloudflare Workers：

```bash
# 安装 Wrangler
npm install -g wrangler

# 启动本地 Workers
cd server
wrangler dev
```

---

## Cloudflare 部署

### 部署前端

```bash
# 部署到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=researchflow
```

### 部署后端

```bash
cd server
wrangler deploy
```

### 配置 D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create researchflow-db

# 执行 schema
wrangler d1 execute researchflow-db --file=./schema.sql
```

---

## 开发规范

### 代码风格

- 使用 ESLint + Prettier 进行代码检查
- 遵循 TypeScript strict 模式
- 使用 Functional Components + Hooks

### 提交规范

使用 Conventional Commits：

```
feat: 新功能
fix: Bug 修复
docs: 文档更新
refactor: 代码重构
test: 测试
chore: 构建/工具
```

### 分支策略

- `main` - 主分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

---

## 常见问题

### Q: 登录后数据不保存？

A: 当前使用 localStorage，数据仅保存在浏览器。如需云端同步，等待 US-016 实现。

### Q: 论文搜索失败？

A: 检查网络连接，arXiv/DBLP API 可能有访问限制。部分功能为占位实现。

### Q: 如何重置所有数据？

A: 在浏览器控制台执行：
```javascript
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('researchflow_')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

---

## 相关文档

- [PROMPT.md](./PROMPT.md) - 项目完整背景和技术栈
- [prd.json](./prd.json) - 产品需求文档
- [fix_plan.md](./fix_plan.md) - 任务修复计划
- [specs/data-models.md](./specs/data-models.md) - 数据模型规格
- [specs/api-endpoints.md](./specs/api-endpoints.md) - API 端点规格
- [specs/ui-components.md](./specs/ui-components.md) - UI 组件规格

---

## 联系方式

如有问题，请提交 Issue 或联系维护者。
