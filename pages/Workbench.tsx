
import React, { useState } from 'react';
import { useApp } from '../context/store';
import { ClipboardList, Car, Flame, Settings, PlayCircle, ShieldCheck, FileText, CheckSquare, Bell, Wrench, ChevronRight, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Workbench: React.FC = () => {
  const navigate = useNavigate();
  const { todos, user } = useApp();
  const [activeTab, setActiveTab] = useState<'TODO' | 'DONE' | 'CREATED'>('TODO');

  // Count active todos by type
  const openTodos = todos.filter(t => t.status === 'OPEN');
  const counts = {
    PATROL: openTodos.filter(t => t.type === 'PATROL').length,
    ISSUE: openTodos.filter(t => t.type === 'ISSUE').length,
    ALARM_REVIEW: openTodos.filter(t => t.type === 'ALARM_REVIEW').length,
  };

  // Simplified List Logic for Preview (Top 3)
  const listData = todos.filter(t => {
      if (activeTab === 'TODO' && t.status !== 'OPEN') return false;
      if (activeTab === 'DONE' && t.status !== 'DONE') return false;
      if (activeTab === 'CREATED' && t.initiator !== user?.name && t.initiator !== '当前用户') return false;
      return true;
  });

  const previewList = listData.slice(0, 3);

  const modules = [
    { name: '车辆布控', icon: <Car size={24} className="text-blue-400" />, path: '/vehicles', color: 'bg-slate-800/40' },
    { name: '消防监测', icon: <Flame size={24} className="text-orange-400" />, path: '/fire-safety', color: 'bg-slate-800/40' },
    { name: '影像中心', icon: <Film size={24} className="text-purple-400" />, path: '/media', color: 'bg-slate-800/40' },
    { name: '统计报表', icon: <FileText size={24} className="text-teal-400" />, path: '/reports', color: 'bg-slate-800/40' },
  ];

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

  const navigateToTaskList = (filter?: 'PATROL' | 'ISSUE' | 'ALARM_REVIEW') => {
      navigate('/tasks', { state: { tab: activeTab, filter: filter || 'ALL' } });
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-32 p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-6 drop-shadow-md">工作台</h1>

      {/* Task Center - Glass Card */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-lg border border-white/10 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-400" /> 任务中心
          </h2>
        </div>

        {/* Level 1 Tabs */}
        <div className="flex p-1 bg-slate-900/50 rounded-lg mb-4">
            <button 
              onClick={() => setActiveTab('TODO')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'TODO' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
            >
                待办 ({openTodos.length})
            </button>
            <button 
              onClick={() => setActiveTab('DONE')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'DONE' ? 'bg-slate-700/80 text-white shadow' : 'text-slate-400'}`}
            >
                已办 ({todos.filter(t => t.status === 'DONE').length})
            </button>
            <button 
              onClick={() => setActiveTab('CREATED')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'CREATED' ? 'bg-slate-700/80 text-white shadow' : 'text-slate-400'}`}
            >
                我发起的
            </button>
        </div>

        {/* Level 2 Quick Filters (Only for TODO) */}
        {activeTab === 'TODO' && (
           <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => navigateToTaskList('PATROL')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border bg-slate-700/20 border-white/5 hover:bg-slate-700/40 transition-all active:scale-95 backdrop-blur-sm"
              >
                  <ShieldCheck size={18} className="text-indigo-400" />
                  <span className="text-[10px] mt-1 font-medium text-slate-300">现场巡护</span>
                  <span className="text-xs font-bold text-white mt-0.5">{counts.PATROL}</span>
              </button>

              <button 
                onClick={() => navigateToTaskList('ISSUE')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border bg-slate-700/20 border-white/5 hover:bg-slate-700/40 transition-all active:scale-95 backdrop-blur-sm"
              >
                  <Wrench size={18} className="text-orange-400" />
                  <span className="text-[10px] mt-1 font-medium text-slate-300">巡护问题</span>
                  <span className="text-xs font-bold text-white mt-0.5">{counts.ISSUE}</span>
              </button>

              <button 
                onClick={() => navigateToTaskList('ALARM_REVIEW')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border bg-slate-700/20 border-white/5 hover:bg-slate-700/40 transition-all active:scale-95 backdrop-blur-sm"
              >
                  <Bell size={18} className="text-red-400" />
                  <span className="text-xs mt-1 font-medium text-slate-300">报警问题</span>
                  <span className="text-xs font-bold text-white mt-0.5">{counts.ALARM_REVIEW}</span>
              </button>
           </div>
        )}

        {/* Task List Preview (Max 3 items, no scroll) */}
        <div className="space-y-3">
          {previewList.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-900/30 rounded-lg border border-white/5 border-dashed">
                <CheckSquare size={24} className="mx-auto mb-2 opacity-50"/>
                暂无工单
              </div>
          ) : (
            previewList.map(todo => {
                const priorityStyle = getPriorityLabel(todo.priority);
                return (
                <div 
                    key={todo.id} 
                    onClick={() => navigate(`/issues/${todo.id}`)}
                    className="bg-slate-700/40 p-3 rounded-xl border border-white/5 shadow-sm active:bg-slate-600/50 transition-colors cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white leading-tight flex-1 mr-2 group-hover:text-blue-400 transition-colors line-clamp-1">{todo.title}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold flex-shrink-0 ${priorityStyle.color}`}>
                            {priorityStyle.text}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-900/40 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                            {getTypeLabel(todo.type)}
                            </span>
                            <span className="text-slate-400">{todo.initiator}</span>
                        </div>
                        <span className="text-slate-300 font-mono">{todo.dueDate.split(' ')[0]}</span>
                    </div>
                </div>
                );
            })
          )}
        </div>

        {/* View All Button */}
        <button 
            onClick={() => navigateToTaskList()} 
            className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-xs text-blue-400 font-medium hover:text-blue-300 border-t border-white/5 pt-3 transition-colors"
        >
            查看全部待办 <ChevronRight size={12} />
        </button>
      </div>

      {/* Functional Modules */}
      <h3 className="text-slate-300 text-sm font-semibold mb-4 uppercase tracking-wider pl-1 drop-shadow">快捷功能</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {modules.map((mod) => (
          <button 
            key={mod.name}
            onClick={() => navigate(mod.path)}
            className={`${mod.color} backdrop-blur-sm p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-white/10 shadow-lg active:scale-95 transition-transform min-h-[110px] hover:bg-slate-700/50`}
          >
            <div className="bg-slate-900/50 p-3 rounded-full ring-1 ring-white/10 shadow-inner">
              {mod.icon}
            </div>
            <span className="text-slate-200 text-sm font-medium tracking-wide">{mod.name}</span>
          </button>
        ))}
      </div>

      {/* Settings Shortcut */}
      <div className="mt-auto">
         <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl text-slate-300 border border-white/10 active:bg-slate-700/50 shadow-sm transition-colors">
           <span className="flex items-center gap-3 font-medium"><Settings size={20} className="text-slate-400" /> 系统设置</span>
           <span className="text-xs text-slate-400 bg-black/20 px-2 py-1 rounded font-mono border border-white/5">v1.1.0</span>
         </button>
      </div>
    </div>
  );
};

export default Workbench;
