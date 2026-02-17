import { useState, useEffect } from 'react';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'limit_time' | 'new_user' | 'invite' | 'seasonal';
  endAt: string;
  discount?: number;
  proDays?: number;
}

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // 模拟活动数据
    setPromotions([
      {
        id: 'launch-special',
        name: '首发特惠',
        description: '活动期间注册可享专业版免费体验',
        type: 'new_user',
        endAt: '2026-03-17T23:59:59Z',
        proDays: 7,
      },
      {
        id: 'limit-time-50',
        name: '限时5折',
        description: '年付专业版限时5折，原价290，现仅需99',
        type: 'limit_time',
        endAt: '2026-02-24T23:59:59Z',
        discount: 0.5,
      },
      {
        id: 'spring-sale',
        name: '春季大促',
        description: '企业版限时优惠，立减500元',
        type: 'seasonal',
        endAt: '2026-03-01T23:59:59Z',
        discount: 0.3,
      },
    ]);
  }, []);

  // 倒计时
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date('2026-02-24T23:59:59Z');
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff > 0) {
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };
      }
      return null;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      name: '免费版',
      price: 0,
      period: '永久',
      features: ['论文搜索 (arXiv)', '论文收藏 (10篇)', '任务管理', '会议提醒'],
      highlighted: false,
    },
    {
      name: '专业版',
      originalPrice: 29,
      price: 0,
      period: '月',
      badge: '限时免费',
      features: ['论文搜索 (全源)', '无限制收藏', 'AI 助手聊天', '写作进度追踪', '投稿管理', '优先支持'],
      highlighted: true,
    },
    {
      name: '专业版年付',
      originalPrice: 290,
      price: 99,
      period: '年',
      badge: '省66%',
      features: ['专业版全部功能', '专属客服', '数据导出'],
      highlighted: true,
    },
    {
      name: '企业版',
      originalPrice: 99,
      price: 49,
      period: '月',
      badge: '限时优惠',
      features: ['专业版全部功能', '团队协作 (5人)', 'API 访问', '自定义集成', '专属客服'],
      highlighted: false,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 倒计时横幅 */}
      {timeLeft && (
        <div className="bg-gradient-to-r from-[#8B5A2B] to-[#C4956A] text-white rounded-2xl p-6 text-center">
          <div className="text-lg font-medium mb-3">⏰ 限时优惠火热进行中</div>
          <div className="flex justify-center gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-xs">天</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs">时</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs">分</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs">秒</div>
            </div>
          </div>
        </div>
      )}

      {/* 活动列表 */}
      <div className="grid grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="academic-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {promo.type === 'limit_time' ? '🔥' : promo.type === 'new_user' ? '🎁' : '🌸'}
              </span>
              <h3 className="font-serif text-lg text-[#2C1810]">{promo.name}</h3>
            </div>
            <p className="text-sm text-[#6B5344] mb-2">{promo.description}</p>
            <div className="text-xs text-[#9A8677]">
              截止: {new Date(promo.endAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
        ))}
      </div>

      {/* 定价卡片 */}
      <div>
        <h2 className="font-serif text-2xl text-[#2C1810] text-center mb-8">选择您的套餐</h2>
        
        <div className="grid grid-cols-4 gap-4">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`academic-card p-6 relative ${
                plan.highlighted ? 'border-2 border-[#8B5A2B] ring-2 ring-[#8B5A2B]/20' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#8B5A2B] text-white text-xs font-medium rounded-full">
                  {plan.badge}
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="font-serif text-lg text-[#2C1810] mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.originalPrice && (
                    <span className="text-sm text-[#9A8677] line-through">¥{plan.originalPrice}</span>
                  )}
                  <span className="text-3xl font-bold text-[#8B5A2B]">¥{plan.price}</span>
                  {plan.price > 0 && <span className="text-sm text-[#9A8677]">/{plan.period}</span>}
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2 text-sm text-[#6B5344]">
                    <span className="text-[#4A7C59]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-[#8B5A2B] text-white hover:bg-[#5D3A1A]'
                    : 'bg-[#F5EDE3] text-[#8B5A2B] hover:bg-[#E8DFD5]'
                }`}
              >
                {plan.price === 0 ? '免费开始' : '立即订阅'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 活动说明 */}
      <div className="academic-card p-6">
        <h3 className="font-serif text-lg text-[#2C1810] mb-4">📋 活动说明</h3>
        <div className="text-sm text-[#6B5344] space-y-2">
          <p>1. 活动期间所有用户可享受限时免费/优惠价格</p>
          <p>2. 订阅成功后，可在我的邀请页面查看邀请码</p>
          <p>3. 分享到社交媒体可获得额外奖励天数</p>
          <p>4. 活动结束后恢复原价，但已订阅用户不受影响</p>
          <p>5. 如有问题请联系客服 support@researchflow.ai</p>
        </div>
      </div>
    </div>
  );
}
