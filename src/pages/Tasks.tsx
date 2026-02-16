import { useState, useEffect } from 'react';
import { type Task, tasksRepository } from '../repositories/tasksRepository';
import { papersRepository } from '../repositories/papersRepository';
import { conferencesRepository } from '../repositories/conferencesRepository';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as Task['priority'], 
    dueDate: '',
    relatedPaperId: '',
    relatedConferenceId: ''
  });

  useEffect(() => {
    setTasks(tasksRepository.getAll());
  }, []);

  const refreshTasks = () => setTasks(tasksRepository.getAll());

  const addTask = () => {
    if (!newTask.title.trim()) return;
    tasksRepository.add({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      relatedPaperId: newTask.relatedPaperId || undefined,
      relatedConferenceId: newTask.relatedConferenceId || undefined,
    });
    refreshTasks();
    setShowAddForm(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', relatedPaperId: '', relatedConferenceId: '' });
  };

  const updateTask = () => {
    if (!editingTask) return;
    tasksRepository.update(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate || undefined,
      relatedPaperId: editingTask.relatedPaperId || undefined,
      relatedConferenceId: editingTask.relatedConferenceId || undefined,
    });
    refreshTasks();
    setEditingTask(null);
  };

  const updateStatus = (id: string, status: Task['status']) => {
    tasksRepository.updateStatus(id, status);
    refreshTasks();
  };

  const deleteTask = (id: string) => {
    tasksRepository.deleteById(id);
    refreshTasks();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // 获取关联的论文/会议标题
  const getPaperTitle = (id?: string) => {
    if (!id) return null;
    return papersRepository.getAll().find(p => p.id === id)?.title || null;
  };

  const getConferenceName = (id?: string) => {
    if (!id) return null;
    return conferencesRepository.getAll().find(c => c.id === id)?.name || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">任务管理</h1>
          <p className="text-slate-600">{tasks.length} 个任务 · {tasks.filter(t => t.status === 'completed').length} 已完成</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 添加任务
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'todo', 'in-progress', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? '全部' : f === 'todo' ? '待办' : f === 'in-progress' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingTask) && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-3">{editingTask ? '编辑任务' : '添加新任务'}</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="任务标题"
              value={editingTask ? editingTask.title : newTask.title}
              onChange={e => editingTask ? setEditingTask({...editingTask, title: e.target.value}) : setNewTask({...newTask, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <textarea
              placeholder="任务描述（可选）"
              value={editingTask ? editingTask.description : newTask.description}
              onChange={e => editingTask ? setEditingTask({...editingTask, description: e.target.value}) : setNewTask({...newTask, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editingTask ? editingTask.priority : newTask.priority}
                onChange={e => editingTask ? setEditingTask({...editingTask, priority: e.target.value as Task['priority']}) : setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
              <input
                type="date"
                value={editingTask ? (editingTask.dueDate || '') : newTask.dueDate}
                onChange={e => editingTask ? setEditingTask({...editingTask, dueDate: e.target.value}) : setNewTask({...newTask, dueDate: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            {/* 关联论文/会议 */}
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editingTask ? (editingTask.relatedPaperId || '') : newTask.relatedPaperId}
                onChange={e => editingTask ? setEditingTask({...editingTask, relatedPaperId: e.target.value || undefined}) : setNewTask({...newTask, relatedPaperId: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">关联论文（可选）</option>
                {papersRepository.getAll().map(p => (
                  <option key={p.id} value={p.id}>{p.title.substring(0, 30)}...</option>
                ))}
              </select>
              <select
                value={editingTask ? (editingTask.relatedConferenceId || '') : newTask.relatedConferenceId}
                onChange={e => editingTask ? setEditingTask({...editingTask, relatedConferenceId: e.target.value || undefined}) : setNewTask({...newTask, relatedConferenceId: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">关联会议（可选）</option>
                {conferencesRepository.getAll().map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {editingTask ? (
                <>
                  <button onClick={updateTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg">保存</button>
                  <button onClick={() => setEditingTask(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">取消</button>
                </>
              ) : (
                <>
                  <button onClick={addTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg">添加</button>
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">取消</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">暂无任务</div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                    task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-green-500'
                  }`}
                >
                  {task.status === 'completed' && '✓'}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      task.status === 'completed' ? 'bg-slate-100 text-slate-500' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.status === 'todo' ? '待办' : task.status === 'in-progress' ? '进行中' : '已完成'}
                    </span>
                  </div>
                  
                  <h3 className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </h3>
                  
                  {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
                  
                  {/* 关联显示 */}
                  <div className="flex gap-3 mt-2">
                    {task.relatedPaperId && (
                      <a href={`/papers?paper=${task.relatedPaperId}`} className="text-xs text-blue-600 hover:underline">
                        📄 {getPaperTitle(task.relatedPaperId)?.substring(0, 25)}...
                      </a>
                    )}
                    {task.relatedConferenceId && (
                      <a href={`/conferences?conf=${task.relatedConferenceId}`} className="text-xs text-purple-600 hover:underline">
                        📅 {getConferenceName(task.relatedConferenceId)}
                      </a>
                    )}
                  </div>
                  
                  {task.dueDate && <p className="text-sm text-slate-500 mt-2">截止: {task.dueDate}</p>}
                </div>
                
                <div className="flex gap-1">
                  {task.status !== 'completed' && task.status !== 'in-progress' && (
                    <button onClick={() => updateStatus(task.id, 'in-progress')} className="p-2 text-slate-400 hover:text-blue-500" title="开始任务">▶</button>
                  )}
                  <button onClick={() => setEditingTask(task)} className="p-2 text-slate-400 hover:text-blue-500" title="编辑">✏️</button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500">🗑</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
