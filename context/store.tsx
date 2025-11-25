
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Camera, Alarm, VehicleRecord, TodoItem, AppSettings, CameraStatus, AlarmType, AlarmStatus, Toast, IssueLog } from '../types';
import { generateVehicleCapture } from '../utils/mockGenerator';

// Helper to generate realistic dates for demo purposes
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const formatDate = (date: Date, time: string) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d} ${time}`;
};

const getNowString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Mock Data (Translated) - All set to PTZ to enable controls for all
// Coordinates centered around Shangrao City Center (Xinzhou District) [117.971185, 28.44442]
const MOCK_CAMERAS: Camera[] = [
  { id: '1', name: '主要入口大门', location: 'A区', status: CameraStatus.ONLINE, type: 'PTZ', thumbnail: 'https://picsum.photos/800/450?random=1', coordinates: { x: 20, y: 30 }, latLng: [117.971185, 28.44442] },
  { id: '2', name: 'B区停车场', location: 'B区', status: CameraStatus.ONLINE, type: 'PTZ', thumbnail: 'https://picsum.photos/800/450?random=2', coordinates: { x: 60, y: 25 }, latLng: [117.975200, 28.44650] },
  { id: '3', name: '仓库通道', location: 'C区', status: CameraStatus.ALARM, type: 'PTZ', thumbnail: 'https://picsum.photos/800/450?random=3', coordinates: { x: 40, y: 70 }, latLng: [117.968500, 28.44300] },
  { id: '4', name: '北侧围栏', location: 'D区', status: CameraStatus.OFFLINE, type: 'PTZ', thumbnail: 'https://picsum.photos/800/450?random=4', coordinates: { x: 80, y: 80 }, latLng: [117.972500, 28.44100] },
];

const MOCK_ALARMS: Alarm[] = [
  { id: 'a1', type: AlarmType.INTRUSION, title: '移动侦测报警', timestamp: '10:42', cameraName: '仓库通道', status: AlarmStatus.PENDING, description: '限制区域内检测到不明人员活动。', snapshotUrl: 'https://picsum.photos/300/200?random=10' },
  { id: 'a2', type: AlarmType.FIRE, title: '烟雾报警', timestamp: '09:15', cameraName: '厨房区域', status: AlarmStatus.PROCESSING, description: '烟雾探测器被触发，请核实。', snapshotUrl: 'https://picsum.photos/300/200?random=11', relatedIssueId: 't2' },
  { id: 'a3', type: AlarmType.VEHICLE, title: '黑名单车辆', timestamp: '08:30', cameraName: '主要入口大门', status: AlarmStatus.RESOLVED, description: '车牌号 赣E·88888 匹配布控名单。', snapshotUrl: 'https://picsum.photos/300/200?random=12', relatedIssueId: 't_resolved_1' },
];

const MOCK_TODOS: TodoItem[] = [
  {
    id: 't1',
    title: 'A区消防器材巡检',
    priority: 'MEDIUM',
    dueDate: formatDate(today, '18:00'),
    type: 'PATROL',
    status: 'OPEN',
    description: '请对A区所有灭火器压力表进行检查，并拍照记录。',
    initiator: '系统自动生成',
    assignee: '当前用户',
    createdAt: formatDate(today, '08:00'),
    logs: [
      { id: 'l1', action: 'CREATE', operator: '系统', timestamp: formatDate(today, '08:00'), content: '自动触发每日巡检任务' }
    ]
  },
  {
    id: 't2',
    title: '复核 #A2 烟雾报警',
    priority: 'HIGH',
    dueDate: formatDate(today, '12:00'),
    type: 'ALARM_REVIEW',
    status: 'OPEN',
    relatedAlarmId: 'a2',
    description: '厨房区域检测到烟雾报警，请携带设备前往现场核实情况。',
    initiator: '指挥中心',
    assignee: '当前用户',
    createdAt: formatDate(today, '09:20'),
    logs: [
      { id: 'l2', action: 'CREATE', operator: '指挥中心', timestamp: formatDate(today, '09:15'), content: '报警触发，生成复核工单' },
      { id: 'l3', action: 'ASSIGN', operator: '王队长', timestamp: formatDate(today, '09:20'), content: '指派给当前用户处理' }
    ]
  },
  {
    id: 't3',
    title: '维修 #4 号摄像机连接问题',
    priority: 'MEDIUM',
    dueDate: formatDate(today, '17:00'),
    type: 'ISSUE',
    status: 'OPEN',
    description: '北侧围栏摄像头离线，请检查网络连接及供电情况。',
    initiator: '当前用户',
    assignee: '运维组',
    createdAt: formatDate(today, '10:00'),
    logs: [
      { id: 'l4', action: 'CREATE', operator: '当前用户', timestamp: formatDate(today, '10:00'), content: '发现设备离线，发起报修' }
    ]
  },
  {
    id: 't4',
    title: 'B区夜间定点巡逻',
    priority: 'LOW',
    dueDate: formatDate(today, '22:00'),
    type: 'PATROL',
    status: 'OPEN',
    description: '重点检查B区停车场角落是否有滞留人员。',
    initiator: '安保主管',
    assignee: '当前用户',
    createdAt: formatDate(today, '16:00'),
    logs: [{id: 'l_new1', action: 'CREATE', operator: '安保主管', timestamp: formatDate(today, '16:00'), content: '任务派发'}]
  },
  {
    id: 't5',
    title: '南门闸机故障报修',
    priority: 'HIGH',
    dueDate: formatDate(today, '14:30'),
    type: 'ISSUE',
    status: 'OPEN',
    description: '南门2号闸机无法识别车牌，请紧急维修。',
    initiator: '门岗值班员',
    assignee: '运维组',
    createdAt: formatDate(today, '11:15'),
    logs: [{id: 'l_new2', action: 'CREATE', operator: '门岗值班员', timestamp: formatDate(today, '11:15'), content: '报修申请'}]
  },
  // --- Fire Safety Hazards ---
  {
    id: 't_fire_1',
    title: '3号楼消防通道堵塞',
    priority: 'HIGH',
    dueDate: formatDate(today, '16:00'),
    type: 'FIRE_SAFETY',
    status: 'OPEN',
    description: '巡检发现3号楼东侧疏散通道堆放杂物，存在严重隐患，请立即清理。',
    initiator: '巡更员-张三',
    assignee: '物业部',
    createdAt: formatDate(today, '10:30'),
    logs: [{id: 'l_f1', action: 'CREATE', operator: '巡更员-张三', timestamp: formatDate(today, '10:30'), content: '巡检发现隐患上报'}]
  },
  {
    id: 't_fire_2',
    title: 'C区灭火器气压不足',
    priority: 'MEDIUM',
    dueDate: formatDate(today, '18:00'),
    type: 'FIRE_SAFETY',
    status: 'OPEN',
    description: 'C区仓库入口处2具干粉灭火器压力表显示黄色区域，需更换。',
    initiator: '系统巡检',
    assignee: '后勤组',
    createdAt: formatDate(today, '09:00'),
    logs: [{id: 'l_f2', action: 'CREATE', operator: '系统', timestamp: formatDate(today, '09:00'), content: '物联网设备自检异常'}]
  },
  {
    id: 't_done_1',
    title: '处理黑名单车辆告警',
    priority: 'HIGH',
    dueDate: formatDate(yesterday, '09:00'),
    type: 'ALARM_REVIEW',
    status: 'DONE',
    relatedAlarmId: 'a3',
    description: '赣E·88888 车辆进入，请拦截。',
    initiator: '系统',
    assignee: '当前用户',
    createdAt: formatDate(yesterday, '08:30'),
    logs: [
      { id: 'l5', action: 'CREATE', operator: '系统', timestamp: formatDate(yesterday, '08:30'), content: '报警自动派单' },
      { id: 'l6', action: 'CLOSE', operator: '当前用户', timestamp: formatDate(yesterday, '08:45'), content: '已拦截并登记信息' }
    ]
  }
];

// Raw Data Definitions with Dots
const RAW_VEHICLES = [
  {
    id: 'v1',
    plate: '赣E·A8888',
    color: '黑色',
    type: '轿车',
    timestamp: formatDate(today, '10:45:22'),
    location: 'A号门进口',
    isWatchlisted: true,
    ownerName: '张** (重点关注)',
    speed: 15,
    direction: '由北向南',
    lane: 1,
    confidence: 99.2
  },
  {
    id: 'v2',
    plate: '赣E·F29102',
    color: '白色',
    type: '混动SUV',
    timestamp: formatDate(today, '10:42:15'),
    location: 'B号门出口',
    isWatchlisted: false,
    ownerName: '李**',
    speed: 24,
    direction: '由南向北',
    lane: 2,
    confidence: 98.5
  },
  {
    id: 'v3',
    plate: '赣E·3X921',
    color: '银灰',
    type: 'MPV',
    timestamp: formatDate(today, '10:12:33'),
    location: '地下车库入口',
    isWatchlisted: false,
    ownerName: '王**',
    speed: 12,
    direction: '进入',
    lane: 1,
    confidence: 99.8
  },
  {
    id: 'v4',
    plate: '赣E·99120',
    color: '蓝色',
    type: '货车',
    timestamp: formatDate(today, '09:55:10'),
    location: 'C区货运通道',
    isWatchlisted: false,
    ownerName: '物流配送',
    speed: 10,
    direction: '驶出',
    lane: 3,
    confidence: 97.2
  },
  {
    id: 'v5',
    plate: '赣E·B2201',
    color: '红色',
    type: '轿车',
    timestamp: formatDate(today, '09:30:45'),
    location: 'A号门进口',
    isWatchlisted: false,
    ownerName: '刘**',
    speed: 18,
    direction: '由北向南',
    lane: 2,
    confidence: 99.1
  },
  {
    id: 'v6',
    plate: '赣E·D55123',
    color: '白色',
    type: '新能源',
    timestamp: formatDate(today, '08:15:20'),
    location: '东门访客通道',
    isWatchlisted: true,
    ownerName: '赵** (未登记)',
    speed: 5,
    direction: '进入',
    lane: 1,
    confidence: 96.5
  },
  {
    id: 'v7',
    plate: '赣E·8811A',
    color: '黑色',
    type: '轿车',
    timestamp: formatDate(today, '07:45:00'),
    location: '地下车库出口',
    isWatchlisted: false,
    ownerName: '陈**',
    speed: 20,
    direction: '驶出',
    lane: 1,
    confidence: 99.5
  },
  {
    id: 'v8',
    plate: '赣E·C0021',
    color: '银色',
    type: '面包车',
    timestamp: formatDate(yesterday, '18:30:22'),
    location: '后勤通道',
    isWatchlisted: false,
    ownerName: '食堂采购',
    speed: 15,
    direction: '驶入',
    lane: 1,
    confidence: 98.1
  },
  {
    id: 'v9',
    plate: '赣E·51920',
    color: '香槟金',
    type: '轿车',
    timestamp: formatDate(yesterday, '17:20:11'),
    location: 'A号门出口',
    isWatchlisted: false,
    ownerName: '吴**',
    speed: 25,
    direction: '驶出',
    lane: 2,
    confidence: 99.0
  },
  {
    id: 'v10',
    plate: '赣E·X1102',
    color: '白色',
    type: 'SUV',
    timestamp: formatDate(yesterday, '14:10:05'),
    location: 'B号门进口',
    isWatchlisted: false,
    ownerName: '郑**',
    speed: 22,
    direction: '驶入',
    lane: 1,
    confidence: 98.8
  },
  {
    id: 'v11',
    plate: '赣E·D92115',
    color: '绿色',
    type: '新能源',
    timestamp: formatDate(yesterday, '12:05:30'),
    location: '地下车库入口',
    isWatchlisted: false,
    ownerName: '周**',
    speed: 10,
    direction: '驶入',
    lane: 2,
    confidence: 99.3
  },
  {
    id: 'v12',
    plate: '赣E·P3021',
    color: '灰色',
    type: '轿车',
    timestamp: formatDate(yesterday, '09:45:18'),
    location: 'A号门进口',
    isWatchlisted: true,
    ownerName: '黄** (欠费预警)',
    speed: 16,
    direction: '驶入',
    lane: 1,
    confidence: 97.9
  }
];

// Generate images for the vehicles
const MOCK_VEHICLES: VehicleRecord[] = RAW_VEHICLES.map(v => ({
  ...v,
  imageUrl: generateVehicleCapture(v.plate, v.color, v.type, v.timestamp)
}));

interface AppState {
  isAuthenticated: boolean;
  user: { name: string; role: string } | null;
  cameras: Camera[];
  activeCamera: Camera | null;
  alarms: Alarm[];
  todos: TodoItem[];
  settings: AppSettings;
  vehicles: VehicleRecord[];
  toasts: Toast[];

  // Actions
  login: () => void;
  logout: () => void;
  setActiveCamera: (camera: Camera) => void;
  updateAlarmStatus: (id: string, status: AlarmStatus) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addAlarm: (alarm: Alarm) => void;
  toggleVehicleWatchlist: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  createIssueFromAlarm: (alarmId: string, form: { instruction: string, priority: 'HIGH' | 'MEDIUM' | 'LOW', type: 'PATROL' | 'ISSUE' | 'ALARM_REVIEW' | 'FIRE_SAFETY', assignee: string, dueDate: string }) => void;
  handleIssue: (issueId: string, action: 'COMPLETE' | 'COMMENT', content: string) => void;
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
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(MOCK_VEHICLES);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const login = () => {
    setIsAuthenticated(true);
    setUser({ name: '指挥中心管理员', role: 'ADMIN' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  // Simulate incoming alarms with variable timing
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const runSimulation = () => {
      // Create new alarm logic
      const isFire = Math.random() > 0.7;
      const newAlarm: Alarm = {
        id: `new-${Date.now()}`,
        type: isFire ? AlarmType.FIRE : AlarmType.INTRUSION,
        title: isFire ? '异常高温预警' : '周界入侵报警',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        cameraName: isFire ? 'C区货运通道' : '北侧围栏',
        status: AlarmStatus.PENDING,
        description: isFire ? '热成像监测到区域温度异常升高。' : '周界感应器触发，检测到异常震动。',
        snapshotUrl: `https://picsum.photos/300/200?random=${Date.now()}`
      };
      setAlarms(prev => [newAlarm, ...prev]);
      showToast('收到新的报警消息', 'error');

      // Schedule next run with random delay between 30s and 60s
      const nextDelay = Math.floor(Math.random() * 30000) + 30000;
      timeoutId = setTimeout(runSimulation, nextDelay);
    };

    // Start the first simulation after a random initial delay (30-60s)
    const initialDelay = Math.floor(Math.random() * 30000) + 30000;
    timeoutId = setTimeout(runSimulation, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  const updateAlarmStatus = (id: string, status: AlarmStatus) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const createIssueFromAlarm = (alarmId: string, form: { instruction: string, priority: 'HIGH' | 'MEDIUM' | 'LOW', type: 'PATROL' | 'ISSUE' | 'ALARM_REVIEW' | 'FIRE_SAFETY', assignee: string, dueDate: string }) => {
    const alarm = alarms.find(a => a.id === alarmId);
    if (!alarm) return;

    const newIssueId = `issue_${Date.now()}`;

    // 1. Create Issue
    const newIssue: TodoItem = {
      id: newIssueId,
      title: `处置: ${alarm.title}`,
      priority: form.priority,
      dueDate: form.dueDate || formatDate(new Date(), '23:59'),
      type: form.type,
      status: 'OPEN',
      description: form.instruction || alarm.description,
      initiator: user?.name || '当前用户',
      assignee: form.assignee,
      createdAt: getNowString(),
      relatedAlarmId: alarmId,
      logs: [
        {
          id: `log_${Date.now()}`,
          action: 'CREATE',
          operator: user?.name || '当前用户',
          timestamp: getNowString(),
          content: `发起报警处置工单。指派给: ${form.assignee}, 备注: ${form.instruction}`
        }
      ]
    };

    setTodos(prev => [newIssue, ...prev]);

    // 2. Update Alarm Status & Link
    setAlarms(prev => prev.map(a =>
        a.id === alarmId ? { ...a, status: AlarmStatus.PROCESSING, relatedIssueId: newIssueId } : a
    ));

    showToast('工单已生成，已添加至待办事项', 'success');
  };

  const handleIssue = (issueId: string, action: 'COMPLETE' | 'COMMENT', content: string) => {
    setTodos(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const newLog: IssueLog = {
        id: `log_${Date.now()}`,
        action: action === 'COMPLETE' ? 'CLOSE' : 'PROCESS',
        operator: user?.name || '当前用户',
        timestamp: getNowString(),
        content: content
      };

      const updatedIssue = {
        ...issue,
        status: action === 'COMPLETE' ? 'DONE' : issue.status,
        logs: [...issue.logs, newLog]
      } as TodoItem; // Cast to satisfy TS

      // If issue is completed and has a related alarm, resolve the alarm too
      if (action === 'COMPLETE' && issue.relatedAlarmId) {
        updateAlarmStatus(issue.relatedAlarmId, AlarmStatus.RESOLVED);
      }

      return updatedIssue;
    }));

    showToast(action === 'COMPLETE' ? '工单已办结' : '处理记录已提交', 'success');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addAlarm = (alarm: Alarm) => {
    setAlarms(prev => [alarm, ...prev]);
  };

  const toggleVehicleWatchlist = (id: string) => {
    setVehicles(prev => prev.map(v =>
        v.id === id ? { ...v, isWatchlisted: !v.isWatchlisted } : v
    ));
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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
        toasts,
        login,
        logout,
        setActiveCamera,
        updateAlarmStatus,
        updateSettings,
        addAlarm,
        toggleVehicleWatchlist,
        showToast,
        createIssueFromAlarm,
        handleIssue
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
