import { create } from 'zustand'
import type { ConnectionState } from '../types'
import { useDebugStore } from './debugStore'

interface ConnectionStore extends ConnectionState {
  wsUrl: string
  ws: WebSocket | null
  connect: (url: string) => void
  disconnect: () => void
  send: (data: any) => void
  subscribe: (channel: string) => void
  unsubscribe: (channel: string) => void
}

const DEFAULT_WS_URL = import.meta.env.VITE_FTE_WS_URL || 'ws://localhost:8080/ws'

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  isConnected: false,
  reconnectAttempts: 0,
  wsUrl: DEFAULT_WS_URL,
  ws: null,

  connect: (url: string) => {
    const { ws } = get()
    const debug = useDebugStore.getState()
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      debug.info('Connection', '이미 연결되어 있습니다')
      return
    }

    try {
      debug.logWSConnect(url)
      const websocket = new WebSocket(url, ['fte.v1'])

      websocket.onopen = () => {
        debug.info('Connection', 'WebSocket 연결 성공', { url })
        set({
          isConnected: true,
          lastConnected: Date.now(),
          reconnectAttempts: 0,
          error: undefined,
          ws: websocket,
        })
      }

      websocket.onclose = () => {
        debug.logWSDisconnect('서버 연결 종료')
        set((state) => ({
          isConnected: false,
          reconnectAttempts: state.reconnectAttempts + 1,
          ws: null,
        }))

        // Auto reconnect
        setTimeout(() => {
          const { reconnectAttempts } = get()
          if (reconnectAttempts < 10) {
            debug.info('Connection', `재연결 시도 (${reconnectAttempts + 1}/10)`)
            get().connect(url)
          } else {
            debug.error('Connection', '최대 재연결 시도 횟수 초과')
          }
        }, 3000)
      }

      websocket.onerror = (error) => {
        debug.logWSError(error)
        set({ error: 'Connection error' })
      }

      websocket.onmessage = (event) => {
        // 수신 메시지 로깅
        try {
          const data = JSON.parse(event.data)
          debug.logWSMessage('received', data)
        } catch {
          debug.debug('WebSocket', '바이너리 메시지 수신', { 
            size: event.data.length 
          })
        }
      }
    } catch (error) {
      debug.error('Connection', 'WebSocket 생성 실패', error)
      set({ error: 'Failed to create WebSocket connection' })
    }
  },

  disconnect: () => {
    const { ws } = get()
    const debug = useDebugStore.getState()
    
    if (ws) {
      debug.info('Connection', '연결 해제 요청')
      ws.close()
      set({ ws: null, isConnected: false })
    }
  },

  send: (data: any) => {
    const { ws, isConnected } = get()
    const debug = useDebugStore.getState()
    
    if (ws && isConnected) {
      const payload = JSON.stringify(data)
      debug.logWSMessage('sent', data)
      ws.send(payload)
    } else {
      debug.error('Connection', 'WebSocket이 연결되어 있지 않습니다')
    }
  },

  subscribe: (channel: string) => {
    const { send } = get()
    send({
      header: {
        msg_type: 'SUB',
        channel,
        seq: Date.now(),
        timestamp: Date.now(),
        content_type: 'json',
      },
      payload: {},
    })
  },

  unsubscribe: (channel: string) => {
    const { send } = get()
    send({
      header: {
        msg_type: 'UNSUB',
        channel,
        seq: Date.now(),
        timestamp: Date.now(),
        content_type: 'json',
      },
      payload: {},
    })
  },
}))
