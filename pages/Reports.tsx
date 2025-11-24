
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Activity, Calendar, PieChart as PieChartIcon, BarChart3, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/store';

// Simple types for chart data
interface DataPoint {
  label: string;
  value: number;
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { alarms, cameras, vehicles } = useApp();
  const [timeRange, setTimeRange] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 100);
  }, [timeRange]);

  // 1. Calculate Real Stats
  const totalAlarms = alarms.length;
  // Calculate resolved rate based on real data
  const resolvedCount = alarms.filter(a => a.status === 'RESOLVED').length;
  const handlingRate = totalAlarms > 0 ? Math.round((resolvedCount / totalAlarms) * 100) : 100;
  
  // Calculate online rate based on real cameras
  const onlineCameras = cameras.filter(c => c.status === 'ONLINE').length;
  const onlineRate = cameras.length > 0 ? Math.round((onlineCameras / cameras.length) * 100) : 0;

  // Mock Patrol Rate (since we don't have full patrol data yet)
  const patrolRate = 85 + Math.floor(Math.random() * 10);

  // 2. Trend Data Generation
  const getTrendData = (): DataPoint[] => {
    if (timeRange === 'DAY') {
        // Simple hour buckets
        return [
            { label: '00:00', value: 2 },
            { label: '04:00', value: 1 },
            { label: '08:00', value: 5 },
            { label: '12:00', value: Math.max(2, Math.floor(totalAlarms * 0.4)) }, // Approximate peak based on real count
            { label: '16:00', value: 3 },
            { label: '20:00', value: 4 },
        ];
    }
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days.map(d => ({ label: d, value: Math.floor(Math.random() * 15) + 2 }));
  };

  const getAlarmTypeData = () => {
      // Calculate real percentages if possible, otherwise mock distribution of the total
      const intrusion = alarms.filter(a => a.type === 'INTRUSION').length;
      const fire = alarms.filter(a => a.type === 'FIRE').length;
      const vehicle = alarms.filter(a => a.type === 'VEHICLE').length;
      const total = Math.max(totalAlarms, 1);
      
      return [
        { label: '周界入侵', value: Math.max(10, Math.round((intrusion / total) * 100)), color: 'bg-red-500' },
        { label: '消防烟感', value: Math.max(10, Math.round((fire / total) * 100)), color: 'bg-orange-500' },
        { label: '黑名单车辆', value: Math.max(10, Math.round((vehicle / total) * 100)), color: 'bg-blue-500' },
        { label: '设备离线', value: 15, color: 'bg-gray-500' }, 
        { label: '其他异常', value: 10, color: 'bg-purple-500' },
      ];
  };

  // 3. Traffic Data (SVG Chart)
  // Use real vehicle count as a baseline
  const totalVehicles = vehicles.length;
  const trafficData = [
      { x: 0, label: '00:00', val: 5 },
      { x: 20, label: '06:00', val: 12 },
      { x: 40, label: '09:00', val: 45 },
      { x: 60, label: '12:00', val: 28 },
      { x: 80, label: '18:00', val: totalVehicles > 10 ? totalVehicles : 35 }, // Use real count as peak
      { x: 100, label: '23:59', val: 8 },
  ];

  const trendData = getTrendData();
  const typeData = getAlarmTypeData();
  const maxTrendValue = Math.max(...trendData.map(d => d.value)) * 1.2;

  // Chart Configuration
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 150;
  const CHART_PADDING_BOTTOM = 20; // Space for labels
  const CHART_HEIGHT = CANVAS_HEIGHT - CHART_PADDING_BOTTOM;
  
  const maxTrafficVal = Math.max(...trafficData.map(d => d.val)) * 1.2;

  // Coordinate mappers
  const getX = (percent: number) => (percent / 100) * CANVAS_WIDTH;
  const getY = (val: number) => {
    const ratio = val / maxTrafficVal;
    const availableHeight = CHART_HEIGHT - 20; 
    return CHART_HEIGHT - (ratio * availableHeight);
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-20">
      {/* Header */}
      <div className="p-4 bg-blue-950/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-20 flex items-center justify-between shadow-lg">
         <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-1 text-slate-400 hover:text-white"><ArrowLeft /></button>
             <h1 className="text-xl font-bold text-white">统计报表</h1>
         </div>
         <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-lg p-0.5 border border-white/5">
             {['DAY', 'WEEK', 'MONTH'].map((t) => (
                 <button 
                    key={t}
                    onClick={() => setTimeRange(t as any)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${timeRange === t ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                    {t === 'DAY' ? '今日' : t === 'WEEK' ? '本周' : '本月'}
                 </button>
             ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
             <StatCard 
                icon={<AlertTriangle size={18} className="text-red-400"/>} 
                label="报警总数" 
                value={totalAlarms.toString()} 
                subValue={timeRange === 'DAY' ? "较昨日 +2" : "环比 +12%"}
                delay={0}
             />
             <StatCard 
                icon={<CheckCircle size={18} className="text-green-400"/>} 
                label="处置完成率" 
                value={`${handlingRate}%`} 
                subValue="平均耗时 15min"
                delay={100}
             />
             <StatCard 
                icon={<Activity size={18} className="text-blue-400"/>} 
                label="设备在线率" 
                value={`${onlineRate}%`} 
                subValue={`离线设备 ${cameras.length - onlineCameras}`}
                delay={200}
             />
             <StatCard 
                icon={<Calendar size={18} className="text-purple-400"/>} 
                label="巡检完成率" 
                value={`${patrolRate}%`} 
                subValue="漏检点位 0"
                delay={300}
             />
          </div>

          {/* Alarm Trend Chart (Bar) */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-white/5 shadow-lg">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={18} className="text-blue-400" />
                <h3 className="text-white font-bold text-sm">报警趋势分析</h3>
             </div>
             
             <div className="h-40 flex items-end justify-between gap-2 px-2 pt-4">
                 {trendData.map((d, i) => {
                     const heightPercent = (d.value / maxTrendValue) * 100;
                     return (
                         <div key={i} className="flex flex-col items-center flex-1 group relative">
                             {/* Always Visible Value Label */}
                             <span className="mb-1 text-[10px] font-bold text-blue-200 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${i * 100 + 500}ms` }}>
                                {d.value}
                             </span>
                             
                             <div className="w-full flex items-end justify-center h-28 rounded-t-sm bg-slate-700/20 overflow-hidden relative">
                                 <div 
                                    className={`w-3/5 rounded-t transition-all duration-1000 ease-out bg-gradient-to-t from-blue-600 to-blue-400/80 ${animate ? 'opacity-100' : 'opacity-0 translate-y-full'}`}
                                    style={{ height: `${animate ? heightPercent : 0}%`, transitionDelay: `${i * 100}ms` }}
                                 ></div>
                             </div>
                             <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">{d.label}</span>
                         </div>
                     );
                 })}
             </div>
          </div>

          {/* Alarm Type Distribution (Progress Bars) */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-white/5 shadow-lg">
             <div className="flex items-center gap-2 mb-6">
                <PieChartIcon size={18} className="text-orange-400" />
                <h3 className="text-white font-bold text-sm">报警类型分布</h3>
             </div>
             
             <div className="space-y-4">
                 {typeData.map((type, i) => (
                     <div key={type.label} className="space-y-1">
                         <div className="flex justify-between text-xs">
                             <span className="text-slate-300">{type.label}</span>
                             <span className="text-slate-400 font-mono">{type.value}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-900/50 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${type.color}`}
                                style={{ width: `${animate ? type.value : 0}%`, transitionDelay: `${i * 100}ms` }}
                             ></div>
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* Vehicle Traffic Trend (SVG Line with Dots and Labels) */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-white/5 shadow-lg">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Car size={18} className="text-green-400" />
                    <h3 className="text-white font-bold text-sm">园区车流量 (24h)</h3>
                </div>
                <div></div>
             </div>
             
             <div className="relative h-40 w-full mt-2 select-none">
                 <svg 
                    className="w-full h-full overflow-visible" 
                    viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} 
                 >
                     <defs>
                         <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                             <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                         </linearGradient>
                     </defs>
                     
                     {(() => {
                        const pointsString = trafficData.map(d => `${getX(d.x)},${getY(d.val)}`).join(' ');
                        const areaPoints = `0,${CHART_HEIGHT} ${pointsString} ${CANVAS_WIDTH},${CHART_HEIGHT}`;

                        return (
                          <>
                             <path 
                                d={`M${areaPoints} Z`}
                                fill="url(#trafficGradient)"
                                className="opacity-100"
                             />
                             <polyline 
                                points={pointsString}
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`transition-all duration-[2000ms] ease-out ${animate ? 'stroke-dasharray-[1000] stroke-dashoffset-0' : 'stroke-dasharray-[1000] stroke-dashoffset-[1000]'}`}
                             />
                             
                             {animate && trafficData.map((d, i) => {
                                 const px = getX(d.x);
                                 const py = getY(d.val);
                                 
                                 return (
                                     <g key={i}>
                                         <circle 
                                            cx={px} 
                                            cy={py} 
                                            r="2.5" 
                                            fill="#0f172a" 
                                            stroke="#22c55e" 
                                            strokeWidth="2"
                                            className="animate-in fade-in zoom-in duration-300"
                                            style={{ animationDelay: `${i * 100 + 1000}ms` }}
                                         />
                                         <text 
                                            x={px} 
                                            y={py - 8} 
                                            fontSize="10" 
                                            fontWeight="bold"
                                            fill="#86efac" 
                                            textAnchor="middle"
                                            className="animate-in fade-in slide-in-from-bottom-1 duration-300 font-mono"
                                            style={{ animationDelay: `${i * 100 + 1200}ms` }}
                                         >
                                             {d.val}
                                         </text>
                                         <text 
                                            x={px} 
                                            y={CANVAS_HEIGHT - 5} 
                                            fontSize="9" 
                                            fill="#94a3b8" 
                                            textAnchor="middle"
                                         >
                                             {d.label}
                                         </text>
                                     </g>
                                 );
                             })}
                          </>
                        );
                     })()}
                 </svg>
             </div>
          </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{icon: React.ReactNode, label: string, value: string, subValue: string, delay: number}> = ({ icon, label, value, subValue, delay }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-md animate-in zoom-in duration-500 fill-mode-backwards" style={{ animationDelay: `${delay}ms` }}>
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-medium">
                {icon}
                {label}
            </div>
            <div className="text-2xl font-bold text-white font-mono">{value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{subValue}</div>
        </div>
    )
}

export default Reports;
