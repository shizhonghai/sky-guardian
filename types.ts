export enum CameraStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ALARM = 'ALARM'
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: CameraStatus;
  thumbnail: string;
  type: 'DOME' | 'BULLET' | 'PTZ';
  coordinates: { x: number; y: number }; // Percentage on map
}

export enum AlarmType {
  INTRUSION = 'INTRUSION',
  FIRE = 'FIRE',
  VEHICLE = 'VEHICLE',
  SYSTEM = 'SYSTEM'
}

export enum AlarmStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  RESOLVED = 'RESOLVED'
}

export interface Alarm {
  id: string;
  type: AlarmType;
  title: string;
  timestamp: string;
  cameraName: string;
  status: AlarmStatus;
  description: string;
  snapshotUrl: string;
}

export interface VehicleRecord {
  id: string;
  plate: string;
  color: string;
  type: string;
  timestamp: string;
  location: string;
  imageUrl: string;
  isWatchlisted: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  type: 'PATROL' | 'ISSUE' | 'ALARM_REVIEW';
  status: 'OPEN' | 'DONE';
}

export interface AppSettings {
  snapshotMode: 'SINGLE' | 'BURST';
  ptzSpeed: number; // 1-10
  videoSourceType: 'HD' | 'SD' | 'AUTO';
  sourceProtocol: 'GB28181' | 'ONVIF' | 'RTSP'; // 新增来源类型
}