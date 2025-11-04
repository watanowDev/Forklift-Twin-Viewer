import { create } from 'zustand'

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
}

export interface LogEntry {
  timestamp: number
  level: LogLevel
  category: string
  message: string
  data?: any
}

interface DebugStore {
  logs: LogEntry[]
  logLevel: LogLevel
  isEnabled: boolean
  maxLogs: number
  
  // 로그 메서드
  trace: (category: string, message: string, data?: any) => void
  debug: (category: string, message: string, data?: any) => void
  info: (category: string, message: string, data?: any) => void
  warn: (category: string, message: string, data?: any) => void
  error: (category: string, message: string, data?: any) => void
  
  // WebSocket 전용 로깅
  logWSConnect: (url: string) => void
  logWSDisconnect: (reason?: string) => void
  logWSMessage: (direction: 'sent' | 'received', data: any) => void
  logWSError: (error: any) => void
  
  // 유틸리티
  clearLogs: () => void
  setLogLevel: (level: LogLevel) => void
  setEnabled: (enabled: boolean) => void
  exportLogs: () => string
}

const shouldLog = (currentLevel: LogLevel, messageLevel: LogLevel): boolean => {
  return messageLevel >= currentLevel
}

export const useDebugStore = create<DebugStore>((set, get) => ({
  logs: [],
  logLevel: import.meta.env.VITE_DEBUG_MODE === 'true' ? LogLevel.DEBUG : LogLevel.INFO,
  isEnabled: import.meta.env.VITE_DEBUG_MODE === 'true',
  maxLogs: 1000,

  trace: (category: string, message: string, data?: any) => {
    const { isEnabled, logLevel, logs, maxLogs } = get()
    if (!isEnabled || !shouldLog(logLevel, LogLevel.TRACE)) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.TRACE,
      category,
      message,
      data,
    }

    console.log(`[TRACE][${category}]`, message, data || '')
    
    set({
      logs: [...logs.slice(-maxLogs + 1), entry],
    })
  },

  debug: (category: string, message: string, data?: any) => {
    const { isEnabled, logLevel, logs, maxLogs } = get()
    if (!isEnabled || !shouldLog(logLevel, LogLevel.DEBUG)) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.DEBUG,
      category,
      message,
      data,
    }

    console.log(`[DEBUG][${category}]`, message, data || '')
    
    set({
      logs: [...logs.slice(-maxLogs + 1), entry],
    })
  },

  info: (category: string, message: string, data?: any) => {
    const { isEnabled, logLevel, logs, maxLogs } = get()
    if (!isEnabled || !shouldLog(logLevel, LogLevel.INFO)) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.INFO,
      category,
      message,
      data,
    }

    console.info(`[INFO][${category}]`, message, data || '')
    
    set({
      logs: [...logs.slice(-maxLogs + 1), entry],
    })
  },

  warn: (category: string, message: string, data?: any) => {
    const { isEnabled, logLevel, logs, maxLogs } = get()
    if (!isEnabled || !shouldLog(logLevel, LogLevel.WARN)) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.WARN,
      category,
      message,
      data,
    }

    console.warn(`[WARN][${category}]`, message, data || '')
    
    set({
      logs: [...logs.slice(-maxLogs + 1), entry],
    })
  },

  error: (category: string, message: string, data?: any) => {
    const { isEnabled, logLevel, logs, maxLogs } = get()
    if (!isEnabled || !shouldLog(logLevel, LogLevel.ERROR)) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      category,
      message,
      data,
    }

    console.error(`[ERROR][${category}]`, message, data || '')
    
    set({
      logs: [...logs.slice(-maxLogs + 1), entry],
    })
  },

  // WebSocket 전용 로깅
  logWSConnect: (url: string) => {
    get().info('WebSocket', `연결 시도: ${url}`)
  },

  logWSDisconnect: (reason?: string) => {
    get().info('WebSocket', `연결 해제${reason ? `: ${reason}` : ''}`)
  },

  logWSMessage: (direction: 'sent' | 'received', data: any) => {
    const { debug } = get()
    const prefix = direction === 'sent' ? '▶ 송신' : '◀ 수신'
    
    // 데이터 크기 계산
    const size = JSON.stringify(data).length
    
    debug('WebSocket', `${prefix} (${size} bytes)`, {
      direction,
      data,
      timestamp: Date.now(),
    })
  },

  logWSError: (error: any) => {
    get().error('WebSocket', 'WebSocket 오류 발생', error)
  },

  clearLogs: () => {
    set({ logs: [] })
    console.clear()
  },

  setLogLevel: (level: LogLevel) => {
    set({ logLevel: level })
    console.log(`로그 레벨 변경: ${LogLevel[level]}`)
  },

  setEnabled: (enabled: boolean) => {
    set({ isEnabled: enabled })
    console.log(`디버그 모드: ${enabled ? 'ON' : 'OFF'}`)
  },

  exportLogs: () => {
    const { logs } = get()
    return JSON.stringify(
      logs.map((log) => ({
        time: new Date(log.timestamp).toISOString(),
        level: LogLevel[log.level],
        category: log.category,
        message: log.message,
        data: log.data,
      })),
      null,
      2
    )
  },
}))

// 전역에서 사용 가능한 디버그 유틸리티
if (typeof window !== 'undefined') {
  ;(window as any).__FTV_DEBUG__ = {
    getLogs: () => useDebugStore.getState().logs,
    clearLogs: () => useDebugStore.getState().clearLogs(),
    exportLogs: () => useDebugStore.getState().exportLogs(),
    setLogLevel: (level: LogLevel) => useDebugStore.getState().setLogLevel(level),
    enable: () => useDebugStore.getState().setEnabled(true),
    disable: () => useDebugStore.getState().setEnabled(false),
    LogLevel,
  }
  
  console.log('%c[FTV] 디버그 도구 로드됨', 'color: #00ff00; font-weight: bold')
  console.log('%c사용법: window.__FTV_DEBUG__', 'color: #00ffff')
}
