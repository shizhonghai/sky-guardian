import React, { useState, useRef, useEffect } from 'react';
import { Camera, AppSettings } from '../types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Camera as CameraIcon, Video, Volume2, Maximize2, Zap } from 'lucide-react';
import { analyzeSnapshot } from '../services/geminiService';

interface VideoPlayerProps {
  camera: Camera;
  settings: AppSettings;
  isLive: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ camera, settings, isLive }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset analysis when camera changes
  useEffect(() => {
    setAnalysisResult(null);
  }, [camera.id]);

  const handleSnapshot = () => {
    // In a real app, this would use canvas to save the frame
    alert(`已抓拍! 模式: ${settings.snapshotMode === 'SINGLE' ? '单张' : '连拍'}`);
  };

  const handleAnalysis = async () => {
    if (!camera.thumbnail) return;
    setIsAnalysing(true);
    setAnalysisResult(null);
    
    // Simulate fetching image data (in real app, use canvas to get base64)
    const result = await analyzeSnapshot("base64_placeholder", `请分析这张来自 ${camera.name} 的监控画面截图。请描述场景、潜在的安全隐患，以及任何值得注意的人员或物体。请用中文简练回答。`);
    setAnalysisResult(result);
    setIsAnalysing(false);
  };

  return (
    <div className="relative bg-black aspect-video w-full overflow-hidden group">
      {/* Video Content (Simulated with Image) */}
      <img 
        ref={imgRef}
        src={camera.thumbnail} 
        alt={camera.name} 
        className={`w-full h-full object-cover transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-50'}`} 
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={() => setIsPlaying(true)} className="bg-white/20 backdrop-blur rounded-full p-4">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
          </button>
        </div>
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white flex items-center gap-1 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          实时
        </div>
      )}

      {/* Camera Name Overlay */}
      <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-xs text-white">
        {camera.name} | {new Date().toLocaleTimeString()}
      </div>

      {/* PTZ Controls Overlay (Only visible on interaction/hover usually, but sticky for mobile) */}
      {isLive && camera.type === 'PTZ' && (
        <div className="absolute bottom-16 right-4 flex flex-col items-center gap-2">
           <div className="bg-black/40 backdrop-blur-md p-2 rounded-full grid grid-cols-3 gap-1">
              <div className="col-start-2"><button className="p-2 active:bg-blue-500 rounded text-white"><ChevronUp size={20} /></button></div>
              <div className="col-start-1 row-start-2"><button className="p-2 active:bg-blue-500 rounded text-white"><ChevronLeft size={20} /></button></div>
              <div className="col-start-2 row-start-2 bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-[10px] text-white">云台</div>
              <div className="col-start-3 row-start-2"><button className="p-2 active:bg-blue-500 rounded text-white"><ChevronRight size={20} /></button></div>
              <div className="col-start-2 row-start-3"><button className="p-2 active:bg-blue-500 rounded text-white"><ChevronDown size={20} /></button></div>
           </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex justify-between items-center">
        <div className="flex gap-4">
           <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-blue-400">
             {isPlaying ? <span className="font-mono text-xs">暂停</span> : <span className="font-mono text-xs">播放</span>}
           </button>
           <button onClick={handleSnapshot} className="text-white hover:text-blue-400">
             <CameraIcon size={20} />
           </button>
           <button className="text-white hover:text-blue-400">
             <Video size={20} />
           </button>
        </div>
        
        <div className="flex gap-4">
           {/* AI Analysis Button */}
           <button 
             onClick={handleAnalysis} 
             disabled={isAnalysing}
             className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${isAnalysing ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-600 text-white'}`}
           >
             <Zap size={14} />
             {isAnalysing ? '分析中...' : 'AI 慧眼'}
           </button>
           <button className="text-white hover:text-blue-400">
             <Volume2 size={20} />
           </button>
           <button className="text-white hover:text-blue-400">
             <Maximize2 size={20} />
           </button>
        </div>
      </div>

      {/* AI Analysis Result Overlay */}
      {analysisResult && (
        <div className="absolute top-12 left-4 right-16 bg-black/80 backdrop-blur-md p-3 rounded border border-purple-500/30 text-xs text-purple-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-start mb-1">
             <h4 className="font-bold text-purple-400">AI 场景分析</h4>
             <button onClick={() => setAnalysisResult(null)} className="text-gray-400 hover:text-white">×</button>
          </div>
          <p>{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;