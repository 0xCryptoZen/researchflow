/**
 * ResearchFlow Design System - 学术书卷风格
 * 
 * 色彩系统：
 * - 主色: #8B5A2B (古铜棕)
 * - 辅色: #D4A574 (暖赭石)
 * - 背景: #FAF6F1 (暖米白)
 * - 卡片: #FFFFFF (纯白)
 * - 文字: #2C1810 (深褐)
 * - 边框: #E8DFD5 (暖灰)
 */

export const colors = {
  // 主色系
  primary: '#8B5A2B',      // 古铜棕
  primaryLight: '#A67C52', // 浅古铜
  primaryDark: '#5D3A1A',  // 深古铜
  
  // 辅色系
  secondary: '#D4A574',    // 暖赭石
  accent: '#C4956A',        // 骆驼棕
  
  // 背景色
  background: '#FAF6F1',    // 暖米白
  backgroundAlt: '#F5EDE3', // 浅奶油
  card: '#FFFFFF',          // 纯白卡片
  cardHover: '#FFFDF9',     // 卡片悬停
  
  // 文字色
  text: '#2C1810',         // 深褐
  textSecondary: '#6B5344', // 中褐
  textMuted: '#9A8677',    // 浅褐
  
  // 边框
  border: '#E8DFD5',        // 暖灰边框
  borderLight: '#F0E8DE',   // 浅边框
  
  // 状态色
  success: '#4A7C59',       // 墨绿
  warning: '#C4883A',       // 琥珀
  error: '#A65D4E',         // 砖红
  info: '#5B7B8C',          // 青灰
  
  // 状态标签
  status: {
    reviewing: '#E8A54B',   // 审稿中 - 橙
    accepted: '#4A7C59',    // 已录用 - 绿
    revising: '#D4A03A',    // 修改中 - 黄
    pending: '#7B5AA6',     // 待投稿 - 紫
    draft: '#8B9AA3',       // 草稿 - 灰
  },
};

export const fonts = {
  // 标题字体 (衬线)
  heading: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
  // 正文字体 (无衬线)
  body: '"DM Sans", "Noto Sans SC", -apple-system, sans-serif',
  // 等宽字体
  mono: '"JetBrains Mono", "Fira Code", monospace',
};

export const shadows = {
  sm: '0 1px 2px rgba(44, 24, 16, 0.05)',
  md: '0 4px 12px rgba(44, 24, 16, 0.08)',
  lg: '0 8px 24px rgba(44, 24, 16, 0.12)',
  xl: '0 12px 40px rgba(44, 24, 16, 0.16)',
};

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export default {
  colors,
  fonts,
  shadows,
  radius,
  spacing,
};
