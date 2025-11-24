import React, { useState } from 'react';
import { useApp } from '../context/store';
import { AlarmStatus, AlarmType } from '../types';
import { Bell, Flame, ShieldAlert, AlertTriangle, Filter, CheckCircle, Clock } from 'lucide-react';

const Alarms: React.FC = () => {
  const { alarms, updateAlarmStatus } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | AlarmType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | AlarmStatus>('ALL');

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

  return (
    <div className="flex flex-col h-full bg-slate-900 pb-20">
      <div className="p-4 bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white mb-4">报警中心</h1>
        
        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <button 
            onClick={() => setFilterStatus('ALL')} 
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filterStatus === 'ALL' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700 text-slate-400'}`}
          >
            全部
          </button>
          <button 
             onClick={() => setFilterStatus(AlarmStatus.PENDING)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filterStatus === AlarmStatus.PENDING ? 'bg-red-900/50 border-red-500 text-red-200' : 'border-slate-700 text-slate-400'}`}
          >
            待处理
          </button>
           <button 
             onClick={() => setFilterStatus(AlarmStatus.RESOLVED)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filterStatus === AlarmStatus.RESOLVED ? 'bg-green-900/50 border-green-500 text-green-200' : 'border-slate-700 text-slate-400'}`}
          >
            已解决
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredAlarms.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-48 text-slate-500">
             <CheckCircle size={48} className="mb-2 opacity-20" />
             <p>暂无报警记录</p>
           </div>
        ) : (
          filteredAlarms.map(alarm => (
            <div key={alarm.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700">
               <div className="p-3 flex justify-between items-start border-b border-slate-700/50">
                  <div className="flex gap-3">
                     <div className="bg-slate-900 p-2 rounded h-fit">
                       {getIcon(alarm.type)}
                     </div>
                     <div>
                        <h3 className="font-semibold text-white">{alarm.title}</h3>
                        <p className="text-xs text-slate-400">{alarm.cameraName}</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500">{alarm.timestamp}</span>
                    <div className={`mt-1 text-[10px] px-2 py-0.5 rounded-full text-center ${
                      alarm.status === AlarmStatus.PENDING ? 'bg-red-500 text-white animate-pulse' : 
                      alarm.status === AlarmStatus.PROCESSING ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {alarm.status === AlarmStatus.PENDING ? '待处理' : alarm.status === AlarmStatus.PROCESSING ? '处理中' : '已解决'}
                    </div>
                  </div>
               </div>
               
               <div className="relative h-32 bg-black">
                 <img src={alarm.snapshotUrl} className="w-full h-full object-cover opacity-80" alt="Snapshot" />
               </div>

               <div className="p-3">
                 <p className="text-sm text-slate-300 mb-3">{alarm.description}</p>
                 <div className="flex gap-2">
                   {alarm.status !== AlarmStatus.RESOLVED && (
                     <button 
                       onClick={() => updateAlarmStatus(alarm.id, AlarmStatus.RESOLVED)}
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors"
                     >
                       标记为已解决
                     </button>
                   )}
                   {alarm.status === AlarmStatus.PENDING && (
                     <button 
                       onClick={() => updateAlarmStatus(alarm.id, AlarmStatus.PROCESSING)}
                       className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
                     >
                       确认报警
                     </button>
                   )}
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alarms;