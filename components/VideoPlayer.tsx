
import React, { useState, useRef, useEffect } from 'react';
import { Camera, AppSettings } from '../types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Camera as CameraIcon, Video, Volume2, VolumeX, Zap, ZoomIn, ZoomOut, RotateCcw, WifiOff } from 'lucide-react';
import { analyzeSnapshot } from '../services/geminiService';
import { useApp } from '../context/store';

interface VideoPlayerProps {
  camera: Camera;
  settings: AppSettings;
  isLive: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ camera, settings, isLive }) => {
  const { showToast } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  // Real-time Clock State
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Recording & Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  // PTZ State
  const [zoom, setZoom] = useState(1.2); // Start slightly zoomed in to allow panning
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);

  const isOffline = camera.status === 'OFFLINE';

  // Reset State when camera changes
  useEffect(() => {
    setAnalysisResult(null);
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    setIsRecording(false);
    setRecordingTime(0);
    // Force stop playing if offline, auto play if online
    setIsPlaying(!isOffline);
  }, [camera.id, isOffline]);

  // Clock Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recording Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
        interval = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    } else {
        setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSnapshot = () => {
    if (isOffline) return;
    
    // Simulate Flash Effect
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white z-50 transition-opacity duration-300';
    imgRef.current?.parentElement?.appendChild(flash);
    setTimeout(() => {
        flash.classList.add('opacity-0');
        setTimeout(() => flash.remove(), 300);
    }, 50);

    showToast('抓拍成功，图片已保存至云端', 'success');
  };

  const handleToggleRecord = () => {
      if (isOffline) return;

      if (isRecording) {
          setIsRecording(false);
          showToast('录像已停止，文件保存至云端', 'success');
      } else {
          setIsRecording(true);
          showToast('开始录像...', 'info');
      }
  };

  const handleAnalysis = async () => {
    if (isOffline || !camera.thumbnail) return;
    setIsAnalysing(true);
    setAnalysisResult(null);
    
    // Simulate fetching image data
    const result = await analyzeSnapshot("base64_placeholder", `请分析这张来自 ${camera.name} 的监控画面截图。请描述场景、潜在的安全隐患，以及任何值得注意的人员或物体。请用中文简练回答。`);
    setAnalysisResult(result);
    setIsAnalysing(false);
  };

  // PTZ Logic
  const handlePTZ = (action: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ZOOM_IN' | 'ZOOM_OUT' | 'RESET') => {
    if (!isPlaying || isOffline) return;

    const step = 50; // Pixel movement per click
    const zoomStep = 0.2;
    const maxZoom = 3.0;
    const minZoom = 1.0;

    switch (action) {
      case 'UP':
        setPan(p => ({ ...p, y: Math.min(p.y + step, (zoom - 1) * 200) })); 
        break;
      case 'DOWN':
        setPan(p => ({ ...p, y: Math.max(p.y - step, -(zoom - 1) * 200) }));
        break;
      case 'LEFT':
        setPan(p => ({ ...p, x: Math.min(p.x + step, (zoom - 1) * 300) }));
        break;
      case 'RIGHT':
        setPan(p => ({ ...p, x: Math.max(p.x - step, -(zoom - 1) * 300) }));
        break;
      case 'ZOOM_IN':
        setZoom(z => Math.min(z + zoomStep, maxZoom));
        break;
      case 'ZOOM_OUT':
        setZoom(z => {
          const newZoom = Math.max(z - zoomStep, minZoom);
          // If zooming out, we might need to clamp pan to avoid white edges
          if (newZoom < zoom) {
             setPan({ x: 0, y: 0 }); // Simplification: recenter on zoom out to prevent issues
          }
          return newZoom;
        });
        break;
      case 'RESET':
        setZoom(1.2);
        setPan({ x: 0, y: 0 });
        break;
    }
  };

  return (
    <div className="relative bg-black aspect-video w-full overflow-hidden group select-none shadow-2xl">
      {/* Video Content (Simulated with CSS Transform) */}
      <div className="w-full h-full overflow-hidden relative">
        {isOffline ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-0">
                <div className="bg-slate-800 p-4 rounded-full mb-3 shadow-inner border border-slate-700 animate-pulse">
                    <WifiOff size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-bold tracking-wide">设备已离线</p>
                <p className="text-slate-600 text-xs mt-1">请检查网络连接或电源</p>
            </div>
        ) : (
            <>
                <img 
                    ref={imgRef}
                    src={camera.thumbnail} 
                    alt={camera.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isPlaying ? 'opacity-100' : 'opacity-50'}`} 
                    style={{
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
                    }}
                />
                
                {/* CRT/Digital Noise Overlay for realism */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                    style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/Noise_overlay.png")' }}>
                </div>
            </>
        )}
      </div>
      
      {!isPlaying && !isOffline && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button onClick={() => setIsPlaying(true)} className="bg-white/20 backdrop-blur rounded-full p-4 hover:bg-white/30 transition-colors">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
          </button>
        </div>
      )}

      {/* Live Badge */}
      {!isOffline && isLive && (
        <div className="absolute top-4 left-4 bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1 z-10 shadow-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          实时
        </div>
      )}

      {/* Offline Badge */}
      {isOffline && (
        <div className="absolute top-4 left-4 bg-slate-700/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-300 flex items-center gap-1 z-10 border border-slate-600">
          <WifiOff size={12} /> 信号中断
        </div>
      )}

      {/* Recording Indicator with Timer */}
      {!isOffline && isRecording && (
          <div className="absolute top-12 left-4 flex items-center gap-2 z-10 bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-red-900/30">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <span className="text-red-400 font-mono font-bold text-xs tracking-widest">REC</span>
              <span className="text-white font-mono text-xs ml-1 border-l border-white/20 pl-2">{formatTime(recordingTime)}</span>
          </div>
      )}

      {/* Camera Name Overlay */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white z-10 border border-white/10 font-mono">
        {camera.name} | {currentTime}
      </div>

      {/* PTZ Controls Overlay (Floating Joystick) - Hidden if Offline */}
      {!isOffline && isLive && camera.type === 'PTZ' && (
        <div className="absolute bottom-14 right-4 flex flex-col items-center gap-2 z-20 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-full grid grid-cols-3 gap-0.5 shadow-lg border border-white/10 place-items-center">
              <div className="col-start-2">
                  <button onClick={() => handlePTZ('UP')} className="p-1.5 active:bg-blue-600/80 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronUp size={18} /></button>
              </div>
              <div className="col-start-1 row-start-2">
                  <button onClick={() => handlePTZ('LEFT')} className="p-1.5 active:bg-blue-600/80 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronLeft size={18} /></button>
              </div>
              <div className="col-start-2 row-start-2">
                  <button onClick={() => handlePTZ('RESET')} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600/80 text-white active:scale-90 transition-transform shadow-sm">
                      <RotateCcw size={14} />
                  </button>
              </div>
              <div className="col-start-3 row-start-2">
                  <button onClick={() => handlePTZ('RIGHT')} className="p-1.5 active:bg-blue-600/80 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronRight size={18} /></button>
              </div>
              <div className="col-start-2 row-start-3">
                  <button onClick={() => handlePTZ('DOWN')} className="p-1.5 active:bg-blue-600/80 hover:bg-white/10 rounded-full text-white transition-colors"><ChevronDown size={18} /></button>
              </div>
           </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex justify-between items-center z-20">
        <div className="flex gap-4">
           <button 
             disabled={isOffline}
             onClick={() => setIsPlaying(!isPlaying)} 
             className={`text-white transition-colors ${isOffline ? 'opacity-40 cursor-not-allowed' : 'hover:text-blue-400'}`}
           >
             {isPlaying ? <span className="font-mono text-xs font-bold">PAUSE</span> : <span className="font-mono text-xs font-bold text-red-500">PLAY</span>}
           </button>
           
           {/* Snapshot */}
           <button 
             disabled={isOffline}
             onClick={handleSnapshot} 
             className={`text-white transition-colors active:scale-90 ${isOffline ? 'opacity-40 cursor-not-allowed' : 'hover:text-blue-400'}`}
           >
             <CameraIcon size={20} />
           </button>

           {/* Recording */}
           <button 
             disabled={isOffline}
             onClick={handleToggleRecord} 
             className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-white hover:text-blue-400'} transition-colors active:scale-90 ${isOffline ? 'opacity-40 cursor-not-allowed' : ''}`}
           >
             <Video size={20} />
           </button>

           <div className="w-px h-5 bg-white/20 mx-1"></div>
           
           {/* Zoom Controls in Bar */}
           <button disabled={isOffline} onClick={() => handlePTZ('ZOOM_OUT')} className={`text-white transition-colors active:scale-90 ${isOffline ? 'opacity-40 cursor-not-allowed' : 'hover:text-blue-400'}`}>
             <ZoomOut size={20} />
           </button>
           <button disabled={isOffline} onClick={() => handlePTZ('ZOOM_IN')} className={`text-white transition-colors active:scale-90 ${isOffline ? 'opacity-40 cursor-not-allowed' : 'hover:text-blue-400'}`}>
             <ZoomIn size={20} />
           </button>
        </div>
        
        <div className="flex gap-4">
           {/* AI Analysis Button */}
           <button 
             onClick={handleAnalysis} 
             disabled={isAnalysing || isOffline}
             className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-lg active:scale-95 ${
                 isOffline ? 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed opacity-50' :
                 isAnalysing ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 
                 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/50'
             }`}
           >
             <Zap size={14} className={isAnalysing ? 'animate-pulse' : ''} />
             {isAnalysing ? '分析中...' : 'AI 慧眼'}
           </button>
           
           {/* Mute Toggle */}
           <button disabled={isOffline} onClick={() => setIsMuted(!isMuted)} className={`text-white transition-colors ${isOffline ? 'opacity-40 cursor-not-allowed' : 'hover:text-blue-400'}`}>
             {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
           </button>
        </div>
      </div>

      {/* AI Analysis Result Overlay */}
      {analysisResult && (
        <div className="absolute top-12 left-4 right-16 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-purple-500/30 text-xs text-purple-100 animate-in fade-in slide-in-from-top-4 shadow-2xl z-30">
          <div className="flex justify-between items-start mb-2">
             <h4 className="font-bold text-purple-400 flex items-center gap-2"><Zap size={14}/> 智能分析报告</h4>
             <button onClick={() => setAnalysisResult(null)} className="text-gray-400 hover:text-white bg-white/10 rounded-full p-1"><X size={12} /></button>
          </div>
          <p className="leading-relaxed opacity-90">{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

// Helper for icon
const X = ({size}: {size:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
)

export default VideoPlayer;
