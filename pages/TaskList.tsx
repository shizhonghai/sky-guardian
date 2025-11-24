
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/store';
import { ArrowLeft, ClipboardList, ShieldCheck, Wrench, Bell, CheckSquare, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { todos, user } = useApp();

  // Initialize state from navigation state if available
  const initialState = location.state as { tab?: 'TODO' | 'DONE' | 'CREATED', filter?: 'ALL' | 'PATROL' | 'ISSUE' | 'ALARM_REVIEW' } | null;

  const [activeTab, setActiveTab] = useState<'TODO' | 'DONE' | 'CREATED'>(initialState?.tab || 'TODO');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PATROL' | 'ISSUE' | 'ALARM_REVIEW'>(initialState?.filter || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Count active todos by type
  const openTodos = todos.filter(t => t.status === 'OPEN');
  const counts = {
    PATROL: openTodos.filter(t => t.type === 'PATROL').length,
    ISSUE: openTodos.filter(t => t.type === 'ISSUE').length,
    ALARM_REVIEW: openTodos.filter(t => t.type === 'ALARM_REVIEW').length,
  };

  // Filter logic
  const listData = todos.filter(t => {
      // 1. Status Filter
      if (activeTab === 'TODO' && t.status !== 'OPEN') return false;
      if (activeTab === 'DONE' && t.status !== 'DONE') return false;
      if (activeTab === 'CREATED' && t.initiator !== user?.name && t.initiator !== '当前用户') return false;

      // 2. Category Filter
      if (categoryFilter !== 'ALL' && t.type !== categoryFilter) return false;

      // 3. Search Term
      if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
  });

  const getPriorityLabel = (p: string) => {
    switch(p) {
      case 'HIGH': return { text: '高急', color: 'bg-red-500 text-white' };
      case 'MEDIUM': return { text: '中等', color: 'bg-orange-500 text-white' };
      default: return { text: '普通', color: 'bg-blue-500 text-white' };
    }
  };

  const getTypeLabel = (t: string) => {
    switch(t) {
      case 'PATROL': return '现场巡护';
      case 'ISSUE': return '巡护问题';
      case 'ALARM_REVIEW': return '报警问题';
      case 'FIRE_SAFETY': return '消防隐患';
      default: return '其他任务';
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-safe relative">
      {/* Header - Ensure high Z-Index and proper background */}
      <div className="p-4 bg-blue-950/60 backdrop-blur-md sticky top-0 z-40 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
           <button 
             onClick={handleBack} 
             className="p-2 -ml-2 text-slate-400 hover:text-white cursor-pointer"
             aria-label="返回工作台"
           >
             <ArrowLeft size={24} />
           </button>
           <h1 className="text-xl font-bold text-white">任务列表</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="搜索工单标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/60 backdrop-blur-sm text-white pl-9 pr-4 py-2.5 rounded-lg border border-slate-700/50 focus:outline-none focus:border-blue-500 text-sm"
            />
        </div>

        {/* Level 1 Tabs */}
        <div className="flex p-1 bg-slate-900/50 rounded-lg">
            <button 
              onClick={() => { setActiveTab('TODO'); setCategoryFilter('ALL'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'TODO' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                待办 ({openTodos.length})
            </button>
            <button 
              onClick={() => setActiveTab('DONE')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'DONE' ? 'bg-slate-700/80 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                已办 ({todos.filter(t => t.status === 'DONE').length})
            </button>
            <button 
              onClick={() => setActiveTab('CREATED')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'CREATED' ? 'bg-slate-700/80 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                我发起的
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 z-0">
         {/* Level 2 Quick Filters (Only for TODO) */}
         {activeTab === 'TODO' && (
           <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => setCategoryFilter('PATROL')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all backdrop-blur-sm ${categoryFilter === 'PATROL' ? 'bg-indigo-900/40 border-indigo-500 shadow-md' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'}`}
              >
                  <ShieldCheck size={18} className={categoryFilter === 'PATROL' ? 'text-indigo-400' : 'text-slate-400'} />
                  <span className={`text-[10px] mt-1 font-medium ${categoryFilter === 'PATROL' ? 'text-indigo-200' : 'text-slate-400'}`}>现场巡护</span>
                  <span className="text-xs font-bold text-white mt-0.5">{counts.PATROL}</span>
              </button>

              <button 
                onClick={() => setCategoryFilter('ISSUE')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all backdrop-blur-sm ${categoryFilter === 'ISSUE' ? 'bg-orange-900/40 border-orange-500 shadow-md' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'}`}
              >
                  <Wrench size={18} className={categoryFilter === 'ISSUE' ? 'text-orange-400' : 'text-slate-400'} />
                  <span className={`text-[10px] mt-1 font-medium ${categoryFilter === 'ISSUE' ? 'text-orange-200' : 'text-slate-400'}`}>巡护问题</span>
                  <span className="text-xs font-bold text-white mt-0.5">{counts.ISSUE}</span>
              </button>

              <button 
                onClick={() => setCategoryFilter('ALARM_REVIEW')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all backdrop-blur-sm ${categoryFilter === 'ALARM_REVIEW' ? 'bg-red-900/40 border-red-500 shadow-md' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'}`}
              >
                  <Bell size={18} className={categoryFilter === 'ALARM_REVIEW' ? 'text-red-400' : 'text-slate-400'} />
                  <span className={`text-[10px] mt-1 font-medium ${categoryFilter === 'ALARM_REVIEW' ? 'text-red-200' : 'text-slate-400'}`}>报警问题</span>
                  <span className="text-xs font-bold text-white mt-0.5">{counts.ALARM_REVIEW}</span>
              </button>
           </div>
        )}

        {/* Filter Reset Indicator */}
        {activeTab === 'TODO' && categoryFilter !== 'ALL' && (
            <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-xs text-blue-400">正在筛选: {getTypeLabel(categoryFilter)}</span>
                <button onClick={() => setCategoryFilter('ALL')} className="text-xs text-slate-400 hover:text-white">清除筛选</button>
            </div>
        )}

        {/* List */}
        <div className="space-y-3 pb-20">
          {listData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-800/20 rounded-xl border border-white/5 border-dashed">
                <CheckSquare size={48} className="mb-4 opacity-30"/>
                <p>暂无相关工单</p>
              </div>
          ) : (
            listData.map(todo => {
                const priorityStyle = getPriorityLabel(todo.priority);
                return (
                <div 
                    key={todo.id} 
                    onClick={() => navigate(`/issues/${todo.id}`)}
                    className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl border border-white/5 shadow-sm active:bg-slate-700/80 transition-colors cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white leading-tight flex-1 mr-2 group-hover:text-blue-400 transition-colors">{todo.title}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold flex-shrink-0 ${priorityStyle.color}`}>
                            {priorityStyle.text}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-3">
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-900/40 text-slate-300 px-2 py-0.5 rounded border border-white/10">
                            {getTypeLabel(todo.type)}
                            </span>
                            <span className="text-slate-400">{todo.initiator} 发起</span>
                        </div>
                        <span className="text-slate-400 font-mono">{todo.dueDate}</span>
                    </div>
                </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
