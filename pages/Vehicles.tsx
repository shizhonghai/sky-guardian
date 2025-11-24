import React, { useState } from 'react';
import { useApp } from '../context/store';
import { Search, Car, ArrowLeft, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Vehicles: React.FC = () => {
  const { vehicles } = useApp();
  const navigate = useNavigate();
  const [plateQuery, setPlateQuery] = useState('');

  const filteredVehicles = vehicles.filter(v => v.plate.toLowerCase().includes(plateQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-slate-900 pb-20">
      <div className="p-4 bg-slate-950 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
           <button onClick={() => navigate(-1)} className="p-1 text-slate-400"><ArrowLeft /></button>
           <h1 className="text-xl font-bold text-white">车辆布控</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Car className="text-slate-500" size={18} />
           </div>
           <input 
             className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 uppercase placeholder-slate-500" 
             placeholder="输入车牌号 (如: 京A-88888)"
             value={plateQuery}
             onChange={(e) => setPlateQuery(e.target.value)}
           />
           <button className="absolute right-2 top-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium">
             搜索
           </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
         <h2 className="text-slate-400 text-sm font-semibold">过车记录</h2>
         
         {filteredVehicles.map(v => (
           <div key={v.id} className={`bg-slate-800 rounded-lg p-3 flex gap-4 border ${v.isWatchlisted ? 'border-red-500/50' : 'border-transparent'}`}>
              <div className="w-24 h-20 bg-black rounded overflow-hidden flex-shrink-0 relative">
                <img src={v.imageUrl} className="w-full h-full object-cover" alt="car" />
                {v.isWatchlisted && (
                  <div className="absolute top-0 left-0 bg-red-600 text-[9px] text-white px-1">布控名单</div>
                )}
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <h3 className="text-lg font-mono font-bold text-white">{v.plate}</h3>
                    <span className="text-xs text-slate-500">{v.timestamp}</span>
                 </div>
                 <div className="text-sm text-slate-300 mt-1">{v.color} - {v.type}</div>
                 <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {v.location}
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Vehicles;