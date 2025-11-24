import React from 'react';
import { useApp } from '../context/store';
import { MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MapPage: React.FC = () => {
  const { cameras, setActiveCamera } = useApp();
  const navigate = useNavigate();

  const handleMarkerClick = (cam: any) => {
    setActiveCamera(cam);
    navigate('/monitor');
  };

  return (
    <div className="h-full bg-slate-900 relative overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none">
        <h2 className="text-lg font-bold text-white drop-shadow-md">园区电子地图</h2>
      </div>

      {/* Simulated Map Container */}
      <div className="w-full h-full bg-[#1e293b] relative overflow-auto touch-pan-x touch-pan-y">
         {/* Map Background Pattern (Simulating a vector map) */}
         <div 
           className="absolute inset-0 min-w-[150%] min-h-[150%]" 
           style={{
             backgroundImage: 'radial-gradient(#334155 1px, transparent 1px), linear-gradient(#1e293b 1px, transparent 1px)',
             backgroundSize: '20px 20px, 100px 100px',
             backgroundPosition: '0 0, 0 0'
           }}
         >
           {/* Building Shapes (Simulated) */}
           <div className="absolute top-[20%] left-[20%] w-[20%] h-[15%] border-2 border-slate-600 bg-slate-800/50 rounded flex items-center justify-center text-slate-500 text-xs font-mono">A 区</div>
           <div className="absolute top-[20%] left-[50%] w-[30%] h-[30%] border-2 border-slate-600 bg-slate-800/50 rounded flex items-center justify-center text-slate-500 text-xs font-mono">B 区</div>
           <div className="absolute top-[60%] left-[30%] w-[40%] h-[20%] border-2 border-slate-600 bg-slate-800/50 rounded flex items-center justify-center text-slate-500 text-xs font-mono">C 区</div>
         </div>

         {/* Camera Markers */}
         {cameras.map(cam => (
           <button
             key={cam.id}
             onClick={() => handleMarkerClick(cam)}
             className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
             style={{ left: `${cam.coordinates.x}%`, top: `${cam.coordinates.y}%` }}
           >
             <div className="relative flex flex-col items-center">
                <div className={`p-2 rounded-full shadow-lg transition-transform hover:scale-125 ${cam.status === 'ALARM' ? 'bg-red-500 animate-bounce' : cam.status === 'ONLINE' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                  <MapPin size={24} className="text-white fill-current" />
                </div>
                <div className="mt-1 px-2 py-1 bg-black/70 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {cam.name}
                </div>
             </div>
           </button>
         ))}

         {/* User Location */}
         <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-0">
             <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Navigation size={20} className="text-blue-400 fill-current transform rotate-45" />
             </div>
         </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 right-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700 backdrop-blur-sm z-20">
        <div className="space-y-2 text-xs text-slate-300">
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> 在线</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> 报警</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-full"></div> 离线</div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;