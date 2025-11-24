import React from 'react';
import { useApp } from '../context/store';
import { ClipboardList, Car, Flame, History, Settings, PlayCircle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Workbench: React.FC = () => {
  const navigate = useNavigate();
  const { todos } = useApp();

  const activeTodos = todos.filter(t => t.status === 'OPEN').length;

  const modules = [
    { name: '车辆布控', icon: <Car size={24} className="text-blue-400" />, path: '/vehicles', color: 'bg-slate-800' },
    { name: '消防监测', icon: <Flame size={24} className="text-orange-400" />, path: '/alarms', color: 'bg-slate-800' },
    { name: '录像回放', icon: <PlayCircle size={24} className="text-purple-400" />, path: '/media', color: 'bg-slate-800' },
    { name: '历史记录', icon: <History size={24} className="text-green-400" />, path: '/alarms', color: 'bg-slate-800' },
    { name: '巡更管理', icon: <ShieldCheck size={24} className="text-indigo-400" />, path: '/', color: 'bg-slate-800' },
    { name: '统计报表', icon: <FileText size={24} className="text-gray-400" />, path: '/', color: 'bg-slate-800' },
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
      case 'PATROL': return '日常巡检';
      case 'ISSUE': return '设备报修';
      case 'ALARM_REVIEW': return '报警复核';
      default: return '其他任务';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 pb-32 p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-6">工作台</h1>

      {/* 待办事项组件 - 高对比度纯色修复版 */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6 shadow-lg border border-slate-700 relative z-10">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-400" /> 待办事项
          </h2>
          <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {activeTodos} 待处理
          </span>
        </div>

        <div className="space-y-3">
          {todos.slice(0, 3).map(todo => {
            const priorityStyle = getPriorityLabel(todo.priority);
            return (
              <div key={todo.id} className="bg-slate-700 p-3 rounded-xl border border-slate-600 shadow-sm active:bg-slate-600 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white leading-tight flex-1 mr-2">{todo.title}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold flex-shrink-0 ${priorityStyle.color}`}>
                        {priorityStyle.text}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                     <div className="flex items-center gap-2">
                        <span className="bg-slate-900/50 text-slate-300 px-2 py-0.5 rounded border border-slate-600">
                          {getTypeLabel(todo.type)}
                        </span>
                     </div>
                     <span className="text-slate-300 font-mono">截止: {todo.dueDate}</span>
                 </div>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-4 py-3 text-center text-xs text-blue-400 font-bold bg-slate-900/50 rounded-lg hover:bg-slate-900 active:bg-black transition-colors flex items-center justify-center gap-1">
           查看全部任务 <ChevronRight size={14} />
        </button>
      </div>

      {/* 功能模块入口 */}
      <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider pl-1">快捷功能</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {modules.map((mod) => (
          <button 
            key={mod.name}
            onClick={() => navigate(mod.path)}
            className={`${mod.color} p-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-slate-700 shadow-md active:scale-95 transition-transform h-28`}
          >
            <div className="bg-slate-900 p-3 rounded-full ring-1 ring-slate-700">
              {mod.icon}
            </div>
            <span className="text-slate-200 text-sm font-medium tracking-wide">{mod.name}</span>
          </button>
        ))}
      </div>

      {/* 快捷系统设置 */}
      <div className="mt-auto">
         <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-xl text-slate-300 border border-slate-700 active:bg-slate-700 shadow-sm">
           <span className="flex items-center gap-3 font-medium"><Settings size={20} className="text-slate-400" /> 系统设置</span>
           <span className="text-xs text-slate-500 bg-black/20 px-2 py-1 rounded font-mono">v1.0.0</span>
         </button>
      </div>
    </div>
  );
};

export default Workbench;