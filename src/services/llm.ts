// LLM Service - AI-powered outline generation and optimization
import type { SavedPaper } from '../repositories/papersRepository';

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: '',
  baseUrl: 'https://api.minimax.chat/v1',
  model: 'MiniMax-M2.5',
};

let config: LLMConfig = { ...DEFAULT_CONFIG };

export const llmService = {
  configure(newConfig: Partial<LLMConfig>) {
    config = { ...config, ...newConfig };
  },

  getConfig(): LLMConfig {
    return { ...config };
  },

  isConfigured(): boolean {
    return !!config.apiKey;
  },

  async generateOutlineFromPapers(
    papers: SavedPaper[],
    targetConference: string,
    templateType: 'standard' | 'security' | 'ai' | 'short' = 'standard'
  ): Promise<{ sections: string[]; suggestions: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('LLM API 未配置，请在设置中配置 API Key');
    }

    const papersSummary = papers
      .slice(0, 5)
      .map((p) => `- ${p.title} (${p.authors.join(', ')})`)
      .join('\n');

    const templateNames: Record<string, string> = {
      standard: '标准学术论文结构',
      security: '安全/区块链论文结构',
      ai: 'AI/ML 论文结构',
      short: '短论文结构',
    };

    const prompt = `你是一个学术论文写作助手。请根据以下收藏的论文，为一篇面向 ${targetConference} 的学术论文生成大纲建议。

参考论文：
${papersSummary}

模板类型：${templateNames[templateType]}

请生成：
1. 推荐的大纲章节列表（基于 ${templateNames[templateType]}）
2. 每个章节的写作建议

请以 JSON 格式返回：
{
  "sections": ["章节1", "章节2", ...],
  "suggestions": ["建议1", "建议2", ...]
}`;

    return this.chat(prompt);
  },

  async optimizeOutline(
    currentOutline: string[],
    paperAbstract?: string,
    targetConference?: string
  ): Promise<{ optimizedSections: string[]; improvements: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('LLM API 未配置，请在设置中配置 API Key');
    }

    const prompt = `你是一个学术论文写作助手。请优化以下论文大纲。

当前大纲：
${currentOutline.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${paperAbstract ? `论文摘要：\n${paperAbstract}\n` : ''}
${targetConference ? `目标会议：${targetConference}` : ''}

请提供优化建议并返回优化后的大纲。请以 JSON 格式返回：
{
  "optimizedSections": ["优化后的章节1", "优化后的章节2", ...],
  "improvements": ["改进点1", "改进点2", ...]
}`;

    return this.chat(prompt);
  },

  async generateSectionContent(
    sectionTitle: string,
    relatedPapers: SavedPaper[],
    context?: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('LLM API 未配置，请在设置中配置 API Key');
    }

    const papersInfo = relatedPapers
      .slice(0, 3)
      .map((p) => `${p.title}: ${p.abstract?.slice(0, 200) || '无摘要'}`)
      .join('\n\n');

    const prompt = `你是一个学术论文写作助手。请为以下章节提供写作指导和内容建议。

章节标题：${sectionTitle}

相关论文参考：
${papersInfo}

${context ? `额外上下文：\n${context}` : ''}

请提供：
1. 本章节应该包含的核心内容要点
2. 写作建议和注意事项
3. 推荐引用的内容

请以结构化的方式返回建议。`;

    const result = await this.chat(prompt);
    return result.suggestions?.join('\n') || '';
  },

  async chat(prompt: string): Promise<any> {
    if (!config.apiKey) {
      throw new Error('API Key 未设置');
    }

    const response = await fetch(`${config.baseUrl}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学术论文写作助手，擅长生成论文大纲、提供写作建议和优化论文结构。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API 请求失败: ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('LLM API 返回内容为空');
    }

    // Try to parse JSON from the response
    try {
      // Handle potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      // If not JSON, return the raw content
      return { raw: content, suggestions: [content] };
    }
  },
};

// Mock LLM for demo purposes (when no API key is configured)
export const mockLLMService = {
  async generateOutlineFromPapers(
    _papers: SavedPaper[],
    targetConference: string,
    templateType: 'standard' | 'security' | 'ai' | 'short' = 'standard'
  ): Promise<{ sections: string[]; suggestions: string[] }> {
    const templates = {
      standard: ['Abstract', 'Introduction', 'Background', 'Related Work', 'Methodology', 'Experiment', 'Discussion', 'Conclusion', 'References'],
      security: ['Abstract', 'Introduction', 'Preliminaries', 'System Model', 'Threat Model', 'Proposed Scheme', 'Security Analysis', 'Performance Evaluation', 'Conclusion', 'References'],
      ai: ['Abstract', 'Introduction', 'Related Work', 'Method', 'Experiments', 'Results', 'Discussion', 'Conclusion', 'Appendix'],
      short: ['Abstract', 'Introduction', 'Technical Approach', 'Experiments', 'Conclusion', 'References'],
    };

    return {
      sections: templates[templateType],
      suggestions: [
        '基于收藏论文的研究方向生成',
        `适用于 ${targetConference} 的标准结构`,
        '建议优先完成方法论和实验部分',
      ],
    };
  },

  async optimizeOutline(
    currentOutline: string[],
    _paperAbstract?: string,
    _targetConference?: string
  ): Promise<{ optimizedSections: string[]; improvements: string[] }> {
    return {
      optimizedSections: currentOutline,
      improvements: [
        '当前大纲结构合理',
        '建议增加 Related Work 章节以展示研究背景',
        '考虑将实验部分拆分为实验设置和结果分析',
      ],
    };
  },

  async generateSectionContent(
    sectionTitle: string,
    _relatedPapers: SavedPaper[],
    _context?: string
  ): Promise<string> {
    const suggestions: Record<string, string> = {
      'Abstract': '简要概括研究问题、方法和主要贡献，150-250字',
      'Introduction': '介绍研究背景、动机和主要贡献，阐明研究意义',
      'Related Work': '总结相关研究，指出现有工作的不足',
      'Methodology': '详细描述提出的方法和技术方案',
      'Experiment': '设计实验方案，说明实验设置和评估指标',
      'Conclusion': '总结主要贡献和未来工作',
    };

    return suggestions[sectionTitle] || `撰写 ${sectionTitle} 章节的核心内容和要点`;
  },
};
