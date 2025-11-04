import { useEffect, useState } from 'react'
import { useConnectionStore } from '../../stores/connectionStore'
import { useDataStore } from '../../stores/dataStore'
import './Dashboard.css'

export default function Dashboard() {
  const { subscribe } = useConnectionStore()
  const { actionEvents } = useDataStore()
  const [stats, setStats] = useState({
    totalEvents: 0,
    infoCount: 0,
    warnCount: 0,
    errorCount: 0,
  })

  useEffect(() => {
    // Subscribe to channels
    subscribe('actions.event')
    subscribe('health.overall')
    subscribe('logs.metric')
  }, [subscribe])

  useEffect(() => {
    // Update stats
    setStats({
      totalEvents: actionEvents.length,
      infoCount: actionEvents.filter((e) => e.severity === 'INFO').length,
      warnCount: actionEvents.filter((e) => e.severity === 'WARN').length,
      errorCount: actionEvents.filter((e) => e.severity === 'ERROR').length,
    })
  }, [actionEvents])

  return (
    <div className="dashboard">
      <h2>대시보드</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>총 이벤트</h3>
          <div className="stat-value">{stats.totalEvents}</div>
        </div>

        <div className="dashboard-card">
          <h3>정보</h3>
          <div className="stat-value info">{stats.infoCount}</div>
        </div>

        <div className="dashboard-card">
          <h3>경고</h3>
          <div className="stat-value warn">{stats.warnCount}</div>
        </div>

        <div className="dashboard-card">
          <h3>오류</h3>
          <div className="stat-value error">{stats.errorCount}</div>
        </div>
      </div>

      <div className="recent-events">
        <h3>최근 이벤트</h3>
        <div className="events-list">
          {actionEvents.length === 0 ? (
            <p className="no-events">이벤트가 없습니다</p>
          ) : (
            actionEvents.slice(-10).reverse().map((event, index) => (
              <div key={index} className={`event-item ${event.severity.toLowerCase()}`}>
                <span className="event-severity">{event.severity}</span>
                <span className="event-name">{event.action_name}</span>
                <span className="event-source">{event.source_module}</span>
                <span className="event-score">Score: {event.score.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
