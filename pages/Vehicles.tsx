
import React, { useState } from 'react';
import { useApp } from '../context/store';
import { Search, Car, ArrowLeft, AlertOctagon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Vehicles: React.FC = () => {
  const { vehicles } = useApp();
  const navigate = useNavigate();
  const [plateQuery, setPlateQuery] = useState('');

  const filteredVehicles = vehicles.filter(v => v.plate.toLowerCase().includes(plateQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-transparent pb-20">
      <div className="p-4 bg-blue-950/60 backdrop-blur-md sticky top-0 z-10 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
           <button onClick={() => navigate(-1)} className="p-1 text-slate-400 hover:text-white"><ArrowLeft /></button>
           <h1 className="text-xl font-bold text-white">车辆布控</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Car className="text-slate-500" size={18} />
           </div>
           <input 
             className="w-full bg-slate-800/60 backdrop-blur-md text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700/50 focus:outline-none focus:border-blue-500 uppercase placeholder-slate-500" 
             placeholder="输入车牌号 (如: 赣E·88888)"
             value={plateQuery}
             onChange={(e) => setPlateQuery(e.target.value)}
           />
           <button className="absolute right-2 top-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium shadow-sm">
             搜索
           </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
         <h2 className="text-slate-300 text-sm font-semibold drop-shadow">过车记录</h2>
         
         {filteredVehicles.map(v => {
           // Safe split for date and time if available, otherwise fallback
           const parts = v.timestamp.split(' ');
           const datePart = parts.length > 1 ? parts[0] : '';
           const timePart = parts.length > 1 ? parts[1] : parts[0];

           return (
             <div 
               key={v.id} 
               onClick={() => navigate(`/vehicles/${v.id}`)}
               className={`bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 flex gap-4 border cursor-pointer active:bg-slate-800/80 transition-colors shadow-sm ${v.isWatchlisted ? 'border-red-500/50 shadow-red-900/10' : 'border-white/5 hover:border-white/10'}`}
             >
                <div className="w-24 h-20 bg-black rounded overflow-hidden flex-shrink-0 relative shadow-inner">
                  <img src={v.imageUrl} className="w-full h-full object-cover opacity-90" alt="car" />
                  {v.isWatchlisted && (
                    <div className="absolute top-0 left-0 bg-red-600 text-[9px] text-white px-1 shadow-sm">布控名单</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <h3 className="text-lg font-mono font-bold text-white tracking-wide">{v.plate}</h3>
                      <div className="text-right">
                         <span className="block text-base font-bold text-white font-mono leading-none">{timePart}</span>
                         <span className="block text-[10px] text-slate-400 font-mono mt-1">{datePart}</span>
                      </div>
                   </div>
                   <div className="text-sm text-slate-300 mt-0">{v.color} - {v.type}</div>
                   <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 truncate max-w-[80%]">
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        <span className="truncate text-slate-400">{v.location}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                   </div>
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
};

export default Vehicles;
