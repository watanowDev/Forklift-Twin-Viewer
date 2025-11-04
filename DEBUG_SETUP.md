# 🎯 디버깅 환경 구성 완료 요약

## ✅ 구성된 항목

### 1. VS Code 디버거 설정 (`.vscode/launch.json`)
- **Chrome 로컬 디버깅**: F5로 즉시 시작 가능
- **Chrome 원격 FTE 디버깅**: SSH 터널 통해 원격 연결
- **실행 중인 브라우저 연결**: 이미 실행 중인 브라우저에 디버거 부착
- **소스맵 완벽 지원**: 브레이크포인트 정확히 작동

### 2. 환경 변수 파일 (`.env`)
- 원격 Linux PC WebSocket 연결 설정
- 디버그 모드 활성화 (`VITE_DEBUG_MODE=true`)
- 상세 로그 레벨 설정 (`VITE_LOG_LEVEL=debug`)

### 3. VS Code 워크스페이스 설정 (`.vscode/settings.json`)
- JavaScript/TypeScript 디버깅 최적화
- 소스맵 자동 처리
- 브레이크포인트 고급 기능 활성화
- 디버그 콘솔 설정

### 4. 자동화 Task (`.vscode/tasks.json`)
- **npm: dev**: 개발 서버 자동 시작
- **ssh-tunnel**: SSH 터널링 자동 실행 (원격 개발 시)
- **개발 환경 시작**: 한 번에 모든 작업 실행

### 5. WebSocket 디버깅 유틸리티 (`src/stores/debugStore.ts`)
- 실시간 로그 추적
- WebSocket 메시지 송수신 로깅
- 브라우저 콘솔에서 `window.__FTV_DEBUG__` 사용 가능
- 로그 내보내기 기능

### 6. ConnectionStore 개선
- 모든 WebSocket 이벤트에 디버그 로깅 추가
- 재연결 로직 상세 추적
- 에러 핸들링 강화

### 7. 원격 개발 가이드 (`REMOTE_DEBUG.md`)
- SSH 터널링 상세 설정 방법
- 브레이크포인트 사용법
- 실시간 데이터 추적 방법
- 문제 해결 가이드

## 📝 사용 방법

### 로컬 개발 (FTE가 같은 PC에 있을 때)

1. `.env` 파일에서 연결 설정 확인
2. VS Code에서 **F5** 누르기
3. 브레이크포인트 설정하고 코드 실행

### 원격 개발 (Linux PC의 FTE 연결)

1. `.env` 파일 수정:
   ```bash
   VITE_FTE_WS_URL=ws://localhost:8080/ws
   ```

2. SSH 터널 시작 (PowerShell):
   ```powershell
   ssh -L 8080:localhost:8080 user@linux-pc-ip -N
   ```
   > **중요**: `user`와 `linux-pc-ip`를 실제 값으로 변경

3. VS Code에서 **F5** 누르기

4. 브레이크포인트 설정:
   - `connectionStore.ts` - 메시지 수신/송신 추적
   - `dataStore.ts` - 데이터 처리 과정 확인

## 🔍 브레이크포인트 권장 위치

### 📡 WebSocket 통신 추적

**파일**: `src/stores/connectionStore.ts`

```typescript
// 라인 32: 연결 성공 시
websocket.onopen = () => {
  // 여기에 브레이크포인트 ←

// 라인 72: 메시지 수신 시
websocket.onmessage = (event) => {
  // 여기에 브레이크포인트 ←

// 라인 95: 메시지 전송 시
send: (data: any) => {
  // 여기에 브레이크포인트 ←
```

### 📊 데이터 처리 추적

**파일**: `src/stores/dataStore.ts`

```typescript
// 액션 이벤트 추가 시
addActionEvent: (event: ActionEvent) => {
  // 여기에 브레이크포인트 ←
```

## 🛠️ 디버깅 도구 사용법

### VS Code 디버거

1. **변수 확인**: 왼쪽 "변수" 패널
2. **조사식**: 실시간으로 표현식 값 추적
   ```javascript
   useConnectionStore.getState().isConnected
   useDataStore.getState().actionEvents.length
   ```
3. **호출 스택**: 함수 호출 경로 확인

### 브라우저 콘솔 (F12)

```javascript
// 디버그 로그 확인
window.__FTV_DEBUG__.getLogs()

// WebSocket 로그만 필터링
window.__FTV_DEBUG__.getLogs().filter(l => l.category === 'WebSocket')

// 로그 내보내기 (파일로 저장)
console.log(window.__FTV_DEBUG__.exportLogs())

// 로그 레벨 변경
window.__FTV_DEBUG__.setLogLevel(0) // 0=TRACE, 1=DEBUG, 2=INFO, 3=WARN, 4=ERROR

// 디버그 모드 토글
window.__FTV_DEBUG__.enable()
window.__FTV_DEBUG__.disable()
```

### Chrome DevTools Network 탭

1. **F12** > **Network** 탭
2. **WS** 필터 클릭
3. WebSocket 연결 클릭
4. **Messages** 탭에서 실시간 메시지 확인

## 🎨 디버깅 팁

### 조건부 브레이크포인트

특정 조건에서만 중단:

```javascript
// 특정 채널 메시지만
data.header.channel === 'actions.event'

// 특정 점수 이상
event.score > 0.8

// 에러 발생 시만
event.severity === 'ERROR'
```

### 단계별 실행

- **F10**: 다음 줄 (함수 안 들어가지 않음)
- **F11**: 함수 안으로 들어가기
- **Shift+F11**: 함수 밖으로 나오기
- **F5**: 다음 브레이크포인트까지 계속 실행

### 변수 값 변경

디버그 콘솔에서 실행 중 변수 값 변경 가능:

```javascript
// 연결 상태 강제 변경
useConnectionStore.setState({ isConnected: true })

// 테스트 데이터 추가
useDataStore.getState().addActionEvent({
  action_name: 'test',
  source_module: 'debug',
  stamp: { sec: Date.now(), nanosec: 0 },
  seq: 1,
  score: 0.9,
  severity: 'INFO'
})
```

## 📚 참고 문서

- **원격 개발 상세 가이드**: `REMOTE_DEBUG.md`
- **프로젝트 구조**: `DEVELOPMENT.md`
- **GitHub Copilot 정책**: `.github/copilot-instructions.md`

## ⚠️ 다음 단계

1. **`.env` 파일 수정**: 실제 원격 서버 IP 입력
2. **SSH 키 설정**: 비밀번호 없이 연결 가능하도록 설정
3. **테스트**: F5 눌러 디버거 작동 확인
4. **브레이크포인트 설정**: 원하는 위치에 중단점 추가
5. **실시간 데이터 확인**: WebSocket 메시지 추적

---

**문제 발생 시**: `REMOTE_DEBUG.md`의 "문제 해결" 섹션 참조
