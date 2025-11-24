import React, { createContext, useContext, useState, useEffect } from 'react';
import { Camera, Alarm, VehicleRecord, TodoItem, AppSettings, CameraStatus, AlarmType, AlarmStatus } from '../types';

// Mock Data (Translated)
const MOCK_CAMERAS: Camera[] = [
  { id: '1', name: '主要入口大门', location: 'A区', status: CameraStatus.ONLINE, type: 'PTZ', thumbnail: 'https://picsum.photos/800/450?random=1', coordinates: { x: 20, y: 30 } },
  { id: '2', name: 'B区停车场', location: 'B区', status: CameraStatus.ONLINE, type: 'BULLET', thumbnail: 'https://picsum.photos/800/450?random=2', coordinates: { x: 60, y: 25 } },
  { id: '3', name: '仓库通道', location: 'C区', status: CameraStatus.ALARM, type: 'DOME', thumbnail: 'https://picsum.photos/800/450?random=3', coordinates: { x: 40, y: 70 } },
  { id: '4', name: '北侧围栏', location: 'D区', status: CameraStatus.OFFLINE, type: 'PTZ', thumbnail: 'https://picsum.photos/800/450?random=4', coordinates: { x: 80, y: 80 } },
];

const MOCK_ALARMS: Alarm[] = [
  { id: 'a1', type: AlarmType.INTRUSION, title: '移动侦测报警', timestamp: '10:42', cameraName: '仓库通道', status: AlarmStatus.PENDING, description: '限制区域内检测到不明人员活动。', snapshotUrl: 'https://picsum.photos/300/200?random=10' },
  { id: 'a2', type: AlarmType.FIRE, title: '烟雾报警', timestamp: '09:15', cameraName: '厨房区域', status: AlarmStatus.PROCESSING, description: '烟雾探测器被触发，请核实。', snapshotUrl: 'https://picsum.photos/300/200?random=11' },
  { id: 'a3', type: AlarmType.VEHICLE, title: '黑名单车辆', timestamp: '08:30', cameraName: '主要入口大门', status: AlarmStatus.RESOLVED, description: '车牌号 京A-88888 匹配布控名单。', snapshotUrl: 'https://picsum.photos/300/200?random=12' },
];

const MOCK_TODOS: TodoItem[] = [
  { id: 't1', title: 'A区消防器材巡检', priority: 'HIGH', dueDate: '今天', type: 'PATROL', status: 'OPEN' },
  { id: 't2', title: '复核 #A1 入侵报警', priority: 'MEDIUM', dueDate: '今天', type: 'ALARM_REVIEW', status: 'OPEN' },
  { id: 't3', title: '维修 #4 号摄像机连接问题', priority: 'HIGH', dueDate: '明天', type: 'ISSUE', status: 'OPEN' },
];

const MOCK_VEHICLES: VehicleRecord[] = [
  { id: 'v1', plate: '京A-58231', color: '白色', type: '轿车', timestamp: '10:45', location: 'A号门', imageUrl: 'https://picsum.photos/200/100', isWatchlisted: false },
  { id: 'v2', plate: '黑B-99999', color: '黑色', type: 'SUV', timestamp: '10:40', location: 'B号门', imageUrl: 'https://picsum.photos/200/100', isWatchlisted: true },
];

interface AppState {
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  cameras: Camera[];
  activeCamera: Camera | null;
  alarms: Alarm[];
  todos: TodoItem[];
  settings: AppSettings;
  vehicles: VehicleRecord[];
  
  // Actions
  login: () => void;
  logout: () => void;
  setActiveCamera: (camera: Camera) => void;
  updateAlarmStatus: (id: string, status: AlarmStatus) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addAlarm: (alarm: Alarm) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const [cameras] = useState<Camera[]>(MOCK_CAMERAS);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(MOCK_CAMERAS[0]);
  const [alarms, setAlarms] = useState<Alarm[]>(MOCK_ALARMS);
  const [todos, setTodos] = useState<TodoItem[]>(MOCK_TODOS);
  const [settings, setSettings] = useState<AppSettings>({
    snapshotMode: 'SINGLE',
    ptzSpeed: 5,
    videoSourceType: 'HD',
    sourceProtocol: 'GB28181'
  });
  const [vehicles] = useState<VehicleRecord[]>(MOCK_VEHICLES);

  const login = () => {
    setIsAuthenticated(true);
    setUser({ name: '指挥中心管理员', role: 'ADMIN' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  // Simulate incoming alarms periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const newAlarm: Alarm = {
          id: `new-${Date.now()}`,
          type: AlarmType.INTRUSION,
          title: '周界入侵报警',
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          cameraName: '北侧围栏',
          status: AlarmStatus.PENDING,
          description: '周界感应器触发，检测到异常震动。',
          snapshotUrl: `https://picsum.photos/300/200?random=${Date.now()}`
        };
        setAlarms(prev => [newAlarm, ...prev]);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateAlarmStatus = (id: string, status: AlarmStatus) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addAlarm = (alarm: Alarm) => {
    setAlarms(prev => [alarm, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      cameras,
      activeCamera,
      alarms,
      todos,
      settings,
      vehicles,
      login,
      logout,
      setActiveCamera,
      updateAlarmStatus,
      updateSettings,
      addAlarm
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};