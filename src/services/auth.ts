// Auth Service - GitHub OAuth simulation
// In production, this would integrate with Cloudflare Workers backend
import { STORAGE_KEYS } from '../constants/storage';
import { readJSON, removeKey, writeJSON } from './storage';

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

  // Login with GitHub (simulated)
  async loginWithGitHub(): Promise<AuthUser> {
    // In production: redirect to GitHub OAuth
    // const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    // window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user`;
    
    // Simulated login
    const mockUser: AuthUser = {
      id: '1',
      githubId: '0xCryptoZen',
      name: '0xCryptoZen',
      email: 'user@example.com',
      avatar: 'https://avatars.githubusercontent.com/u/49605145',
      researchFields: ['blockchain', 'security'],
      targetConferences: ['Eurocrypt 2026', 'CCS 2026']
    };
    
    writeJSON(STORAGE_KEYS.USER, mockUser);
    return mockUser;
  },

  // Logout
  logout(): void {
    removeKey(STORAGE_KEYS.USER);
  },

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    const updatedUser = { ...user, ...updates };
    writeJSON(STORAGE_KEYS.USER, updatedUser);
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
