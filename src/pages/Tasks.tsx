import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  paperId?: string;
  conferenceId?: string;
  createdAt: string;
  completedAt?: string;
}

const STORAGE_KEY = 'researchflow_tasks';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as 'medium' | 'high' | 'low', dueDate: '' });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      createdAt: new Date().toISOString(),
    };
    
    saveTasks([...tasks, task]);
    setShowAddForm(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
  };

  const updateStatus = (id: string, status: Task['status']) => {
    saveTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
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
              filter === f 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? '全部' : f === 'todo' ? '待办' : f === 'in-progress' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-3">添加新任务</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="任务标题"
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <textarea
              placeholder="任务描述（可选）"
              value={newTask.description}
              onChange={e => setNewTask({...newTask, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="high">高优先级</option>
                <option value="medium">中优先级</option>
                <option value="low">低优先级</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addTask} className="px-4 py-2 bg-blue-600 text-white rounded-lg">添加</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            暂无任务
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updateStatus(
                    task.id, 
                    task.status === 'completed' ? 'todo' : 'completed'
                  )}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                    task.status === 'completed' 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 hover:border-green-500'
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
                  
                  <h3 className={`font-medium ${
                    task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                  )}
                  
                  {task.dueDate && (
                    <p className="text-sm text-slate-500 mt-2">
                      截止: {task.dueDate}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-1">
                  {task.status !== 'completed' && task.status !== 'in-progress' && (
                    <button
                      onClick={() => updateStatus(task.id, 'in-progress')}
                      className="p-2 text-slate-400 hover:text-blue-500"
                      title="开始任务"
                    >
                      ▶
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
