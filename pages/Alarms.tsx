
import React, { useState } from 'react';
import { useApp } from '../context/store';
import { AlarmStatus, AlarmType, Alarm } from '../types';
import { Bell, Flame, ShieldAlert, AlertTriangle, Filter, CheckCircle, Clock, FileText, ArrowRight, Calendar, User, AlignLeft, Tag, X, Zap, MapPin, Camera, Activity, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Alarms: React.FC = () => {
  const navigate = useNavigate();
  const { alarms, updateAlarmStatus, createIssueFromAlarm } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | AlarmType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | AlarmStatus>('ALL');
  
  // Modal States
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null); // For Creating Issue
  const [viewingAlarm, setViewingAlarm] = useState<Alarm | null>(null); // For Viewing Details
  
  // Form State
  const [instruction, setInstruction] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [issueType, setIssueType] = useState<'PATROL' | 'ISSUE' | 'ALARM_REVIEW'>('ALARM_REVIEW');
  const [assignee, setAssignee] = useState('当前用户');
  const [dueDate, setDueDate] = useState('');

  const filteredAlarms = alarms.filter(alarm => {
    if (filterType !== 'ALL' && alarm.type !== filterType) return false;
    if (filterStatus !== 'ALL' && alarm.status !== filterStatus) return false;
    return true;
  });

  const getIcon = (type: AlarmType) => {
    switch (type) {
      case AlarmType.FIRE: return <Flame className="text-orange-500" />;
      case AlarmType.INTRUSION: return <ShieldAlert className="text-red-500" />;
      case AlarmType.VEHICLE: return <AlertTriangle className="text-yellow-500" />;
      default: return <Bell className="text-blue-500" />;
    }
  };

  const openCreateIssueModal = (alarm: Alarm, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening detail view
    setViewingAlarm(null); // Close detail view if open
    setSelectedAlarm(alarm);
    setInstruction(`请核实${alarm.cameraName}的${alarm.title}，并反馈现场情况。`);
    setPriority('HIGH');
    setIssueType('ALARM_REVIEW');
    setAssignee('当前用户');
    
    // Default deadline to 4 hours from now
    const d = new Date();
    d.setHours(d.getHours() + 4);
    const dateStr = d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    setDueDate(dateStr);
  };

  const handleConfirmIssue = () => {
    if (selectedAlarm) {
      createIssueFromAlarm(selectedAlarm.id, {
        instruction,
        priority,
        type: issueType,
        assignee,
        dueDate: dueDate.replace('T', ' ')
      });
      setSelectedAlarm(null);
      setInstruction('');
    }
  };

  const navigateToIssue = (issueId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/issues/${issueId}`);
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-20 relative">
      <div className="p-4 bg-blue-950/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 shadow-lg">
        <h1 className="text-xl font-bold text-white mb-4">报警中心</h1>
        
        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setFilterStatus('ALL')} 
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === 'ALL' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'border-slate-600 text-slate-400 bg-slate-800/40'}`}
          >
            全部
          </button>
          <button 
             onClick={() => setFilterStatus(AlarmStatus.PENDING)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === AlarmStatus.PENDING ? 'bg-red-900/60 border-red-500 text-red-200 shadow-md' : 'border-slate-600 text-slate-400 bg-slate-800/40'}`}
          >
            待处理
          </button>
           <button 
             onClick={() => setFilterStatus(AlarmStatus.PROCESSING)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === AlarmStatus.PROCESSING ? 'bg-yellow-900/60 border-yellow-500 text-yellow-200 shadow-md' : 'border-slate-600 text-slate-400 bg-slate-800/40'}`}
          >
            处理中
          </button>
           <button 
             onClick={() => setFilterStatus(AlarmStatus.RESOLVED)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === AlarmStatus.RESOLVED ? 'bg-green-900/60 border-green-500 text-green-200 shadow-md' : 'border-slate-600 text-slate-400 bg-slate-800/40'}`}
          >
            已解决
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredAlarms.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-800/30 rounded-xl border border-white/5 border-dashed">
             <CheckCircle size={48} className="mb-2 opacity-30" />
             <p>暂无报警记录</p>
           </div>
        ) : (
          filteredAlarms.map(alarm => (
            <div 
                key={alarm.id} 
                onClick={() => setViewingAlarm(alarm)}
                className="bg-slate-800/60 backdrop-blur-md rounded-lg overflow-hidden shadow-lg border border-white/10 cursor-pointer transition-transform active:scale-[0.99]"
            >
               <div className="p-3 flex justify-between items-start border-b border-white/5 bg-slate-900/30">
                  <div className="flex gap-3">
                     <div className="bg-slate-900/80 p-2 rounded h-fit shadow-inner">
                       {getIcon(alarm.type)}
                     </div>
                     <div>
                        <h3 className="font-semibold text-white">{alarm.title}</h3>
                        <p className="text-xs text-slate-400">{alarm.cameraName}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500">{alarm.timestamp}</span>
                    <div className={`mt-1 text-[10px] px-2 py-0.5 rounded-full text-center shadow-sm ${
                      alarm.status === AlarmStatus.PENDING ? 'bg-red-500 text-white animate-pulse' : 
                      alarm.status === AlarmStatus.PROCESSING ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {alarm.status === AlarmStatus.PENDING ? '待处理' : alarm.status === AlarmStatus.PROCESSING ? '处理中' : '已解决'}
                    </div>
                  </div>
               </div>
               
               <div className="relative h-32 bg-black">
                 <img src={alarm.snapshotUrl} className="w-full h-full object-cover opacity-90" alt="Snapshot" />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                     <span className="text-xs text-white border border-white/50 px-3 py-1.5 rounded-full backdrop-blur-md">查看详情</span>
                 </div>
               </div>

               <div className="p-3">
                 <p className="text-sm text-slate-300 mb-3 line-clamp-2">{alarm.description}</p>
                 
                 {/* Action Bar */}
                 <div className="flex gap-2">
                   {/* If Resolved, no actions */}
                   {alarm.status === AlarmStatus.RESOLVED && (
                      <div className="w-full bg-slate-900/30 py-2 rounded text-center text-xs text-slate-500 border border-white/5">
                        该报警已闭环
                      </div>
                   )}

                   {/* If Pending, can create issue */}
                   {alarm.status === AlarmStatus.PENDING && (
                     <button 
                       onClick={(e) => openCreateIssueModal(alarm, e)}
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1 shadow-md"
                     >
                       <FileText size={16} /> 发起处置工单
                     </button>
                   )}

                   {/* If Processing, view issue info */}
                   {alarm.status === AlarmStatus.PROCESSING && (
                     <button 
                        onClick={(e) => alarm.relatedIssueId && navigateToIssue(alarm.relatedIssueId, e)}
                        className="flex-1 flex gap-2 w-full"
                     >
                        <div className="flex-1 bg-yellow-900/40 text-yellow-500 border border-yellow-500/30 py-2 rounded text-center text-xs flex items-center justify-center gap-1 shadow-sm">
                           <Clock size={14} /> 正在流转中 (点击查看)
                        </div>
                     </button>
                   )}
                 </div>
               </div>
            </div>
          ))
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
                         {getIcon(viewingAlarm.type)} {viewingAlarm.title}
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
                                  <div className="text-sm text-slate-200">A区-东北角</div>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Activity size={12}/> AI 置信度</div>
                                  <div className="text-sm text-green-400 font-bold">98.5%</div>
                              </div>
                          </div>

                          {/* AI Analysis (Simulated) */}
                          <div className="space-y-2">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  <Zap size={16} className="text-purple-400" /> AI 智能场景分析
                              </h4>
                              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                                  <p className="text-xs leading-relaxed text-purple-100">
                                      {viewingAlarm.type === AlarmType.INTRUSION && "系统识别到画面中出现人形目标，且在该区域停留超过设定阈值（10s）。目标行为特征符合非法入侵模式，建议立即复核。"}
                                      {viewingAlarm.type === AlarmType.FIRE && "热成像及烟雾传感器双重触发。画面中心检测到明火特征，温度急剧上升，火势蔓延风险高。"}
                                      {viewingAlarm.type === AlarmType.VEHICLE && `识别到布控车辆进入监控区域。车牌特征匹配度高，该车辆属于重点关注名单，请拦截。`}
                                      {viewingAlarm.type === AlarmType.SYSTEM && "设备心跳丢失，连续 3 次尝试重连失败。可能是网络中断或电源故障。"}
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
                      {viewingAlarm.status === AlarmStatus.PENDING ? (
                          <button 
                            onClick={() => openCreateIssueModal(viewingAlarm)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
                          >
                              <FileText size={18} /> 立即发起处置
                          </button>
                      ) : viewingAlarm.status === AlarmStatus.PROCESSING && viewingAlarm.relatedIssueId ? (
                           <button 
                            onClick={() => navigateToIssue(viewingAlarm.relatedIssueId!)}
                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/50"
                          >
                              <ExternalLink size={18} /> 查看关联工单
                          </button>
                      ) : (
                          <button disabled className="w-full bg-slate-800/50 text-slate-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 border border-slate-700">
                              <CheckCircle size={18} /> 报警已解决
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* --------------------- CREATE ISSUE MODAL --------------------- */}
      {selectedAlarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAlarm(null)}></div>
          
          <div className="relative bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             {/* Modal Header */}
             <div className="flex-none flex justify-between items-center p-5 border-b border-white/10">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="text-blue-500" /> 发起处置工单
               </h3>
               <button onClick={() => setSelectedAlarm(null)} className="text-slate-400 hover:text-white">关闭</button>
             </div>
             
             {/* Modal Body (Scrollable) */}
             <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Alarm Source Preview */}
                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 flex gap-3">
                   <div className="w-20 h-16 bg-black rounded overflow-hidden flex-shrink-0">
                     <img src={selectedAlarm.snapshotUrl} className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <p className="text-white text-sm font-medium">{selectedAlarm.title}</p>
                     <p className="text-slate-500 text-xs mt-1">{selectedAlarm.timestamp} | {selectedAlarm.cameraName}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Issue Type */}
                    <div>
                        <label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><Tag size={12}/> 工单类型</label>
                        <div className="relative">
                            <select 
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value as any)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm appearance-none focus:border-blue-500 outline-none"
                            >
                                <option value="ALARM_REVIEW">报警复核</option>
                                <option value="PATROL">现场巡检</option>
                                <option value="ISSUE">设备维修</option>
                            </select>
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><AlertTriangle size={12}/> 优先级</label>
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm appearance-none focus:border-blue-500 outline-none"
                        >
                            <option value="HIGH">高急</option>
                            <option value="MEDIUM">中等</option>
                            <option value="LOW">普通</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     {/* Assignee */}
                    <div>
                        <label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><User size={12}/> 指派给</label>
                        <select 
                            value={assignee}
                            onChange={(e) => setAssignee(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm appearance-none focus:border-blue-500 outline-none"
                        >
                            <option value="当前用户">当前用户 (我)</option>
                            <option value="安保一组">安保一组</option>
                            <option value="安保二组">安保二组</option>
                            <option value="运维技术组">运维技术组</option>
                        </select>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><Calendar size={12}/> 截止时间</label>
                        <input 
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Instruction */}
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 flex items-center gap-1"><AlignLeft size={12}/> 处置要求 / 备注</label>
                  <textarea 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none"
                    rows={4}
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="请输入具体的现场处置要求..."
                  ></textarea>
                </div>
             </div>

             {/* Modal Footer */}
             <div className="flex-none p-5 border-t border-white/10 bg-slate-800/50 rounded-b-2xl">
                <button 
                  onClick={handleConfirmIssue}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 transition-all active:scale-95"
                >
                  <CheckCircle size={18} /> 确认派单
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alarms;
