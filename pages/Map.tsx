
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/store';
import { MapPin, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    AMap: any;
  }
}

const MapPage: React.FC = () => {
  const { cameras, setActiveCamera } = useApp();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [mapError, setMapError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let checkTimer: ReturnType<typeof setInterval> | null = null;
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    const initMap = () => {
      // 1. Check SDK
      if (!window.AMap) {
        setMapError(true);
        setErrorMessage("AMap JS API 未加载");
        setIsLoading(false);
        return;
      }

      // 2. Check Container
      if (!mapContainerRef.current) {
        // Container not ready yet, keep loading or fail silently until next effect
        return;
      }

      // 3. Destroy existing instance if any (StrictMode handling)
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch(e) {}
        mapInstanceRef.current = null;
      }

      try {
        console.log("Initializing AMap...");
        const map = new window.AMap.Map(mapContainerRef.current, {
          zoom: 15, // Standard view for 2D
          center: [117.971185, 28.44442], // Shangrao City Center (Xinzhou District)
          viewMode: '2D', // Enable 2D Mode
          pitch: 0,
          rotation: 0,
          mapStyle: 'amap://styles/dark', // Use standard dark theme
        });

        mapInstanceRef.current = map;

        // Add Markers
        cameras.forEach((cam) => {
          const content = document.createElement('div');
          content.className = 'relative flex flex-col items-center group cursor-pointer';
          content.innerHTML = `
            <div class="p-2 rounded-full shadow-lg transition-transform hover:scale-110 ${
              cam.status === 'ALARM' ? 'bg-red-500 animate-bounce' :
                  cam.status === 'ONLINE' ? 'bg-blue-500' : 'bg-gray-500'
          }">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="${cam.status === 'OFFLINE' ? '#cbd5e1' : '#ffffff'}" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="mt-1 px-2 py-1 bg-black/80 backdrop-blur rounded text-[10px] text-white whitespace-nowrap border border-white/10 font-bold transform transition-all group-hover:-translate-y-1">
              ${cam.name}
            </div>
          `;

          content.onclick = () => {
            setActiveCamera(cam);
            navigate('/monitor');
          };

          const marker = new window.AMap.Marker({
            position: cam.latLng,
            content: content,
            offset: new window.AMap.Pixel(-20, -40), // Adjusted offset (removed stalk height)
            map: map,
            zIndex: cam.status === 'ALARM' ? 100 : 10,
          });
        });

        map.on('complete', () => {
          console.log("AMap Loaded Successfully");
          setIsLoading(false);
          setMapError(false);
        });

        // If complete event doesn't fire fast enough, force loading off
        setTimeout(() => setIsLoading(false), 2000);

      } catch (e: any) {
        console.error("AMap Init Failed:", e);
        setMapError(true);
        setErrorMessage(e.message || "地图实例创建异常");
        setIsLoading(false);
      }
    };

    // Wait for AMap to be available
    if (window.AMap) {
      // Small delay to ensure DOM layout is computed
      initTimer = setTimeout(initMap, 100);
    } else {
      checkTimer = setInterval(() => {
        if (window.AMap) {
          clearInterval(checkTimer!);
          initMap();
        }
      }, 500);

      // Timeout
      setTimeout(() => {
        if (!window.AMap && isLoading) {
          setMapError(true);
          setErrorMessage("SDK 加载超时，网络可能不通");
          setIsLoading(false);
        }
      }, 5000);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
      if (initTimer) clearTimeout(initTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [cameras, navigate, setActiveCamera]);

  return (
      <div className="h-full w-full bg-transparent relative overflow-hidden flex flex-col">
        {/* Hide AMap Logo & Copyright via CSS Injection */}
        <style>{`
        .amap-logo, .amap-copyright {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>

        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-blue-950/80 backdrop-blur-md pointer-events-none shadow-lg border-b border-white/10">
          <h2 className="text-lg font-bold text-white">电子地图</h2>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-[#0f172a]">
          <div ref={mapContainerRef} className="w-full h-full" id="amap-container"></div>

          {/* Loading State */}
          {isLoading && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-30">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
          )}

          {/* Error State with Details */}
          {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-30 p-8 text-center">
                <div className="bg-red-900/20 p-4 rounded-full mb-4 animate-bounce">
                  <AlertTriangle size={48} className="text-red-500" />
                </div>
                <h3 className="text-white font-bold mb-2">地图加载失败</h3>

                {errorMessage && (
                    <div className="bg-black/50 p-3 rounded border border-red-500/30 mb-4 max-w-xs break-all">
                      <p className="text-red-400 text-xs font-mono">{errorMessage}</p>
                    </div>
                )}

                <div className="text-slate-400 text-xs space-y-2 max-w-xs">
                  <p>可能原因:</p>
                  <ul className="list-disc list-inside text-left px-4 text-slate-500">
                    <li>Key 与安全密钥不匹配</li>
                    <li>域名未添加至高德白名单</li>
                    <li>网络拦截了 JS API 请求</li>
                  </ul>
                </div>

                <button onClick={() => window.location.reload()} className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-colors">
                  <RefreshCw size={16}/> 刷新重试
                </button>
              </div>
          )}
        </div>

        {/* Legend - Only show if no error */}
        {!mapError && !isLoading && (
            <div className="absolute bottom-24 right-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700 backdrop-blur-md z-20 shadow-lg">
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div> 在线</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div> 报警</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-full border border-gray-400"></div> 离线</div>
              </div>
            </div>
        )}
      </div>
  );
};

export default MapPage;
