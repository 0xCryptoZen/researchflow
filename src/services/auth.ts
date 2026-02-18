// Auth Service - GitHub OAuth with Cloudflare Workers backend
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, removeKey, writeJSON } from './storage';
import { syncService } from './sync';

export interface GitHubUser {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export interface AuthUser {
  id: string;
  githubId: string;
  name: string;
  email: string;
  avatar?: string;
  researchFields: string[];
  targetConferences: string[];
  // Cloud sync fields
  isCloudMode?: boolean;
  lastSyncTime?: string;
}

// API base URL - configurable via environment
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

function getAuthHeader(): string | null {
  const user = readJSON<AuthUser | null>(STORAGE_KEYS.USER, null);
  return user?.id ? `Bearer ${user.id}` : null;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  const authHeader = getAuthHeader();
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const auth = {
  // Get current user from localStorage
  getCurrentUser(): AuthUser | null {
    return readJSON<AuthUser | null>(STORAGE_KEYS.USER, null);
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  },

  // Check if cloud mode is available
  async checkCloudAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`, { 
        method: 'GET',
        // Don't include auth header for health check
      });
      if (!response.ok) return false;
      const data = await response.json() as any;
      return data.d1Available === true;
    } catch {
      return false;
    }
  },

  // Login with GitHub - redirects to OAuth flow
  async loginWithGitHub(): Promise<AuthUser> {
    // First check if cloud is available
    const cloudAvailable = await this.checkCloudAvailable();
    
    if (!cloudAvailable) {
      // Fallback to local mock login
      console.log('[Auth] Cloud not available, using local mode');
      return this.localLogin();
    }
    
    // Redirect to GitHub OAuth
    const response = await apiRequest<{ message: string; devMode?: boolean; mockUserId?: string }>(
      '/auth/github',
      { method: 'GET' }
    );
    
    if (response.devMode) {
      // Dev mode without real OAuth
      console.log('[Auth] Dev mode, using local login');
      return this.localLogin();
    }
    
    // This should redirect, but if we get here, handle it
    throw new Error('OAuth redirect required');
  },

  // Handle OAuth callback - called after redirect
  async handleOAuthCallback(userId: string): Promise<AuthUser> {
    try {
      // Try to get user from cloud
      const cloudUser = await apiRequest<{
        id: string;
        name: string;
        email: string;
        avatar: string;
        researchFields: string[];
      }>('/auth/me');
      
      const user: AuthUser = {
        id: cloudUser.id,
        githubId: cloudUser.id, // In real OAuth, this would be the GitHub ID
        name: cloudUser.name,
        email: cloudUser.email,
        avatar: cloudUser.avatar,
        researchFields: cloudUser.researchFields || [],
        targetConferences: [],
        isCloudMode: true,
        lastSyncTime: new Date().toISOString(),
      };
      
      writeJSON(STORAGE_KEYS.USER, user);
      
      // Initial sync
      await syncService.initialSync();
      
      return user;
    } catch (error) {
      console.error('[Auth] Failed to get user from cloud:', error);
      throw error;
    }
  },

  // Local mock login (fallback)
  async localLogin(): Promise<AuthUser> {
    const mockUser: AuthUser = {
      id: 'local-' + Date.now(),
      githubId: 'local',
      name: 'Local User',
      email: 'local@example.com',
      researchFields: [],
      targetConferences: [],
      isCloudMode: false,
    };
    
    writeJSON(STORAGE_KEYS.USER, mockUser);
    return mockUser;
  },

  // Logout
  logout(): void {
    const user = this.getCurrentUser();
    if (user?.isCloudMode) {
      // Optionally notify cloud of logout
      try {
        apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      } catch {}
    }
    removeKey(STORAGE_KEYS.USER);
    removeKey(STORAGE_KEYS.LAST_SYNC);
  },

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    const updatedUser = { ...user, ...updates };
    writeJSON(STORAGE_KEYS.USER, updatedUser);
    
    // Sync to cloud if in cloud mode
    if (user.isCloudMode) {
      // TODO: Call cloud API to update profile
    }
    
    return updatedUser;
  },

  // Add research field
  async addResearchField(field: string): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    if (!user.researchFields.includes(field)) {
      user.researchFields.push(field);
      writeJSON(STORAGE_KEYS.USER, user);
    }
    return user;
  },

  // Add target conference
  async addTargetConference(conf: string): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    if (!user.targetConferences.includes(conf)) {
      user.targetConferences.push(conf);
      writeJSON(STORAGE_KEYS.USER, user);
    }
    return user;
  }
};

export default auth;
