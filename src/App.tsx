import { useState, useEffect } from 'react'
import './App.css'
import { useConnectionStore } from './stores/connectionStore'
import Dashboard from './components/Dashboard/Dashboard'
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus'

function App() {
  const { isConnected, connect, disconnect, wsUrl } = useConnectionStore()
  const [autoConnect, setAutoConnect] = useState(true)

  useEffect(() => {
    if (autoConnect && !isConnected) {
      connect(wsUrl)
    }
  }, [autoConnect, isConnected, connect, wsUrl])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Forklift Twin Viewer</h1>
        <ConnectionStatus />
      </header>
      
      <main className="app-main">
        {isConnected ? (
          <Dashboard />
        ) : (
          <div className="connection-placeholder">
            <h2>FTE에 연결 중...</h2>
            <p>WebSocket 연결을 기다리고 있습니다.</p>
            <button onClick={() => connect(wsUrl)}>
              수동 연결
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Forklift Twin Viewer v0.1.0 | © 2025 watanowDev</p>
      </footer>
    </div>
  )
}

export default App
