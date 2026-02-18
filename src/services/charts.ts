// Chart Service - 图表/图片管理服务 (P2-4)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface Chart {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  type: 'figure' | 'table' | 'image' | 'diagram';
  tags: string[];
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

// 获取认证头
function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 获取所有图表
export async function getCharts(): Promise<Chart[]> {
  try {
    const response = await fetch(`${API_BASE}/charts`, {
      headers: getAuthHeader(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.charts || [];
  } catch (error) {
    console.error('Get charts error:', error);
    return [];
  }
}

// 获取单个图表
export async function getChartById(id: string): Promise<Chart | null> {
  try {
    const response = await fetch(`${API_BASE}/charts/${id}`, {
      headers: getAuthHeader(),
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Get chart error:', error);
    return null;
  }
}

// 获取指定论文的图表
export async function getChartsByPaper(paperId: string): Promise<Chart[]> {
  try {
    const response = await fetch(`${API_BASE}/charts/paper/${paperId}`, {
      headers: getAuthHeader(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.charts || [];
  } catch (error) {
    console.error('Get charts by paper error:', error);
    return [];
  }
}

// 获取可复用图表（未关联论文）
export async function getReusableCharts(): Promise<Chart[]> {
  try {
    const response = await fetch(`${API_BASE}/charts/reusable`, {
      headers: getAuthHeader(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.charts || [];
  } catch (error) {
    console.error('Get reusable charts error:', error);
    return [];
  }
}

// 上传图片到 R2
export async function uploadImage(
  file: File,
  folder: string = 'charts',
  _onProgress?: (progress: number) => void
): Promise<{ url: string; key: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${API_BASE}/storage/upload?filename=${encodeURIComponent(file.name)}&folder=${folder}`,
      {
        method: 'POST',
        headers: getAuthHeader(),
        body: file,
      }
    );
    
    if (!response.ok) {
      console.error('Upload failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    return { url: data.url, key: data.key };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// 创建图表
export async function createChart(chart: Partial<Chart>): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/charts`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chart),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Create chart error:', error);
    return null;
  }
}

// 更新图表
export async function updateChart(id: string, updates: Partial<Chart>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/charts/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Update chart error:', error);
    return false;
  }
}

// 删除图表
export async function deleteChart(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/charts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Delete chart error:', error);
    return false;
  }
}

// 跨论文复用图表 (P2-4.2)
export async function reuseChart(chartId: string, targetPaperId: string): Promise<boolean> {
  return updateChart(chartId, { paperId: targetPaperId });
}

// 复制图表到新论文
export async function copyChartToPaper(chartId: string, targetPaperId: string): Promise<string | null> {
  const original = await getChartById(chartId);
  if (!original) return null;
  
  // Create new chart linked to target paper
  const newId = await createChart({
    name: original.name,
    description: original.description,
    imageUrl: original.imageUrl,
    imageKey: original.imageKey,
    type: original.type,
    tags: original.tags,
    paperId: targetPaperId,
  });
  
  return newId;
}

// 获取图表的公开访问URL
export function getChartUrl(imageKey: string): string {
  if (!imageKey) return '';
  
  // If it's already a full URL, return as-is
  if (imageKey.startsWith('http')) return imageKey;
  
  // Otherwise, construct the URL
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';
  return `${API_BASE}/storage/${imageKey}`;
}

export default {
  getCharts,
  getChartById,
  getChartsByPaper,
  getReusableCharts,
  uploadImage,
  createChart,
  updateChart,
  deleteChart,
  reuseChart,
  copyChartToPaper,
  getChartUrl,
};
