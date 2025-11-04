import { create } from 'zustand'
import type { ConnectionState } from '../types'

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
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Already connected')
      return
    }

    try {
      const websocket = new WebSocket(url, ['fte.v1'])

      websocket.onopen = () => {
        console.log('WebSocket connected')
        set({
          isConnected: true,
          lastConnected: Date.now(),
          reconnectAttempts: 0,
          error: undefined,
          ws: websocket,
        })
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        set((state) => ({
          isConnected: false,
          reconnectAttempts: state.reconnectAttempts + 1,
          ws: null,
        }))

        // Auto reconnect
        setTimeout(() => {
          const { reconnectAttempts } = get()
          if (reconnectAttempts < 10) {
            get().connect(url)
          }
        }, 3000)
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        set({ error: 'Connection error' })
      }

      websocket.onmessage = (event) => {
        // Handle incoming messages
        console.log('Message received:', event.data)
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      set({ error: 'Failed to create WebSocket connection' })
    }
  },

  disconnect: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null, isConnected: false })
    }
  },

  send: (data: any) => {
    const { ws, isConnected } = get()
    if (ws && isConnected) {
      ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
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
