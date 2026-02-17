import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 预定义的 AI 响应模板
const AI_RESPONSES = {
  help: `我可以帮你管理 ResearchFlow：

• 📄 论文 - 添加、查看论文
• ✅ 任务 - 添加任务、查看待办
• 📅 会议 - 添加会议、查看截稿
• 📊 仪表盘 - 查看数据概览

试试说"添加论文"或"查看任务"`,
  
  addPaper: (title: string) => {
    const papers = JSON.parse(localStorage.getItem('researchflow_papers') || '[]');
    const newPaper = {
      id: Date.now().toString(),
      title,
      authors: 'User',
      status: 'saved',
      savedAt: new Date().toISOString(),
    };
    papers.push(newPaper);
    localStorage.setItem('researchflow_papers', JSON.stringify(papers));
    window.dispatchEvent(new Event('storage'));
    return `✅ 已添加论文: "${title}"`;
  },
  
  addTask: (title: string, priority: string = 'medium') => {
    const tasks = JSON.parse(localStorage.getItem('researchflow_tasks') || '[]');
    const newTask = {
      id: Date.now().toString(),
      title,
      priority,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    localStorage.setItem('researchflow_tasks', JSON.stringify(tasks));
    window.dispatchEvent(new Event('storage'));
    return `✅ 已添加任务: "${title}" (优先级: ${priority})`;
  },
  
  addConference: (name: string, deadline: string) => {
    const conferences = JSON.parse(localStorage.getItem('researchflow_conferences') || '[]');
    const newConf = {
      id: Date.now().toString(),
      name,
      deadline,
      createdAt: new Date().toISOString(),
    };
    conferences.push(newConf);
    localStorage.setItem('researchflow_conferences', JSON.stringify(conferences));
    window.dispatchEvent(new Event('storage'));
    return `✅ 已添加会议: "${name}" (截稿: ${deadline})`;
  },
  
  listPapers: () => {
    const papers = JSON.parse(localStorage.getItem('researchflow_papers') || '[]');
    if (papers.length === 0) return '暂无收藏论文';
    return '📄 你的论文:\n' + papers.slice(0, 5).map((p: any) => `• ${p.title}`).join('\n');
  },
  
  listTasks: () => {
    const tasks = JSON.parse(localStorage.getItem('researchflow_tasks') || '[]');
    if (tasks.length === 0) return '暂无任务';
    return '✅ 你的任务:\n' + tasks.slice(0, 5).map((t: any) => `• ${t.title} [${t.status}]`).join('\n');
  },
  
  listConferences: () => {
    const conferences = JSON.parse(localStorage.getItem('researchflow_conferences') || '[]');
    if (conferences.length === 0) return '暂无会议';
    return '📅 你的会议:\n' + conferences.slice(0, 5).map((c: any) => `• ${c.name} (${c.deadline})`).join('\n');
  },
  
  dashboard: () => {
    const papers = JSON.parse(localStorage.getItem('researchflow_papers') || '[]');
    const tasks = JSON.parse(localStorage.getItem('researchflow_tasks') || '[]');
    const conferences = JSON.parse(localStorage.getItem('researchflow_conferences') || '[]');
    return `📊 仪表盘摘要:

• 论文: ${papers.length} 篇
• 任务: ${tasks.length} 个 (${tasks.filter((t: any) => t.status !== 'completed').length} 待完成)
• 会议: ${conferences.length} 个`;
  },
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '你好！我是 ResearchFlow AI 助手 🤖\n\n可以帮你:\n• 添加论文/任务/会议\n• 查看数据概览\n• 管理你的研究工作\n\n试试说"添加任务"或"查看论文"', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processMessage = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // 帮助
    if (lowerText.includes('帮助') || lowerText.includes('help') || lowerText === '?') {
      return AI_RESPONSES.help;
    }
    
    // 仪表盘
    if (lowerText.includes('仪表盘') || lowerText.includes('概览') || lowerText.includes('dashboard')) {
      return AI_RESPONSES.dashboard();
    }
    
    // 查看论文
    if ((lowerText.includes('查看论文') || lowerText.includes('论文列表')) && !lowerText.includes('添加')) {
      return AI_RESPONSES.listPapers();
    }
    
    // 添加论文
    if (lowerText.includes('添加论文') || lowerText.includes('添加 paper')) {
      const titleMatch = text.match(/[:：]\s*["']?([^"']+)["']?/);
      const title = titleMatch ? titleMatch[1].trim() : text.replace(/添加论文|添加 paper/gi, '').trim();
      if (title) return AI_RESPONSES.addPaper(title);
      return '请提供论文标题，例如: 添加论文: 我的新论文';
    }
    
    // 查看任务
    if (lowerText.includes('查看任务') || lowerText.includes('任务列表') && !lowerText.includes('添加')) {
      return AI_RESPONSES.listTasks();
    }
    
    // 添加任务
    if (lowerText.includes('添加任务') || lowerText.includes('添加 todo')) {
      const titleMatch = text.match(/[:：]\s*["']?([^"']+)["']?/);
      const priorityMatch = text.match(/(高|中|低|high|medium|low)/i);
      const title = titleMatch ? titleMatch[1].trim() : text.replace(/添加任务|添加 todo/gi, '').trim();
      const priority = priorityMatch ? (priorityMatch[1].includes('高') || priorityMatch[1].toLowerCase().includes('high') ? 'high' : priorityMatch[1].includes('低') || priorityMatch[1].toLowerCase().includes('low') ? 'low' : 'medium') : 'medium';
      if (title) return AI_RESPONSES.addTask(title, priority);
      return '请提供任务标题，例如: 添加任务: 完成论文初稿';
    }
    
    // 查看会议
    if ((lowerText.includes('查看会议') || lowerText.includes('会议列表')) && !lowerText.includes('添加')) {
      return AI_RESPONSES.listConferences();
    }
    
    // 添加会议
    if (lowerText.includes('添加会议') || lowerText.includes('添加 conference')) {
      const nameMatch = text.match(/名称?[:：]\s*["']?([^"']+)["']?/);
      const deadlineMatch = text.match(/(截稿|截止|deadline)[:：]?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
      const name = nameMatch ? nameMatch[1].trim() : text.replace(/添加会议|添加 conference/gi, '').split(/截稿|截止|deadline/i)[0].trim();
      const deadline = deadlineMatch ? deadlineMatch[2] : null;
      if (name) {
        if (deadline) return AI_RESPONSES.addConference(name, deadline);
        return AI_RESPONSES.addConference(name, '2026-12-31');
      }
      return '请提供会议名称，例如: 添加会议: IEEE S&P 2026';
    }
    
    // 默认响应
    return `我理解你想说: "${text}"\n\n可以尝试:\n• "添加论文: 标题"\n• "添加任务: 标题"\n• "添加会议: 名称"\n• "查看论文"\n• "查看任务"\n• "仪表盘"`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // 模拟 AI 响应延迟
    setTimeout(() => {
      const response = processMessage(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 聊天按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-50 transition-transform hover:scale-110"
      >
        💬
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-white rounded-xl shadow-2xl border flex flex-col z-50">
          {/* 头部 */}
          <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="font-semibold">ResearchFlow AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">✕</button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <pre className="whitespace-pre-wrap text-sm font-sans">{msg.content}</pre>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <span className="text-gray-400 text-sm">正在输入...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (回车发送)"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
