
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, PlayCircle, Image, Calendar, Camera, Clock, Filter, Download, Trash2, Film, Play, Pause, SkipForward, SkipBack, AlertTriangle, RotateCcw, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';

const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { cameras, showToast } = useApp();
  const activeTabState = useState<'PLAYBACK' | 'ARCHIVE'>('PLAYBACK');
  const [activeTab, setActiveTab] = activeTabState;

  // --- PLAYBACK STATE ---
  const [selectedCameraId, setSelectedCameraId] = useState(cameras[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<string | null>(null);
  
  // Real Video Progress State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock Segments
  const segments = [
    { id: 'seg1', time: '00:00 - 02:30', type: '定时录像', size: '1.2GB' },
    { id: 'seg2', time: '02:30 - 05:00', type: '定时录像', size: '1.2GB' },
    { id: 'seg3', time: '08:45 - 09:15', type: '报警录像', size: '250MB', isAlarm: true },
    { id: 'seg4', time: '12:00 - 14:30', type: '定时录像', size: '1.1GB' },
    { id: 'seg5', time: '16:20 - 16:25', type: '移动侦测', size: '45MB', isAlarm: true },
    { id: 'seg6', time: '18:00 - 20:30', type: '定时录像', size: '1.3GB' },
  ];

  // --- ARCHIVE STATE ---
  const [archiveFilter, setArchiveFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null); // For detail view
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock Media Data for Archive (Stateful now)
  const [mediaList, setMediaList] = useState(() => Array.from({length: 15}).map((_, i) => ({
      id: i,
      type: i % 4 === 0 ? 'VIDEO' : 'IMAGE',
      url: `https://picsum.photos/300/300?random=${i + 30}`,
      date: '2023-10-27 14:30:22',
      source: `摄像头-${Math.floor(i%3)+1}`
  })));

  const filteredMedia = mediaList.filter(m => {
      if (archiveFilter === 'ALL') return true;
      return m.type === archiveFilter;
  });

  const handlePlaySegment = (id: string) => {
      setCurrentSegment(id);
      setIsPlaying(true);
      if(videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
      }
  };

  const togglePlay = () => {
      if(videoRef.current) {
          if(isPlaying) videoRef.current.pause();
          else videoRef.current.play();
          setIsPlaying(!isPlaying);
      }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(0, clickX / rect.width), 1);
    const newTime = percentage * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (videoRef.current) {
        videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
        videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    showToast('文件已保存至本地相册', 'success');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedMedia) {
        setMediaList(prev => prev.filter(m => m.id !== selectedMedia.id));
        setShowDeleteConfirm(false);
        setSelectedMedia(null);
        showToast('文件已永久删除', 'success');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-safe relative">
       {/* Header */}
       <div className="p-4 bg-blue-950/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-white/10 shadow-sm">
           <div className="flex items-center gap-3">
               <button onClick={() => navigate(-1)} className="p-1 text-slate-400 active:scale-95 hover:text-white"><ArrowLeft /></button>
               <h1 className="text-xl font-bold text-white">影像中心</h1>
           </div>
           
           {/* Tab Switcher */}
           <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-lg p-1">
               <button 
                 onClick={() => setActiveTab('PLAYBACK')}
                 className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'PLAYBACK' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
               >
                   录像回放
               </button>
               <button 
                 onClick={() => setActiveTab('ARCHIVE')}
                 className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'ARCHIVE' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
               >
                   媒体档案
               </button>
           </div>
       </div>

       {activeTab === 'PLAYBACK' ? (
           <div className="flex-1 flex flex-col overflow-hidden">
               {/* Player Area */}
               <div className="aspect-video bg-black relative flex-shrink-0 group shadow-2xl">
                   {currentSegment ? (
                        <video 
                            ref={videoRef}
                            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                            className="w-full h-full object-contain"
                            playsInline
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => setIsPlaying(false)}
                        />
                   ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
                           <PlayCircle size={48} className="opacity-50 mb-2"/>
                           <p className="text-sm">请选择下方时间段开始回放</p>
                       </div>
                   )}
                   
                   {/* Player Controls Overlay */}
                   {currentSegment && (
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col gap-2 z-10 transition-opacity duration-300">
                           {/* Progress Bar Row */}
                           <div className="flex items-center gap-3 w-full select-none">
                               <span className="text-[10px] font-mono text-white opacity-90 min-w-[32px]">{formatTime(currentTime)}</span>
                               
                               <div 
                                  className="flex-1 h-6 flex items-center cursor-pointer group/bar" 
                                  onClick={handleSeek}
                               >
                                   <div className="w-full h-1 bg-white/30 rounded-full relative overflow-visible">
                                       <div 
                                          className="h-full bg-blue-500 rounded-full relative transition-all duration-75" 
                                          style={{ width: `${(currentTime / duration) * 100}%` }}
                                       >
                                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow scale-100"></div>
                                       </div>
                                   </div>
                               </div>
                               
                               <span className="text-[10px] font-mono text-white opacity-90 min-w-[32px]">{formatTime(duration)}</span>
                           </div>

                           {/* Buttons Row */}
                           <div className="flex items-center justify-center gap-10 mt-1">
                               <button onClick={skipBackward} className="text-white hover:text-blue-400 active:scale-90 transition-transform">
                                   <div className="flex flex-col items-center">
                                       <RotateCcw size={22} />
                                       <span className="text-[8px] mt-0.5 opacity-70">-10s</span>
                                   </div>
                               </button>
                               
                               <button onClick={togglePlay} className="bg-white text-black rounded-full p-3 hover:scale-105 active:scale-95 transition-transform">
                                   {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                               </button>
                               
                               <button onClick={skipForward} className="text-white hover:text-blue-400 active:scale-90 transition-transform">
                                   <div className="flex flex-col items-center">
                                       <RotateCw size={22} />
                                       <span className="text-[8px] mt-0.5 opacity-70">+10s</span>
                                   </div>
                               </button>
                           </div>
                       </div>
                   )}
               </div>

               {/* Controls Bar */}
               <div className="p-4 bg-slate-900/60 backdrop-blur-md border-b border-white/5 flex gap-4">
                   <div className="flex-1 relative">
                       <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <select 
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        className="w-full bg-slate-800/80 text-white pl-9 pr-4 py-2.5 rounded-lg border border-white/10 text-sm outline-none focus:border-blue-500 appearance-none"
                       >
                           {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                   </div>
                   <div className="flex-1 relative">
                       <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                       <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-800/80 text-white pl-9 pr-4 py-2.5 rounded-lg border border-white/10 text-sm outline-none focus:border-blue-500"
                       />
                   </div>
               </div>

               {/* Segments List */}
               <div className="flex-1 overflow-y-auto p-4 bg-transparent">
                   <h3 className="text-slate-300 text-xs font-bold uppercase mb-3 flex items-center gap-2 drop-shadow">
                       <Clock size={12} /> {selectedDate} 录像片段
                   </h3>
                   <div className="space-y-3">
                       {segments.map(seg => (
                           <div 
                             key={seg.id}
                             onClick={() => handlePlaySegment(seg.id)}
                             className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all active:scale-[0.98] backdrop-blur-sm ${
                                 currentSegment === seg.id 
                                 ? 'bg-blue-900/40 border-blue-500/50 shadow-md' 
                                 : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                             }`}
                           >
                               <div className="flex items-center gap-3">
                                   <div className={`p-2 rounded-full ${seg.isAlarm ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                       <PlayCircle size={18} />
                                   </div>
                                   <div>
                                       <div className="text-sm font-bold text-slate-200">{seg.time}</div>
                                       <div className="text-xs text-slate-500">{seg.type} | {seg.size}</div>
                                   </div>
                               </div>
                               {currentSegment === seg.id && (
                                   <div className="text-xs text-blue-400 font-bold animate-pulse">播放中...</div>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       ) : (
           // --- ARCHIVE TAB ---
           <div className="flex-1 flex flex-col overflow-hidden">
               {/* Filters */}
               <div className="p-4 flex gap-2 overflow-x-auto border-b border-white/5 bg-slate-950/30 backdrop-blur-sm">
                   {['ALL', 'IMAGE', 'VIDEO'].map(type => (
                       <button
                         key={type}
                         onClick={() => setArchiveFilter(type as any)}
                         className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                             archiveFilter === type 
                             ? 'bg-slate-700/80 text-white border-slate-500' 
                             : 'bg-transparent text-slate-400 border-slate-700/50'
                         }`}
                       >
                           {type === 'ALL' ? '全部' : type === 'IMAGE' ? '抓拍图片' : '录像文件'}
                       </button>
                   ))}
               </div>

               {/* Grid */}
               <div className="flex-1 overflow-y-auto p-2">
                   {filteredMedia.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full text-slate-500">
                           <Image size={48} className="opacity-20 mb-2" />
                           <p>暂无媒体文件</p>
                       </div>
                   ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {filteredMedia.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedMedia(item)}
                                    className="aspect-square relative group bg-slate-800/50 cursor-pointer overflow-hidden rounded-sm"
                                >
                                    <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-90 hover:opacity-100" alt="" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                    <div className="absolute top-1 right-1">
                                        {item.type === 'VIDEO' ? <Film size={14} className="text-white drop-shadow-md"/> : <Image size={14} className="text-white drop-shadow-md"/>}
                                    </div>
                                    {item.type === 'VIDEO' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="text-white/80 w-8 h-8 drop-shadow-lg" fill="rgba(0,0,0,0.5)" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                   )}
               </div>
           </div>
       )}

       {/* Detail Modal for Archive */}
       {selectedMedia && (
           <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in zoom-in-95 duration-200">
               {/* Toolbar */}
               <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
                   <button onClick={() => setSelectedMedia(null)} className="text-white p-2 bg-white/10 rounded-full active:bg-white/20 transition-colors"><ArrowLeft /></button>
                   <div className="text-white text-sm font-bold">{selectedMedia.date}</div>
                   <div className="w-10"></div> {/* Spacer */}
               </div>

               {/* Content */}
               <div className="flex-1 flex items-center justify-center">
                   {selectedMedia.type === 'VIDEO' ? (
                       <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" controls className="max-w-full max-h-full" />
                   ) : (
                       <img src={selectedMedia.url} className="max-w-full max-h-full object-contain" alt="" />
                   )}
               </div>

               {/* Footer Info */}
               <div className="bg-slate-900/90 backdrop-blur p-6 pb-safe border-t border-white/10">
                   <div className="flex justify-between items-start mb-6">
                       <div>
                           <h3 className="text-white font-bold text-lg">{selectedMedia.source}</h3>
                           <p className="text-slate-400 text-xs mt-1">文件类型: {selectedMedia.type === 'VIDEO' ? 'MP4 录像' : 'JPG 抓拍'}</p>
                       </div>
                       <div className="flex gap-4">
                           <button 
                             onClick={handleSave}
                             className="flex flex-col items-center gap-1 text-slate-400 hover:text-green-400 active:scale-95 transition-all"
                           >
                               <div className="p-2 bg-slate-800 rounded-full border border-slate-700"><Download size={18}/></div>
                               <span className="text-[10px]">保存</span>
                           </button>
                           <button 
                             onClick={handleDeleteClick}
                             className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-400 active:scale-95 transition-all"
                           >
                               <div className="p-2 bg-slate-800 rounded-full border border-slate-700"><Trash2 size={18}/></div>
                               <span className="text-[10px]">删除</span>
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)}></div>
               <div className="relative bg-slate-800/90 backdrop-blur border border-white/10 p-6 rounded-2xl shadow-2xl max-w-xs w-full space-y-4 animate-in zoom-in-95 duration-200">
                   <div className="flex items-center gap-3 text-red-500">
                       <div className="bg-red-900/30 p-2 rounded-full border border-red-900/50">
                           <AlertTriangle size={24} />
                       </div>
                       <h3 className="text-lg font-bold text-white">确认删除?</h3>
                   </div>
                   
                   <p className="text-slate-300 text-sm leading-relaxed">
                       您即将永久删除该文件，此操作无法撤销。
                   </p>

                   <div className="grid grid-cols-2 gap-3 pt-2">
                       <button 
                           onClick={() => setShowDeleteConfirm(false)} 
                           className="py-3 rounded-xl bg-slate-700/50 text-slate-300 font-medium active:scale-95 transition-transform hover:bg-slate-600/50"
                       >
                           取消
                       </button>
                       <button 
                           onClick={confirmDelete} 
                           className="py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-900/50 active:scale-95 transition-transform hover:bg-red-500"
                       >
                           确认删除
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default MediaLibrary;
