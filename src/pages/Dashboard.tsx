import { useState } from 'react';
import type { Task, Conference } from '../types';

export default function Dashboard() {
  const [tasks] = useState<Task[]>([
    { id: '1', title: 'Read paper: LTRAS', status: 'in-progress', priority: 'high', createdAt: '2026-02-15' },
    { id: '2', title: 'Write literature review', status: 'todo', priority: 'medium', dueDate: '2026-02-20', createdAt: '2026-02-14' },
    { id: '3', title: 'Submit to arXiv', status: 'todo', priority: 'low', createdAt: '2026-02-10' },
  ]);

  const [conferences] = useState<Conference[]>([
    { id: '1', name: 'Eurocrypt 2026', shortName: 'Eurocrypt', year: 2026, deadline: '2026-05-06', category: 'blockchain', website: '' },
    { id: '2', name: 'IEEE Blockchain 2026', shortName: 'IEEE Blockchain', year: 2026, deadline: '2026-07-15', category: 'blockchain', website: '' },
    { id: '3', name: 'ACM CCS 2026', shortName: 'CCS', year: 2026, deadline: '2026-05-01', category: 'security', website: '' },
  ]);

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">156</div>
          <div className="text-sm text-slate-500">Papers Collected</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">{tasks.filter(t => t.status === 'todo').length}</div>
          <div className="text-sm text-slate-500">Pending Tasks</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">{conferences.length}</div>
          <div className="text-sm text-slate-500">Target Conferences</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">0</div>
          <div className="text-sm text-slate-500">Papers Submitted</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conference Countdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Conference Deadlines</h2>
          <div className="space-y-3">
            {conferences.map((conf) => {
              const days = getDaysUntil(conf.deadline);
              const isUrgent = days <= 30;
              return (
                <div key={conf.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800">{conf.shortName} {conf.year}</div>
                    <div className="text-sm text-slate-500">{conf.deadline}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {days} days
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300" />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{task.title}</div>
                  {task.dueDate && <div className="text-sm text-slate-500">Due: {task.dueDate}</div>}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Papers */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recommended Papers Today</h2>
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="font-medium text-slate-800">LTRAS: A Linkable Threshold Ring Adaptor Signature Scheme for Efficient and Private Cross-Chain Transactions</div>
            <div className="text-sm text-slate-500 mt-1">Yi Liang, Jinguang Han · arXiv · 2026-02-05</div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">blockchain</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">cryptography</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="font-medium text-slate-800">A Privacy Attack on Monero's Blockchain</div>
            <div className="text-sm text-slate-500 mt-1">BaoJia Houchen, Yucomm Chen · arXiv · 2026-02-14</div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">privacy</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">monero</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
