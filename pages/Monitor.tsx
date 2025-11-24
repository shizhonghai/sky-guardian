
import React, { useState } from 'react';
import { useApp } from '../context/store';
import VideoPlayer from '../components/VideoPlayer';
import { Search, List, Grid } from 'lucide-react';

const Monitor: React.FC = () => {
  const { cameras, activeCamera, setActiveCamera, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');

  const filteredCameras = cameras.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate actual online count (Online + Alarm)
  const onlineCount = filteredCameras.filter(c => c.status === 'ONLINE' || c.status === 'ALARM').length;

  return (
    <div className="flex flex-col h-full bg-transparent pb-20">
      {/* Active Video Area */}
      <div className="sticky top-0 z-10 w-full bg-black shadow-2xl">
        {activeCamera ? (
          <VideoPlayer camera={activeCamera} settings={settings} isLive={true} />
        ) : (
          <div className="aspect-video bg-slate-800 flex items-center justify-center text-slate-500">
            请选择摄像头
          </div>
        )}
      </div>

      {/* Controls & List */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索点位名称/区域..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/60 backdrop-blur-md text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700/50 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <span className="font-medium text-slate-300 drop-shadow">在线: {onlineCount} <span className="text-slate-500 mx-1">/</span> 总数: {filteredCameras.length}</span>
          <div className="flex gap-2">
             <button onClick={() => setViewMode('LIST')} className={`p-2 rounded backdrop-blur-sm transition-colors ${viewMode === 'LIST' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 border border-white/5'}`}><List size={18} /></button>
             <button onClick={() => setViewMode('GRID')} className={`p-2 rounded backdrop-blur-sm transition-colors ${viewMode === 'GRID' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 border border-white/5'}`}><Grid size={18} /></button>
          </div>
        </div>

        {/* Camera List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-4">
          {viewMode === 'LIST' ? (
            filteredCameras.map(cam => (
              <div 
                key={cam.id} 
                onClick={() => setActiveCamera(cam)}
                className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors backdrop-blur-sm ${activeCamera?.id === cam.id ? 'bg-slate-800/80 border-blue-500 shadow-lg' : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'}`}
              >
                <div className="relative w-24 h-16 bg-black rounded overflow-hidden flex-shrink-0">
                  <img src={cam.thumbnail} className="w-full h-full object-cover" alt="" />
                  {cam.status === 'ALARM' && <div className="absolute inset-0 border-2 border-red-500 animate-pulse"></div>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium truncate ${activeCamera?.id === cam.id ? 'text-blue-400' : 'text-slate-200'}`}>{cam.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${cam.status === 'ONLINE' ? 'bg-green-900/50 text-green-300' : cam.status === 'ALARM' ? 'bg-red-900/50 text-red-300' : 'bg-gray-700/50 text-gray-400'}`}>
                      {cam.status === 'ONLINE' ? '在线' : cam.status === 'ALARM' ? '告警' : '离线'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>📍 {cam.location}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full mx-1"></span>
                    <span>{cam.type}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-3">
               {filteredCameras.map(cam => (
                 <div 
                  key={cam.id}
                  onClick={() => setActiveCamera(cam)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 shadow-lg ${activeCamera?.id === cam.id ? 'border-blue-500' : 'border-transparent'}`}
                 >
                    <img src={cam.thumbnail} className="w-full h-full object-cover" alt="" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate backdrop-blur-[2px]">
                      {cam.name}
                    </div>
                    {cam.status === 'ALARM' && <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>}
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitor;
