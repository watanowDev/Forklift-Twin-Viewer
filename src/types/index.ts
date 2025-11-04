// FTE WebSocket Envelope 메시지 타입
export enum MessageType {
  PUBLISH = 'PUBLISH',
  SUB = 'SUB',
  UNSUB = 'UNSUB',
  COMMAND = 'COMMAND',
  ACK = 'ACK',
  ERROR = 'ERROR',
}

export enum ContentType {
  PROTO = 'proto',
  MSGPACK = 'msgpack',
  JSON = 'json',
}

export interface MessageHeader {
  msg_type: MessageType
  channel: string
  seq: number
  timestamp: number
  monotonic?: number
  content_type: ContentType
  idempotency_key?: string
}

export interface Envelope {
  header: MessageHeader
  payload: any
}

// 채널 타입
export type Channel =
  | 'actions.event'
  | 'health.overall'
  | 'health.sensors'
  | 'logs.metric'
  | 'control.indicator'

// ActionEvent 메시지
export interface ActionEvent {
  action_name: string
  source_module: string
  stamp: {
    sec: number
    nanosec: number
  }
  seq: number
  score: number
  severity: 'INFO' | 'WARN' | 'ERROR'
  payload_json?: string
}

// Health 메시지
export interface HealthStatus {
  module_name: string
  state: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  cpu_usage?: number
  memory_usage?: number
  uptime?: number
  last_heartbeat: number
  diagnostics?: Record<string, any>
}

// 연결 상태
export interface ConnectionState {
  isConnected: boolean
  lastConnected?: number
  reconnectAttempts: number
  error?: string
}

// 뷰어 설정
export interface ViewerConfig {
  wsUrl: string
  apiUrl: string
  subprotocol: string
  reconnectInterval: number
  pingInterval: number
  updateInterval: number
}
