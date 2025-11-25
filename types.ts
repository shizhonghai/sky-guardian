
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
  coordinates: { x: number; y: number }; // Percentage on legacy map
  latLng: [number, number]; // [Longitude, Latitude] for AMap
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
  relatedIssueId?: string; // Link to a work order
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
  ownerName?: string;
  speed?: number; // km/h
  direction?: string; // e.g., "由东向西"
  lane?: number;
  confidence?: number; // 0-100
}

export interface IssueLog {
  id: string;
  action: 'CREATE' | 'ASSIGN' | 'PROCESS' | 'CLOSE';
  operator: string;
  timestamp: string;
  content: string;
}

export interface TodoItem {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string; // YYYY-MM-DD HH:mm
  type: 'PATROL' | 'ISSUE' | 'ALARM_REVIEW' | 'FIRE_SAFETY';
  status: 'OPEN' | 'DONE';
  description?: string;
  
  // Workflow fields
  initiator: string; // Who created this
  assignee: string; // Who is handling this (Current User usually)
  relatedAlarmId?: string; // Optional link to alarm
  createdAt: string;
  logs: IssueLog[]; // History of the issue
}

export interface AppSettings {
  snapshotMode: 'SINGLE' | 'BURST';
  ptzSpeed: number; // 1-10
  videoSourceType: 'HD' | 'SD' | 'AUTO';
  sourceProtocol: 'GB28181' | 'ONVIF' | 'RTSP';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}