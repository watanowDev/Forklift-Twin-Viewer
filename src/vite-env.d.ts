/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FTE_WS_URL: string
  readonly VITE_FTE_API_URL: string
  readonly VITE_FTE_WS_SUBPROTOCOL: string
  readonly VITE_FTE_RECONNECT_INTERVAL: string
  readonly VITE_FTE_PING_INTERVAL: string
  readonly VITE_FTE_UPDATE_INTERVAL: string
  readonly VITE_DEBUG_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
