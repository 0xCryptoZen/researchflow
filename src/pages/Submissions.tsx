import { useState } from 'react';
import { type Submission, submissionsRepository } from '../repositories/submissionsRepository';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    return submissionsRepository.getAll();
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredSubmissions = submissions.filter(
    sub => filterStatus === 'all' || sub.status === filterStatus
  );

  const addSubmission = (submission: Omit<Submission, 'id' | 'timeline'>) => {
    submissionsRepository.add(submission);
    setSubmissions(submissionsRepository.getAll());
    setShowAddModal(false);
  };

  const updateStatus = (id: string, status: Submission['status']) => {
    submissionsRepository.updateStatus(id, status);
    setSubmissions(submissionsRepository.getAll());
  };

  const deleteSubmission = (id: string) => {
    submissionsRepository.deleteById(id);
    setSubmissions(submissionsRepository.getAll());
  };

  const getStatusLabel = (status: Submission['status']) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      submitted: '已投稿',
      under_review: '审稿中',
      accepted: '已接收',
      rejected: '被拒稿',
      published: '已发表',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: Submission['status']) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      published: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投稿进度追踪</h1>
          <p className="text-gray-600 mt-1">{submissions.length} 篇论文投稿记录</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ➕ 添加投稿
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">所有状态</option>
          <option value="draft">草稿</option>
          <option value="submitted">已投稿</option>
          <option value="under_review">审稿中</option>
          <option value="accepted">已接收</option>
          <option value="rejected">被拒稿</option>
          <option value="published">已发表</option>
        </select>
      </div>

      {/* 投稿列表 */}
      <div className="space-y-4">
        {filteredSubmissions.map(sub => (
          <div key={sub.id} className="bg-white rounded-lg border p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(sub.status)}`}>
                    {getStatusLabel(sub.status)}
                  </span>
                  <span className="text-gray-500 text-sm">{sub.venue}</span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900">{sub.paperTitle}</h3>
              </div>
              <div className="flex gap-2">
                <select
                  value={sub.status}
                  onChange={(e) => updateStatus(sub.id, e.target.value as Submission['status'])}
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value="draft">草稿</option>
                  <option value="submitted">已投稿</option>
                  <option value="under_review">审稿中</option>
                  <option value="accepted">已接收</option>
                  <option value="rejected">被拒稿</option>
                  <option value="published">已发表</option>
                </select>
                <button
                  onClick={() => deleteSubmission(sub.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* 时间线 */}
            {sub.timeline.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">投稿时间线</h4>
                <div className="space-y-2">
                  {sub.timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      <div>
                        <span className="text-gray-500">{event.date}</span>
                        <span className="mx-2">-</span>
                        <span className="text-gray-900">{event.status}</span>
                        {event.note && <span className="text-gray-500">({event.note})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-4">📝</p>
          <p>暂无投稿记录</p>
          <button onClick={() => setShowAddModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            添加投稿
          </button>
        </div>
      )}

      {showAddModal && <AddModal onAdd={addSubmission} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddModal({ onAdd, onClose }: { onAdd: (sub: Omit<Submission, 'id' | 'timeline'>) => void; onClose: () => void }) {
  const [form, setForm] = useState({ paperTitle: '', venue: '', venueType: 'conference' as const, status: 'draft' as const, notes: '' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">添加投稿记录</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">论文标题</label>
            <input type="text" value={form.paperTitle} onChange={e => setForm({...form, paperTitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">目标期刊/会议</label>
            <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">取消</button>
            <button onClick={() => form.paperTitle && form.venue && onAdd(form)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">添加</button>
          </div>
        </div>
      </div>
    </div>
  );
}
