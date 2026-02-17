import { useState, useEffect } from 'react';

interface InviteStats {
  inviteCode: string;
  totalInvites: number;
  totalRewardDays: number;
}

interface InviteRecord {
  inviteeEmail: string;
  registeredAt: string;
}

export default function Invite() {
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [records, setRecords] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 模拟数据加载
    setStats({
      inviteCode: 'RF' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      totalInvites: 5,
      totalRewardDays: 35,
    });
    setRecords([
      { inviteeEmail: 'user1@example.com', registeredAt: '2026-02-15' },
      { inviteeEmail: 'user2@example.com', registeredAt: '2026-02-14' },
      { inviteeEmail: 'user3@example.com', registeredAt: '2026-02-13' },
    ]);
    setLoading(false);
  };

  const copyInviteLink = () => {
    if (!stats?.inviteCode) return;
    
    const link = `https://researchflow.pages.dev/register?code=${stats.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent('我发现了一个超棒的科研论文管理工具「学术书卷」！AI 驱动的学术研究助手，限时免费体验中 ➡️');
    const url = encodeURIComponent('https://researchflow.pages.dev');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToWeibo = () => {
    const text = encodeURIComponent('我发现了一个超棒的科研论文管理工具「学术书卷」！AI 驱动的学术研究助手，限时免费体验中');
    window.open(`https://service.weibo.com/share/share.php?text=${text}&url=https://researchflow.pages.dev`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://researchflow.pages.dev', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#9A8677]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 邀请得奖励 */}
      <div className="academic-card p-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5A2B]/10 flex items-center justify-center text-3xl">
            🎁
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-xl text-[#2C1810] mb-2">邀请好友，双方得奖励</h2>
            <p className="text-[#6B5344] text-sm mb-4">
              每邀请 1 位好友注册，双方各得 <span className="text-[#8B5A2B] font-semibold">7 天</span> 专业版！
              邀请越多，奖励越多。
            </p>
            
            {/* 邀请码 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 px-4 py-3 bg-[#F5EDE3] rounded-lg font-mono text-lg text-[#8B5A2B]">
                {stats?.inviteCode || '生成中...'}
              </div>
              <button
                onClick={copyInviteLink}
                className="px-4 py-3 bg-[#8B5A2B] text-white rounded-lg font-medium hover:bg-[#5D3A1A] transition-colors"
              >
                {copySuccess ? '✓ 已复制' : '复制链接'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="academic-card p-5 text-center">
          <div className="text-3xl font-bold text-[#8B5A2B] font-serif">{stats?.totalInvites || 0}</div>
          <div className="text-sm text-[#9A8677] mt-1">已邀请好友</div>
        </div>
        <div className="academic-card p-5 text-center">
          <div className="text-3xl font-bold text-[#4A7C59] font-serif">{stats?.totalRewardDays || 0}</div>
          <div className="text-sm text-[#9A8677] mt-1">获得奖励(天)</div>
        </div>
        <div className="academic-card p-5 text-center">
          <div className="text-3xl font-bold text-[#7B5AA6] font-serif">10</div>
          <div className="text-sm text-[#9A8677] mt-1">剩余可邀请</div>
        </div>
      </div>

      {/* 分享得奖励 */}
      <div className="academic-card p-6">
        <h3 className="font-serif text-lg text-[#2C1810] mb-4">📢 分享到社交媒体</h3>
        <div className="flex gap-4">
          <button
            onClick={shareToTwitter}
            className="flex-1 py-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg font-medium hover:bg-[#1DA1F2]/20 transition-colors"
          >
            Twitter 分享 (+3天)
          </button>
          <button
            onClick={shareToWeibo}
            className="flex-1 py-3 bg-[#E6162D]/10 text-[#E6162D] rounded-lg font-medium hover:bg-[#E6162D]/20 transition-colors"
          >
            微博 分享 (+3天)
          </button>
          <button
            onClick={shareToLinkedIn}
            className="flex-1 py-3 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg font-medium hover:bg-[#0A66C2]/20 transition-colors"
          >
            LinkedIn (+5天)
          </button>
        </div>
      </div>

      {/* 邀请记录 */}
      <div className="academic-card p-6">
        <h3 className="font-serif text-lg text-[#2C1810] mb-4">📋 邀请记录</h3>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#F5EDE3] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B5A2B]/20 flex items-center justify-center text-sm text-[#8B5A2B]">
                    {record.inviteeEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-[#2C1810]">{record.inviteeEmail}</div>
                    <div className="text-xs text-[#9A8677]">{record.registeredAt}</div>
                  </div>
                </div>
                <span className="status-tag bg-[#4A7C59]/15 text-[#3A6147]">
                  +7天 已发放
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#9A8677]">
            暂无邀请记录
          </div>
        )}
      </div>

      {/* 活动规则 */}
      <div className="academic-card p-6">
        <h3 className="font-serif text-lg text-[#2C1810] mb-4">📝 活动规则</h3>
        <div className="text-sm text-[#6B5344] space-y-2">
          <p>1. 邀请好友通过您的邀请链接注册，双方各得 7 天专业版会员</p>
          <p>2. 分享到社交媒体并保留 24 小时，可获得额外奖励</p>
          <p>3. 邀请满 5 人可额外获得 1 个月专业版</p>
          <p>4. 邀请满 10 人可额外获得 1 年专业版</p>
          <p>5. 奖励有效期为 30 天，请在有效期内使用</p>
        </div>
      </div>
    </div>
  );
}
