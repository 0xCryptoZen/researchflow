import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    period: '永久',
    features: [
      '论文搜索 (arXiv)',
      '论文收藏 (10篇)',
      '任务管理',
      '会议提醒',
      'LaTeX 模板',
    ],
  },
  {
    id: 'pro',
    name: '专业版',
    price: 29,
    period: '月',
    popular: true,
    features: [
      '论文搜索 (全源)',
      '论文收藏 (无限制)',
      'AI 助手聊天',
      '写作进度追踪',
      '投稿进度管理',
      '优先支持',
    ],
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: 99,
    period: '月',
    features: [
      '专业版全部功能',
      '团队协作',
      'API 访问',
      '自定义集成',
      '专属客服',
      '数据导出',
    ],
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = (planId: string) => {
    // 模拟支付流程
    if (planId === 'free') {
      alert('您已选择免费版，现在开始使用！');
      return;
    }
    
    const plan = plans.find(p => p.id === planId);
    const amount = billing === 'yearly' ? (plan?.price || 0) * 10 : plan?.price;
    
    // 跳转到支付页面或显示支付弹窗
    alert(`即将跳转到支付页面\n\n套餐: ${plan?.name}\n金额: ¥${amount}\n支付方式: 支付宝/微信`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">选择您的套餐</h1>
        <p className="text-slate-600 mb-6">解锁更多 AI 能力，提升科研效率</p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={billing === 'monthly' ? 'text-slate-800 font-medium' : 'text-slate-500'}>月付</span>
          <button
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-14 h-7 rounded-full transition-colors ${billing === 'yearly' ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${billing === 'yearly' ? 'left-8' : 'left-1'}`} />
          </button>
          <span className={billing === 'yearly' ? 'text-slate-800 font-medium' : 'text-slate-500'}>
            年付 <span className="text-green-600 text-sm">(省20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {plans.map(plan => {
          const price = billing === 'yearly' && plan.price > 0 ? Math.round(plan.price * 10) : plan.price;
          
          return (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 ${
                plan.popular ? 'border-blue-500 shadow-lg scale-105' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  最受欢迎
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-800">¥{price}</span>
                  {plan.price > 0 && <span className="text-slate-500">/{billing === 'yearly' ? '年' : '月'}</span>}
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : plan.id === 'free'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                {plan.price === 0 ? '免费开始' : '立即订阅'}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">常见问题</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-800 mb-2">如何支付？</h3>
            <p className="text-sm text-slate-600">我们支持支付宝、微信支付、信用卡等多种支付方式。</p>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 mb-2">可以取消订阅吗？</h3>
            <p className="text-sm text-slate-600">可以随时取消，取消后服务将持续到当前计费周期结束。</p>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 mb-2">有免费试用吗？</h3>
            <p className="text-sm text-slate-600">专业版提供 7 天免费试用，不满意全额退款。</p>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 mb-2">如何开具发票？</h3>
            <p className="text-sm text-slate-600">订阅后可在个人中心申请开具增值税普通发票。</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="text-center mt-8">
        <p className="text-sm text-slate-500 mb-3">我们支持以下支付方式</p>
        <div className="flex items-center justify-center gap-4">
          <span className="px-4 py-2 bg-slate-100 rounded text-sm text-slate-600">支付宝</span>
          <span className="px-4 py-2 bg-slate-100 rounded text-sm text-slate-600">微信支付</span>
          <span className="px-4 py-2 bg-slate-100 rounded text-sm text-slate-600">信用卡</span>
        </div>
      </div>
    </div>
  );
}
