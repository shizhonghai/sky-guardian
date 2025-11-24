
import React, { useState } from 'react';
import { useApp } from '../context/store';
import { AlarmType, AlarmStatus, Alarm } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, AlertTriangle, Filter, ChevronRight, Clock, MapPin, Search, X, Zap, Activity, AlignLeft, Camera, CheckCircle } from 'lucide-react';

const FireSafety: React.FC = () => {
  const navigate = useNavigate();
  const { alarms, todos } = useApp();
  const [activeTab, setActiveTab] = useState<'ALARMS' | 'HAZARDS'>('ALARMS');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [viewingAlarm, setViewingAlarm] = useState<Alarm | null>(null);

  // Filter Data
  const fireAlarms = alarms.filter(a => a.type === AlarmType.FIRE);
  const fireHazards = todos.filter(t => t.type === 'FIRE_SAFETY');

  // Display Lists
  const displayedAlarms = fireAlarms.filter(a => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return a.status !== AlarmStatus.RESOLVED;
    if (statusFilter === 'RESOLVED') return a.status === AlarmStatus.RESOLVED;
    return true;
  });

  const displayedHazards = fireHazards.filter(t => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'PENDING') return t.status === 'OPEN';
      if (statusFilter === 'RESOLVED') return t.status === 'DONE';
      return true;
  });

  return (
    <div className="flex flex-col h-full bg-transparent pb-20 relative">
      {/* Header */}
      <div className="p-4 bg-blue-950/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
           <button onClick={() => navigate(-1)} className="p-1 text-slate-400 hover:text-white"><ArrowLeft /></button>
           <h1 className="text-xl font-bold text-white">消防监测</h1>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-orange-900/30 backdrop-blur-sm border border-orange-700/40 rounded-lg p-3 flex items-center gap-3 shadow-inner">
                <div className="bg-orange-500/20 p-2 rounded-full border border-orange-500/30">
                    <Flame className="text-orange-500" size={20} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white leading-none">{fireAlarms.filter(a => a.status !== 'RESOLVED').length}</div>
                    <div className="text-xs text-orange-200/80 mt-1">今日火警数</div>
                </div>
            </div>
            <div className="bg-yellow-900/30 backdrop-blur-sm border border-yellow-700/40 rounded-lg p-3 flex items-center gap-3 shadow-inner">
                <div className="bg-yellow-500/20 p-2 rounded-full border border-yellow-500/30">
                    <AlertTriangle className="text-yellow-500" size={20} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white leading-none">{fireHazards.filter(t => t.status === 'OPEN').length}</div>
                    <div className="text-xs text-yellow-200/80 mt-1">待整改隐患</div>
                </div>
            </div>
        </div>

        {/* Tabs & Filter */}
        <div className="flex justify-between items-center">
            <div className="flex bg-slate-800/60 backdrop-blur-sm p-1 rounded-lg border border-white/5">
                <button 
                  onClick={() => setActiveTab('ALARMS')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'ALARMS' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    消防报警
                </button>
                <button 
                  onClick={() => setActiveTab('HAZARDS')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'HAZARDS' ? 'bg-yellow-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    消防隐患
                </button>
            </div>
            
            <button 
                onClick={() => setStatusFilter(prev => prev === 'ALL' ? 'PENDING' : prev === 'PENDING' ? 'RESOLVED' : 'ALL')}
                className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-slate-700/50"
            >
                <Filter size={12} />
                {statusFilter === 'ALL' ? '全部状态' : statusFilter === 'PENDING' ? '待处理' : '已解决'}
            </button>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'ALARMS' ? (
              // ------- FIRE ALARMS LIST -------
              displayedAlarms.length === 0 ? (
                  <div className="text-center text-slate-500 py-10 bg-slate-800/20 rounded-xl border border-dashed border-white/5">暂无相关报警记录</div>
              ) : (
                  displayedAlarms.map(alarm => (
                      <div key={alarm.id} onClick={() => setViewingAlarm(alarm)} className="bg-slate-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-lg active:scale-[0.98] transition-transform">
                          <div className="relative h-32">
                              <img src={alarm.snapshotUrl} className="w-full h-full object-cover opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                  <div className="w-full flex justify-between items-end">
                                      <span className="font-bold text-white text-lg drop-shadow">{alarm.cameraName}</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${alarm.status === 'PENDING' ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}>
                                          {alarm.status === 'PENDING' ? '报警中' : '已解除'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <div className="p-3">
                              <h3 className="font-bold text-orange-400 flex items-center gap-2 mb-2">
                                  <Flame size={16} /> {alarm.title}
                              </h3>
                              <p className="text-xs text-slate-300 mb-3">{alarm.description}</p>
                              <div className="flex justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-2">
                                  <span>{alarm.timestamp}</span>
                                  <button className="text-blue-400 flex items-center gap-1">
                                      详情 <ChevronRight size={12} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))
              )
          ) : (
              // ------- FIRE HAZARDS LIST -------
              displayedHazards.length === 0 ? (
                <div className="text-center text-slate-500 py-10 bg-slate-800/20 rounded-xl border border-dashed border-white/5">暂无相关隐患记录</div>
              ) : (
                  displayedHazards.map(todo => (
                      <div 
                        key={todo.id} 
                        onClick={() => navigate(`/issues/${todo.id}`)}
                        className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-md active:bg-slate-700/50 transition-colors"
                      >
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-slate-200 flex-1">{todo.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${todo.priority === 'HIGH' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                                  {todo.priority === 'HIGH' ? '高风险' : '一般隐患'}
                              </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{todo.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                  <Clock size={12} /> {todo.dueDate} 截止
                              </div>
                              <div className="flex items-center gap-1">
                                  <MapPin size={12} /> {todo.initiator} 上报
                              </div>
                          </div>
                      </div>
                  ))
              )
          )}
      </div>

      {/* --------------------- ALARM DETAIL MODAL --------------------- */}
      {viewingAlarm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingAlarm(null)}></div>
              
              <div className="relative bg-slate-900/95 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl border-t sm:border border-white/10 flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-10 duration-300">
                  {/* Header */}
                  <div className="flex-none flex justify-between items-center p-4 border-b border-white/10">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                         <Flame className="text-orange-500" /> {viewingAlarm.title}
                      </h3>
                      <button onClick={() => setViewingAlarm(null)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-0">
                      {/* Hero Image */}
                      <div className="relative aspect-video bg-black">
                          <img src={viewingAlarm.snapshotUrl} className="w-full h-full object-contain" />
                          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                              viewingAlarm.status === AlarmStatus.PENDING ? 'bg-red-600 text-white' :
                              viewingAlarm.status === AlarmStatus.PROCESSING ? 'bg-yellow-500 text-black' :
                              'bg-green-600 text-white'
                          }`}>
                              {viewingAlarm.status === AlarmStatus.PENDING ? '待处理' : viewingAlarm.status === AlarmStatus.PROCESSING ? '处理中' : '已解决'}
                          </div>
                      </div>

                      <div className="p-5 space-y-6">
                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Clock size={12}/> 报警时间</div>
                                  <div className="text-sm text-slate-200 font-mono">{viewingAlarm.timestamp}</div>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Camera size={12}/> 报警源</div>
                                  <div className="text-sm text-slate-200">{viewingAlarm.cameraName}</div>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><MapPin size={12}/> 区域位置</div>
                                  <div className="text-sm text-slate-200">A区-消防通道</div>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Activity size={12}/> AI 置信度</div>
                                  <div className="text-sm text-green-400 font-bold">99.8%</div>
                              </div>
                          </div>

                          {/* AI Analysis (Simulated) */}
                          <div className="space-y-2">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  <Zap size={16} className="text-purple-400" /> AI 智能场景分析
                              </h4>
                              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                                  <p className="text-xs leading-relaxed text-purple-100">
                                      热成像及烟雾传感器双重触发。画面中心检测到明显高温热源，烟雾浓度在过去 30 秒内上升 20%。判定为明火风险极高，建议立即启动消防预案。
                                  </p>
                              </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  <AlignLeft size={16} className="text-blue-400" /> 详细描述
                              </h4>
                              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                  <p className="text-sm text-slate-300">{viewingAlarm.description}</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex-none p-5 border-t border-white/10 bg-slate-900/80 pb-safe">
                       <button 
                        onClick={() => navigate('/alarms')}
                        className="w-full bg-slate-800/80 text-slate-200 hover:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-700/50"
                      >
                          前往报警中心处理
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FireSafety;
