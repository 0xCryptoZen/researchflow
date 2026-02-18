// Recommendation Service - 每日论文推荐 (P3-1)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface RecommendedPaper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  source: 'arxiv' | 'dblp' | 'scholar' | 'ieee' | 'acm';
  url: string;
  pdfUrl?: string;
  year?: number;
  venue?: string;
  citations?: number;
  categories?: string[];
  publishedDate?: string;
  matchReason?: string;
  relevanceScore?: number;
}

export interface DailyPick {
  date: string;
  picks: RecommendedPaper[];
  count: number;
}

// 获取认证头
function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 获取基于研究领域的推荐
export async function getRecommendations(limit: number = 20): Promise<RecommendedPaper[]> {
  try {
    const response = await fetch(
      `${API_BASE}/recommendations?limit=${limit}`,
      { headers: getAuthHeader() }
    );
    
    if (!response.ok) {
      console.error('Get recommendations failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error('Get recommendations error:', error);
    return [];
  }
}

// 获取每日精选
export async function getDailyPicks(limit: number = 10): Promise<DailyPick | null> {
  try {
    const response = await fetch(
      `${API_BASE}/recommendations/daily?limit=${limit}`,
      { headers: getAuthHeader() }
    );
    
    if (!response.ok) {
      console.error('Get daily picks failed:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get daily picks error:', error);
    return null;
  }
}

// 保存推荐论文到收藏
export async function saveRecommendation(paper: RecommendedPaper): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/recommendations/save`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paper }),
    });
    
    if (!response.ok) {
      console.error('Save recommendation failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Save recommendation error:', error);
    return null;
  }
}

// 获取定时任务列表
export interface ScheduledTask {
  id: string;
  type: string;
  scheduledFor: string;
  executedAt?: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
}

export async function getScheduledTasks(): Promise<ScheduledTask[]> {
  try {
    const response = await fetch(`${API_BASE}/scheduled-tasks`, {
      headers: getAuthHeader(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.tasks?.map((t: any) => ({
      id: t.id,
      type: t.type,
      scheduledFor: t.scheduled_for,
      executedAt: t.executed_at,
      status: t.status,
      result: JSON.parse(t.result || '{}'),
    })) || [];
  } catch (error) {
    console.error('Get scheduled tasks error:', error);
    return [];
  }
}

// 创建定时任务
export async function createScheduledTask(
  type: string,
  scheduledFor: string
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/scheduled-tasks`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, scheduledFor }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Create scheduled task error:', error);
    return null;
  }
}

// 删除定时任务
export async function deleteScheduledTask(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/scheduled-tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Delete scheduled task error:', error);
    return false;
  }
}

// 客户端本地推荐（离线时使用）
export function getLocalRecommendations(
  savedPapers: any[],
  researchFields: string[]
): RecommendedPaper[] {
  if (!savedPapers.length || !researchFields.length) return [];
  
  // Recommend papers similar to saved ones
  const recommendations: RecommendedPaper[] = [];
  const existingTags = new Set(
    savedPapers.flatMap(p => p.tags || [])
  );
  
  // Simple content-based filtering
  savedPapers.forEach(paper => {
    if (paper.tags) {
      paper.tags.forEach((tag: string) => {
        if (!existingTags.has(tag) && researchFields.includes(tag)) {
          recommendations.push({
            id: `local_${paper.id}_${tag}`,
            title: `Similar to: ${paper.title}`,
            authors: paper.authors || [],
            source: 'arxiv',
            url: paper.url || '',
            year: paper.year,
            matchReason: `Similar to your interest in ${tag}`,
            relevanceScore: 5,
          });
        }
      });
    }
  });
  
  return recommendations.slice(0, 10);
}

export default {
  getRecommendations,
  getDailyPicks,
  saveRecommendation,
  getScheduledTasks,
  createScheduledTask,
  deleteScheduledTask,
  getLocalRecommendations,
};
