import { useConnectionStore } from '../../stores/connectionStore'
import './ConnectionStatus.css'

export default function ConnectionStatus() {
  const { isConnected, reconnectAttempts, error } = useConnectionStore()

  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="status-indicator"></div>
      <div className="status-info">
        {isConnected ? (
          <span>연결됨</span>
        ) : (
          <span>
            연결 끊김 {reconnectAttempts > 0 && `(재시도 ${reconnectAttempts})`}
          </span>
        )}
        {error && <span className="error-text"> - {error}</span>}
      </div>
    </div>
  )
}
