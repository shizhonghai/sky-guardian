import React, { useState } from 'react';
import { useApp } from '../context/store';
import { ArrowLeft, ToggleLeft, ToggleRight, Save, LogOut, Radio, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { settings, updateSettings, logout, user } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Fixed Header */}
      <div className="flex-none p-4 bg-slate-950 border-b border-slate-800 shadow-sm z-10">
          <div className="flex items-center gap-3">
               <button onClick={() => navigate(-1)} className="p-1 text-slate-400"><ArrowLeft /></button>
               <h1 className="text-xl font-bold text-white">系统设置</h1>
          </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
            {/* User Info */}
            <section className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{user?.name || '管理员'}</h3>
                <p className="text-xs text-slate-500">角色: {user?.role || 'User'}</p>
              </div>
              <button onClick={handleLogout} className="text-red-400 text-sm flex items-center gap-1">
                <LogOut size={16} /> 退出
              </button>
            </section>

            {/* Video Source Quality */}
            <section className="bg-slate-800 p-4 rounded-xl">
               <h3 className="text-sm text-slate-400 uppercase font-semibold mb-4">视频画质</h3>
               <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
                  {['HD', 'SD', 'AUTO'].map(type => (
                    <button 
                      key={type}
                      onClick={() => updateSettings({ videoSourceType: type as any })}
                      className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${settings.videoSourceType === type ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
                    >
                      {type === 'AUTO' ? '自动' : type}
                    </button>
                  ))}
               </div>
            </section>

            {/* Source Protocol Configuration (New) */}
            <section className="bg-slate-800 p-4 rounded-xl">
               <div className="flex items-center gap-2 mb-4">
                  <Server size={16} className="text-blue-400" />
                  <h3 className="text-sm text-slate-400 uppercase font-semibold">来源类型配置</h3>
               </div>
               
               <div className="space-y-3">
                  {[
                    { id: 'GB28181', label: '国标 GB/T 28181', desc: '适用于安防平台级联' },
                    { id: 'ONVIF', label: 'ONVIF 协议', desc: '适用于标准化网络摄像机' },
                    { id: 'RTSP', label: 'RTSP 直连', desc: '低延迟流媒体直接访问' }
                  ].map((protocol) => (
                    <div 
                      key={protocol.id}
                      onClick={() => updateSettings({ sourceProtocol: protocol.id as any })}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        settings.sourceProtocol === protocol.id 
                          ? 'bg-blue-900/20 border-blue-500/50' 
                          : 'bg-slate-700/30 border-slate-700 hover:bg-slate-700/50'
                      }`}
                    >
                       <div className="flex flex-col">
                          <span className={`text-sm font-medium ${settings.sourceProtocol === protocol.id ? 'text-blue-300' : 'text-slate-300'}`}>
                            {protocol.label}
                          </span>
                          <span className="text-[10px] text-slate-500">{protocol.desc}</span>
                       </div>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${settings.sourceProtocol === protocol.id ? 'border-blue-500' : 'border-slate-500'}`}>
                          {settings.sourceProtocol === protocol.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* PTZ Speed */}
            <section className="bg-slate-800 p-4 rounded-xl">
               <div className="flex justify-between mb-2">
                  <h3 className="text-sm text-slate-400 uppercase font-semibold">云台速度</h3>
                  <span className="text-blue-400 font-bold">{settings.ptzSpeed}</span>
               </div>
               <input 
                 type="range" 
                 min="1" max="10" 
                 value={settings.ptzSpeed}
                 onChange={(e) => updateSettings({ ptzSpeed: parseInt(e.target.value) })}
                 className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
               <div className="flex justify-between text-xs text-slate-500 mt-2">
                 <span>慢</span>
                 <span>快</span>
               </div>
            </section>

             {/* Snapshot Mode */}
             <section className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
               <div>
                  <h3 className="text-sm text-slate-400 uppercase font-semibold">抓拍模式</h3>
                  <p className="text-xs text-slate-500 mt-1">{settings.snapshotMode === 'BURST' ? '连拍 (3张)' : '单张抓拍'}</p>
               </div>
               <button 
                 onClick={() => updateSettings({ snapshotMode: settings.snapshotMode === 'SINGLE' ? 'BURST' : 'SINGLE' })}
                 className="text-blue-500"
               >
                 {settings.snapshotMode === 'BURST' ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-slate-600" />}
               </button>
            </section>
        </div>

        <div className="mt-8 pb-8">
            <button onClick={() => navigate(-1)} className="w-full bg-blue-600 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 hover:bg-blue-500 active:scale-95 transition-all">
              <Save size={18} /> 保存配置
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;