
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';
import { ArrowLeft, Clock, User, CheckCircle, Send, MessageSquare, AlertCircle, FileText } from 'lucide-react';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, alarms, handleIssue } = useApp();
  const [comment, setComment] = useState('');

  const issue = todos.find(t => t.id === id);
  // Find related alarm if it exists
  const relatedAlarm = issue?.relatedAlarmId ? alarms.find(a => a.id === issue.relatedAlarmId) : null;

  if (!issue) {
    return <div className="p-8 text-center text-slate-500">工单不存在</div>;
  }

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    handleIssue(issue.id, 'COMMENT', comment);
    setComment('');
  };

  const handleComplete = () => {
    handleIssue(issue.id, 'COMPLETE', '工单处理完成，申请闭环。');
    // Navigate back to tasks list, but switch to DONE tab to show the completed item
    navigate('/tasks', { replace: true, state: { tab: 'DONE' } });
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="p-4 bg-blue-950/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 flex items-center gap-3 shadow-sm">
         <button onClick={() => navigate(-1)} className="p-1 text-slate-400 active:scale-95 hover:text-white transition-colors"><ArrowLeft /></button>
         <h1 className="text-xl font-bold text-white">工单详情</h1>
         <div className="ml-auto">
            <span className={`px-2 py-1 rounded text-xs font-bold ${issue.status === 'OPEN' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                {issue.status === 'OPEN' ? '处理中' : '已办结'}
            </span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 z-0">
          {/* Basic Info */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-white/5 shadow-lg">
             <h2 className="text-lg font-bold text-white mb-2">{issue.title}</h2>
             <p className="text-slate-300 text-sm leading-relaxed mb-4">{issue.description}</p>
             
             <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-white/5 pt-3">
                 <div>
                    <span className="block mb-1">发起人</span>
                    <span className="text-slate-300 flex items-center gap-1"><User size={12}/> {issue.initiator}</span>
                 </div>
                 <div>
                    <span className="block mb-1">当前处理人</span>
                    <span className="text-slate-300 flex items-center gap-1"><User size={12}/> {issue.assignee}</span>
                 </div>
                 <div>
                    <span className="block mb-1">创建时间</span>
                    <span className="text-slate-300">{issue.createdAt}</span>
                 </div>
                 <div>
                    <span className="block mb-1">优先级</span>
                    <span className={`font-bold ${issue.priority === 'HIGH' ? 'text-red-400' : 'text-blue-400'}`}>
                        {issue.priority === 'HIGH' ? '高急' : issue.priority === 'MEDIUM' ? '中等' : '普通'}
                    </span>
                 </div>
             </div>
          </div>

          {/* Related Alarm Card (If applicable) */}
          {relatedAlarm && (
             <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-red-900/30 overflow-hidden">
                <div className="bg-red-900/20 px-4 py-2 flex items-center gap-2 border-b border-red-900/30">
                    <AlertCircle size={16} className="text-red-400" />
                    <span className="text-sm font-bold text-red-200">关联报警源</span>
                </div>
                <div className="p-4 flex gap-3">
                   <div className="w-20 h-16 bg-black rounded flex-shrink-0 overflow-hidden">
                       <img src={relatedAlarm.snapshotUrl} className="w-full h-full object-cover" />
                   </div>
                   <div>
                       <p className="text-sm text-white font-medium">{relatedAlarm.title}</p>
                       <p className="text-xs text-slate-500 mt-1">{relatedAlarm.cameraName} | {relatedAlarm.timestamp}</p>
                   </div>
                </div>
             </div>
          )}

          {/* Timeline / Logs */}
          <div>
              <h3 className="text-slate-400 text-sm font-bold mb-4 flex items-center gap-2">
                  <Clock size={16} /> 处置记录
              </h3>
              <div className="space-y-6 relative pl-4 border-l-2 border-slate-700/50 ml-2">
                  {issue.logs.map((log) => (
                      <div key={log.id} className="relative">
                          <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 ${
                              log.action === 'CREATE' ? 'bg-blue-500 border-slate-900' :
                              log.action === 'CLOSE' ? 'bg-green-500 border-slate-900' :
                              'bg-slate-500 border-slate-900'
                          }`}></div>
                          <div className="flex justify-between items-start mb-1">
                             <span className="text-sm font-bold text-slate-200">{log.operator}</span>
                             <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          </div>
                          <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg text-sm text-slate-300 shadow-sm border border-white/5">
                             {log.content}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Action Footer */}
      {issue.status === 'OPEN' && (
          <div className="p-4 bg-blue-950/60 backdrop-blur-md border-t border-white/10 sticky bottom-0 z-50 space-y-3">
              <div className="relative">
                  <input 
                    type="text" 
                    placeholder="输入处置情况..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-800/50 text-white rounded-lg pl-4 pr-12 py-3 border border-slate-700 focus:border-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleSubmitComment}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-md text-white disabled:opacity-50"
                    disabled={!comment.trim()}
                  >
                     <Send size={16} />
                  </button>
              </div>
              <button 
                onClick={handleComplete}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                  <CheckCircle size={18} /> 办结工单
              </button>
          </div>
      )}
    </div>
  );
};

export default IssueDetail;
