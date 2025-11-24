
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';
import { ArrowLeft, Clock, MapPin, Gauge, User, AlertOctagon, Share2, Download, Video, Navigation, AlertTriangle } from 'lucide-react';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, toggleVehicleWatchlist, showToast } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const vehicle = vehicles.find(v => v.id === id);

  const handleToggleWatchlist = () => {
    if (!vehicle) return;
    
    if (vehicle.isWatchlisted) {
      // Revoking is instant
      toggleVehicleWatchlist(vehicle.id);
      showToast('已撤销该车辆的布控状态', 'info');
    } else {
      // Show custom dialog instead of window.confirm for better UX/compatibility
      setShowConfirm(true);
    }
  };

  const confirmWatchlist = () => {
    if (!vehicle) return;
    toggleVehicleWatchlist(vehicle.id);
    showToast('已加入布控黑名单，系统正在追踪', 'success');
    setShowConfirm(false);
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col h-full bg-transparent items-center justify-center text-slate-400">
        <p>未找到相关车辆记录</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-500">返回列表</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto pb-20 relative">
      {/* Header */}
      <div className="p-4 bg-blue-950/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-white/10 shadow-sm">
         <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-1 text-slate-400 active:scale-95 hover:text-white"><ArrowLeft /></button>
             <h1 className="text-xl font-bold text-white">车辆详情</h1>
         </div>
         {vehicle.isWatchlisted && (
             <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-900/30 px-2 py-1 rounded border border-red-900 animate-in fade-in zoom-in duration-300">
                 <AlertOctagon size={12} /> 布控中
             </span>
         )}
      </div>

      <div className="p-4 space-y-6">
          {/* Main Image Section */}
          <div className="space-y-2">
              <div className={`relative aspect-video bg-black rounded-lg overflow-hidden border shadow-lg group transition-colors duration-500 ${vehicle.isWatchlisted ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-700/50'}`}>
                  <img src={vehicle.imageUrl} className="w-full h-full object-cover" alt="Vehicle Snapshot" />
                  
                  {/* Confidence Overlay */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-green-400 text-[10px] px-2 py-1 rounded border border-green-900/50">
                      AI置信度 {vehicle.confidence}%
                  </div>
              </div>
              
              <div className="flex items-center justify-between">
                 <h2 className="text-slate-400 text-xs">抓拍全景图</h2>
                 <div className="flex gap-4">
                     <button className="text-blue-400 text-xs flex items-center gap-1"><Download size={14}/> 下载图片</button>
                     <button className="text-blue-400 text-xs flex items-center gap-1"><Share2 size={14}/> 分享</button>
                 </div>
              </div>
          </div>

          {/* License Plate & Basic Info Card */}
          <div className={`rounded-xl p-5 border transition-colors duration-300 backdrop-blur-md ${vehicle.isWatchlisted ? 'bg-red-900/20 border-red-800/50' : 'bg-slate-800/50 border-white/5'}`}>
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <div className={`text-2xl font-bold font-mono tracking-wider px-3 py-1 rounded border inline-block transition-colors duration-300 ${vehicle.isWatchlisted ? 'bg-red-500 text-white border-red-600' : 'bg-blue-600 text-white border-blue-500'}`}>
                          {vehicle.plate}
                      </div>
                      <p className="text-slate-400 text-xs mt-2">{vehicle.color} | {vehicle.type}</p>
                  </div>
                  {/* Plate Crop (Simulated by cropping the generated image roughly) */}
                  <div className="w-24 h-12 bg-slate-900/50 rounded border border-slate-600 overflow-hidden relative shadow-inner">
                      {/* We use the same image but zoomed in to the center bottom where we drew the plate */}
                      <img 
                        src={vehicle.imageUrl} 
                        className="absolute w-[300%] max-w-none h-[300%]" 
                        style={{ left: '-100%', top: '-220%' }}
                        alt="Plate Crop" 
                      />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-white/5">
                  <div className="flex items-start gap-2">
                      <Clock size={16} className="text-slate-500 mt-0.5" />
                      <div>
                          <p className="text-xs text-slate-500">抓拍时间</p>
                          <p className="text-sm text-slate-200 font-mono">{vehicle.timestamp}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-slate-500 mt-0.5" />
                      <div>
                          <p className="text-xs text-slate-500">抓拍点位</p>
                          <p className="text-sm text-slate-200">{vehicle.location}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <Gauge size={16} className="text-slate-500 mt-0.5" />
                      <div>
                          <p className="text-xs text-slate-500">行驶速度</p>
                          <p className="text-sm text-slate-200">{vehicle.speed} km/h</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <User size={16} className="text-slate-500 mt-0.5" />
                      <div>
                          <p className="text-xs text-slate-500">登记车主</p>
                          <p className="text-sm text-slate-200">{vehicle.ownerName || '未知'}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <Navigation size={16} className="text-slate-500 mt-0.5" />
                      <div>
                          <p className="text-xs text-slate-500">行驶方向</p>
                          <p className="text-sm text-slate-200">{vehicle.direction}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded border border-slate-500 flex items-center justify-center text-[10px] text-slate-500 mt-0.5">{vehicle.lane}</div>
                      <div>
                          <p className="text-xs text-slate-500">车道编号</p>
                          <p className="text-sm text-slate-200">车道 {vehicle.lane}</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
              <button className="bg-slate-800/60 hover:bg-slate-700/60 text-white py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors active:scale-95">
                  <Video size={18} className="text-blue-400" /> 关联录像
              </button>
              <button className="bg-slate-800/60 hover:bg-slate-700/60 text-white py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors active:scale-95">
                   <Navigation size={18} className="text-green-400" /> 轨迹回放
              </button>
              
              <button 
                  onClick={handleToggleWatchlist}
                  className={`col-span-2 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 ${
                      vehicle.isWatchlisted 
                      ? 'bg-slate-800/60 text-slate-300 border-white/10 hover:bg-slate-700/60' 
                      : 'bg-red-900/80 text-white border-red-700 hover:bg-red-800 shadow-lg shadow-red-900/20'
                  }`}
              >
                  <AlertOctagon size={18} /> 
                  {vehicle.isWatchlisted ? '撤销布控' : '加入布控黑名单'}
              </button>
          </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConfirm(false)}></div>
            
            {/* Dialog */}
            <div className="relative bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-500">
                    <div className="bg-red-900/30 p-2 rounded-full border border-red-900/50">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">确认布控?</h3>
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed">
                    您即将把车辆 <span className="font-mono font-bold text-white bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600 mx-1">{vehicle.plate}</span> 加入重点布控黑名单。
                </p>
                <p className="text-slate-500 text-xs">
                    加入后，系统将对该车进行全网实时追踪并推送告警。
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                        onClick={() => setShowConfirm(false)} 
                        className="py-3 rounded-xl bg-slate-700 text-slate-300 font-medium active:scale-95 transition-transform hover:bg-slate-600"
                    >
                        取消
                    </button>
                    <button 
                        onClick={confirmWatchlist} 
                        className="py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-900/50 active:scale-95 transition-transform hover:bg-red-500"
                    >
                        确认加入
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
