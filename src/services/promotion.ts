/**
 * Promotion Service - 推广促销服务
 * 
 * 功能：
 * - 邀请码生成与管理
 * - 邀请奖励计算
 * - 限时优惠活动
 * - 分享奖励
 */

// 简单 UUID 生成
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// 邀请码
export interface InviteCode {
  code: string;
  userId: string;
  createdAt: string;
  usedCount: number;
  maxUses: number;
  rewards: {
    inviterDays: number;  // 邀请者获得的天数
    inviteeDays: number;  // 被邀请者获得的天数
  };
}

// 邀请记录
export interface InviteRecord {
  id: string;
  inviteCode: string;
  inviterId: string;
  inviteeId: string;
  inviteeEmail: string;
  registeredAt: string;
  rewardClaimed: boolean;
}

// 奖励
export interface Reward {
  id: string;
  userId: string;
  type: 'invite' | 'share' | 'survey' | 'social';
  amount: number; // 天数
  claimed: boolean;
  expiresAt: string;
  createdAt: string;
}

// 活动
export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'limit_time' | 'new_user' | 'invite' | 'seasonal';
  startAt: string;
  endAt: string;
  rewards: {
    proDays: number;
    discount?: number;
  };
  active: boolean;
}

// 存储
const inviteCodes = new Map<string, InviteCode>();
const inviteRecords: InviteRecord[] = [];
const rewards: Reward[] = [];
const promotions: Promotion[] = [];

// 初始化活动
function initPromotions() {
  promotions.push({
    id: 'launch-special',
    name: '首发特惠',
    description: '活动期间注册可享专业版免费体验',
    type: 'new_user',
    startAt: '2026-02-17T00:00:00Z',
    endAt: '2026-03-17T23:59:59Z',
    rewards: {
      proDays: 7, // 新用户免费7天
    },
    active: true,
  });
  
  promotions.push({
    id: 'limit-time-50',
    name: '限时5折',
    description: '年付专业版限时5折',
    type: 'limit_time',
    startAt: '2026-02-17T00:00:00Z',
    endAt: '2026-02-24T23:59:59Z',
    rewards: {
      proDays: 0,
      discount: 0.5,
    },
    active: true,
  });
}

initPromotions();

// 生成邀请码
export function generateInviteCode(userId: string): InviteCode {
  const code = `RF${generateId().substring(0, 8).toUpperCase()}`;
  const inviteCode: InviteCode = {
    code,
    userId,
    createdAt: new Date().toISOString(),
    usedCount: 0,
    maxUses: 10,
    rewards: {
      inviterDays: 7, // 邀请者获得7天
      inviteeDays: 7, // 被邀请者获得7天
    },
  };
  inviteCodes.set(code, inviteCode);
  return inviteCode;
}

// 获取邀请码
export function getInviteCode(userId: string): InviteCode | undefined {
  for (const code of inviteCodes.values()) {
    if (code.userId === userId) return code;
  }
  return undefined;
}

// 使用邀请码注册
export function useInviteCode(code: string, inviteeId: string, inviteeEmail: string): { success: boolean; reward: number; error?: string } {
  const inviteCode = inviteCodes.get(code.toUpperCase());
  
  if (!inviteCode) {
    return { success: false, reward: 0, error: '邀请码无效' };
  }
  
  if (inviteCode.usedCount >= inviteCode.maxUses) {
    return { success: false, reward: 0, error: '邀请码已达到使用上限' };
  }
  
  // 记录邀请
  inviteCode.usedCount++;
  const record: InviteRecord = {
    id: generateId(),
    inviteCode: code.toUpperCase(),
    inviterId: inviteCode.userId,
    inviteeId,
    inviteeEmail,
    registeredAt: new Date().toISOString(),
    rewardClaimed: false,
  };
  inviteRecords.push(record);
  
  // 返回奖励天数
  return { success: true, reward: inviteCode.rewards.inviteeDays };
}

// 获取邀请记录
export function getInviteRecords(userId: string, page = 1, limit = 20): { records: InviteRecord[]; total: number } {
  const userRecords = inviteRecords.filter(r => r.inviterId === userId);
  const start = (page - 1) * limit;
  return {
    records: userRecords.slice(start, start + limit),
    total: userRecords.length,
  };
}

// 添加奖励
export function addReward(userId: string, type: Reward['type'], days: number): Reward {
  const reward: Reward = {
    id: generateId(),
    userId,
    type,
    amount: days,
    claimed: false,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天有效期
    createdAt: new Date().toISOString(),
  };
  rewards.push(reward);
  return reward;
}

// 获取用户奖励
export function getUserRewards(userId: string): Reward[] {
  return rewards.filter(r => r.userId === userId && !r.claimed);
}

// 领取奖励
export function claimReward(rewardId: string, userId: string): { success: boolean; error?: string } {
  const reward = rewards.find(r => r.id === rewardId && r.userId === userId);
  
  if (!reward) {
    return { success: false, error: '奖励不存在' };
  }
  
  if (reward.claimed) {
    return { success: false, error: '奖励已领取' };
  }
  
  if (new Date(reward.expiresAt) < new Date()) {
    return { success: false, error: '奖励已过期' };
  }
  
  reward.claimed = true;
  return { success: true };
}

// 获取当前活动
export function getActivePromotions(): Promotion[] {
  const now = new Date();
  return promotions.filter(p => 
    p.active && 
    new Date(p.startAt) <= now && 
    new Date(p.endAt) >= now
  );
}

// 获取限时优惠
export function getLimitTimePromotions(): Promotion[] {
  return getActivePromotions().filter(p => p.type === 'limit_time');
}

// 记录分享
export function trackShare(userId: string, platform: string): { success: boolean; rewardDays: number } {
  // 根据平台给予不同奖励
  const platformRewards: Record<string, number> = {
    twitter: 3,
    weibo: 3,
    linkedin: 5,
  };
  
  const days = platformRewards[platform] || 1;
  
  // 添加奖励
  addReward(userId, 'share', days);
  
  return { success: true, rewardDays: days };
}

// 获取分享统计
export function getShareStats(userId: string): { totalShares: number; totalRewardDays: number } {
  const userRewards = rewards.filter(r => r.userId === userId && r.type === 'share');
  return {
    totalShares: userRewards.length,
    totalRewardDays: userRewards.reduce((sum, r) => sum + r.amount, 0),
  };
}

export default {
  generateInviteCode,
  getInviteCode,
  useInviteCode,
  getInviteRecords,
  addReward,
  getUserRewards,
  claimReward,
  getActivePromotions,
  getLimitTimePromotions,
  trackShare,
  getShareStats,
};
