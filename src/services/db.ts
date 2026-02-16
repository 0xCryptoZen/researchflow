/**
 * Database Service - 数据持久化服务
 * 支持 localStorage 和模拟 Cloudflare D1 接口
 */

const STORAGE_KEY = 'researchflow_db';

// 数据表
interface Tables {
  users: any[];
  papers: any[];
  tasks: any[];
  conferences: any[];
  references: any[];
  charts: any[];
  submissions: any[];
  writingProgress: any[];
  outlines: any[];
  reminders: any[];
}

// 初始化数据
const defaultData: Tables = {
  users: [],
  papers: [],
  tasks: [],
  conferences: [],
  references: [],
  charts: [],
  submissions: [],
  writingProgress: [],
  outlines: [],
  reminders: [],
};

// 数据库类
class Database {
  private data: Tables;

  constructor() {
    this.data = this.load();
  }

  // 加载数据
  private load(): Tables {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    return { ...defaultData };
  }

  // 保存数据
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  // 获取所有数据
  getAll(): Tables {
    return this.data;
  }

  // 清空所有数据
  clear(): void {
    this.data = { ...defaultData };
    this.save();
  }

  // 导出数据（用于同步）
  export(): string {
    return JSON.stringify(this.data, null, 2);
  }

  // 导入数据（用于同步）
  import(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.data = { ...defaultData, ...data };
      this.save();
    } catch (e) {
      console.error('Failed to import data:', e);
    }
  }

  // 生成同步密钥
  generateSyncKey(): string {
    return btoa(JSON.stringify({ 
      timestamp: Date.now(),
      version: '1.0.0' 
    }));
  }
}

// 单例
const db = new Database();

// 导出
export default db;
export { Database, type Tables, defaultData };
