-- ResearchFlow D1 Database Schema
-- Run with: wrangler d1 execute researchflow --local --file=./schema.sql

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  research_fields TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 论文表
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT DEFAULT '[]',
  abstract TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  pdf_url TEXT,
  published_date TEXT,
  tags TEXT DEFAULT '[]',
  notes TEXT,
  is_favorite INTEGER DEFAULT 0,
  added_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT,
  related_paper_id TEXT,
  related_conference_id TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 会议表
CREATE TABLE IF NOT EXISTS conferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  deadline TEXT NOT NULL,
  notification_date TEXT,
  conference_date TEXT,
  website TEXT,
  category TEXT DEFAULT 'other',
  location TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 投稿表
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  paper_title TEXT NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_date TEXT NOT NULL,
  notification_date TEXT,
  published_date TEXT,
  notes TEXT,
  timeline TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  trigger_at TEXT NOT NULL,
  channels TEXT DEFAULT '[]',
  enabled INTEGER DEFAULT 1,
  related_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 同步日志表
CREATE TABLE IF NOT EXISTS sync_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  synced_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 图表/图片表 (P2-4)
CREATE TABLE IF NOT EXISTS charts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_key TEXT,
  type TEXT DEFAULT 'image',
  tags TEXT DEFAULT '[]',
  paper_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 参考文献表
CREATE TABLE IF NOT EXISTS references (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT DEFAULT 'article',
  title TEXT NOT NULL,
  authors TEXT DEFAULT '[]',
  year INTEGER,
  journal TEXT,
  conference TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  tags TEXT DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_papers_user ON papers(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_conferences_user ON conferences(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON sync_logs(user_id, synced_at);
CREATE INDEX IF NOT EXISTS idx_charts_user ON charts(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_paper ON charts(paper_id);
CREATE INDEX IF NOT EXISTS idx_references_user ON references(user_id);

-- 定时任务表 (P3-1.2)
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  executed_at TEXT,
  status TEXT DEFAULT 'pending',
  result TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户研究领域表
CREATE TABLE IF NOT EXISTS research_fields (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
