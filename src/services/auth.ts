// Auth Service - GitHub OAuth simulation
// In production, this would integrate with Cloudflare Workers backend

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
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
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
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    return mockUser;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('user');
  },

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // Add research field
  async addResearchField(field: string): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    if (!user.researchFields.includes(field)) {
      user.researchFields.push(field);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  },

  // Add target conference
  async addTargetConference(conf: string): Promise<AuthUser> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Not logged in');
    
    if (!user.targetConferences.includes(conf)) {
      user.targetConferences.push(conf);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }
};

export default auth;
