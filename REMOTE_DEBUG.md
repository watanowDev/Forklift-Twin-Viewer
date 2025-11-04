# 원격 Linux PC 개발 환경 설정 가이드

Windows PC에서 VS Code로 원격 Linux PC의 Forklift Twin Engine에 연결하여 개발하는 방법을 안내합니다.

## 📋 목차

1. [환경 구성 개요](#환경-구성-개요)
2. [SSH 터널링 설정](#ssh-터널링-설정)
3. [포트 포워딩 설정](#포트-포워딩-설정)
4. [VS Code 디버깅 설정](#vs-code-디버깅-설정)
5. [브레이크포인트 사용법](#브레이크포인트-사용법)
6. [문제 해결](#문제-해결)

## 환경 구성 개요

```
┌─────────────────┐         SSH Tunnel         ┌──────────────────┐
│  Windows PC     │◄─────────────────────────►│   Linux PC       │
│  (개발환경)      │                             │  (FTE 실행)       │
│                 │                             │                  │
│  VS Code        │  localhost:8080 ───────────►│  FTE:8080        │
│  Chrome Browser │  WebSocket 연결             │  WebSocket 서버   │
│  Debugger       │                             │  센서 데이터      │
└─────────────────┘                             └──────────────────┘
```

## SSH 터널링 설정

### 1. SSH 키 생성 (최초 1회)

Windows PowerShell에서 실행:

```powershell
# SSH 키 생성
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 공개 키를 Linux PC에 복사
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh user@linux-pc-ip "cat >> ~/.ssh/authorized_keys"
```

### 2. SSH 터널 생성

Linux PC의 8080 포트를 로컬 8080 포트로 포워딩:

```powershell
# 방법 1: 직접 SSH 터널 실행
ssh -L 8080:localhost:8080 user@linux-pc-ip -N

# 방법 2: 백그라운드 실행
Start-Process ssh -ArgumentList "-L 8080:localhost:8080 user@linux-pc-ip -N" -WindowStyle Hidden
```

**환경에 맞게 수정해야 할 부분:**
- `user`: Linux PC의 사용자명
- `linux-pc-ip`: Linux PC의 IP 주소 (예: `192.168.1.100`)

### 3. VS Code Task 자동화

`.vscode/tasks.json` 파일에 SSH 터널링 작업 추가:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "ssh-tunnel",
      "type": "shell",
      "command": "ssh",
      "args": [
        "-L",
        "8080:localhost:8080",
        "user@linux-pc-ip",
        "-N"
      ],
      "isBackground": true,
      "problemMatcher": [],
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new",
        "showReuseMessage": false,
        "clear": false
      }
    }
  ]
}
```

## 포트 포워딩 설정

### Linux PC에서 확인할 사항

1. **FTE가 올바른 포트에서 실행 중인지 확인:**

```bash
# 포트 8080이 리스닝 중인지 확인
sudo netstat -tlnp | grep 8080

# 또는
sudo ss -tlnp | grep 8080
```

2. **방화벽 설정 확인:**

```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 8080/tcp

# CentOS/RHEL
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload
```

### Windows PC에서 확인

1. **로컬 포트 8080이 사용 가능한지 확인:**

```powershell
# 포트 사용 현황 확인
netstat -ano | findstr :8080

# 다른 프로세스가 사용 중이면 종료 또는 다른 포트 사용
```

## VS Code 디버깅 설정

### 1. 환경 변수 설정

`.env` 파일 수정:

```bash
# 로컬호스트로 연결 (SSH 터널을 통해 원격 서버로 전달됨)
VITE_FTE_WS_URL=ws://localhost:8080/ws
VITE_FTE_API_URL=http://localhost:8080/api/v1

# 디버그 모드 활성화
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### 2. 디버거 실행

1. **VS Code에서 F5 누르기** 또는 실행 > 디버깅 시작
2. 디버거 구성 선택: `Chrome: 로컬 디버깅`
3. 브라우저가 자동으로 열리고 디버거가 연결됨

### 3. 개발 서버 먼저 실행하는 경우

터미널에서:

```powershell
# 개발 서버 시작
npm run dev

# 별도 터미널에서 SSH 터널 시작
ssh -L 8080:localhost:8080 user@linux-pc-ip -N
```

그 다음 VS Code에서 `Chrome: 실행 중인 브라우저에 연결` 선택

## 브레이크포인트 사용법

### 1. 브레이크포인트 설정

원하는 코드 라인의 **왼쪽 여백(라인 번호 왼쪽)**을 클릭하면 빨간 점이 생성됩니다.

**권장 브레이크포인트 위치:**

- `src/stores/connectionStore.ts`
  - `websocket.onmessage` (라인 72): 메시지 수신 시
  - `send` 메서드 (라인 95): 메시지 전송 시
  - `websocket.onopen` (라인 32): 연결 성공 시

### 2. 조건부 브레이크포인트

브레이크포인트를 우클릭 > "조건부 브레이크포인트 편집":

```javascript
// 특정 채널 메시지만 중단
data.header.channel === 'actions.event'

// 특정 값 이상일 때만 중단
event.score > 0.8
```

### 3. 디버거 제어

- **F5**: 계속 실행
- **F10**: 다음 줄로 이동 (Step Over)
- **F11**: 함수 안으로 들어가기 (Step Into)
- **Shift+F11**: 함수 밖으로 나가기 (Step Out)
- **Ctrl+Shift+F5**: 재시작

### 4. 변수 확인

**3가지 방법:**

1. **변수 패널**: 왼쪽 사이드바에서 현재 스코프의 모든 변수 확인
2. **마우스 호버**: 코드 위에 마우스를 올려 값 확인
3. **디버그 콘솔**: 하단 콘솔에서 직접 변수 입력하여 값 확인

```javascript
// 디버그 콘솔에서 실행 가능
event.data
JSON.parse(event.data)
connectionStore.getState()
```

### 5. 실시간 데이터 추적

**Watch 패널 사용:**

1. 디버거 실행 중 "조사식" 패널 열기
2. `+` 버튼 클릭
3. 추적할 표현식 입력:

```javascript
useConnectionStore.getState().isConnected
useDataStore.getState().actionEvents.length
useDebugStore.getState().logs.slice(-5)
```

## 브라우저 개발자 도구 통합 사용

### Chrome DevTools + VS Code 디버거

1. **네트워크 탭**: WebSocket 프레임 확인
   - F12 > Network 탭 > WS 필터
   - WebSocket 연결 클릭 > Messages 탭에서 실시간 메시지 확인

2. **Console 탭**: 커스텀 디버그 도구 사용
   ```javascript
   // 브라우저 콘솔에서 실행
   window.__FTV_DEBUG__.getLogs()
   window.__FTV_DEBUG__.exportLogs()
   window.__FTV_DEBUG__.setLogLevel(window.__FTV_DEBUG__.LogLevel.TRACE)
   ```

3. **동시 디버깅**:
   - VS Code에서 브레이크포인트로 코드 흐름 추적
   - Chrome DevTools로 WebSocket 메시지 페이로드 확인

## 문제 해결

### 1. 브레이크포인트가 작동하지 않을 때

**증상**: 브레이크포인트가 회색으로 표시되거나 무시됨

**해결 방법:**

```powershell
# 1. 개발 서버 재시작
# Ctrl+C로 종료 후
npm run dev

# 2. 브라우저 캐시 삭제
# Chrome: Ctrl+Shift+Delete

# 3. VS Code 디버거 재시작
# Ctrl+Shift+F5
```

**소스맵 확인:**
- `vite.config.ts`에서 `build.sourcemap: true` 확인
- 브라우저 DevTools > Sources 탭에서 `webpack://` 또는 소스 파일 보이는지 확인

### 2. WebSocket 연결 실패

**증상**: `WebSocket connection failed` 에러

**확인 사항:**

```powershell
# 1. SSH 터널이 살아있는지 확인
Get-Process | Where-Object {$_.ProcessName -eq "ssh"}

# 2. 로컬 포트 리스닝 확인
netstat -ano | findstr :8080

# 3. Linux PC에서 FTE 실행 여부 확인 (SSH로 접속)
ssh user@linux-pc-ip "systemctl status forklift-twin-engine"
# 또는
ssh user@linux-pc-ip "ps aux | grep fte"
```

**재연결:**

```powershell
# SSH 터널 재시작
Get-Process | Where-Object {$_.ProcessName -eq "ssh"} | Stop-Process
ssh -L 8080:localhost:8080 user@linux-pc-ip -N
```

### 3. 디버그 로그가 보이지 않을 때

**확인:**

1. `.env` 파일에서 `VITE_DEBUG_MODE=true` 설정
2. 브라우저 콘솔(F12)에서 로그 레벨 확인:
   ```javascript
   window.__FTV_DEBUG__.enable()
   window.__FTV_DEBUG__.setLogLevel(0) // TRACE
   ```

### 4. 원격 센서 데이터가 수신되지 않을 때

**Linux PC에서 확인:**

```bash
# FTE 로그 확인
journalctl -u forklift-twin-engine -f

# 또는 FTE 로그 파일 확인
tail -f /var/log/fte/fte.log

# WebSocket 연결 확인
sudo tcpdump -i any port 8080 -A
```

**Windows PC에서 확인:**

브라우저 콘솔에서:
```javascript
// 연결 상태 확인
useConnectionStore.getState().isConnected

// 수동으로 구독 시도
useConnectionStore.getState().subscribe('actions.event')

// 디버그 로그 확인
window.__FTV_DEBUG__.getLogs().filter(l => l.category === 'WebSocket')
```

## 추가 팁

### VS Code Remote SSH 사용 (대안)

원격 Linux PC에서 직접 개발하고 싶다면:

1. VS Code Extension 설치: `Remote - SSH`
2. `Ctrl+Shift+P` > "Remote-SSH: Connect to Host"
3. `user@linux-pc-ip` 입력
4. 원격 폴더 열기: FTE 소스 코드 경로

이 경우 SSH 터널링 불필요하며, 디버깅도 원격에서 직접 가능합니다.

### 자동 연결 스크립트

PowerShell 스크립트 생성 (`start-dev.ps1`):

```powershell
#!/usr/bin/env powershell

# SSH 터널 시작
Write-Host "SSH 터널 시작 중..." -ForegroundColor Green
Start-Process ssh -ArgumentList "-L 8080:localhost:8080 user@linux-pc-ip -N" -WindowStyle Hidden

# 잠시 대기
Start-Sleep -Seconds 2

# 개발 서버 시작
Write-Host "개발 서버 시작 중..." -ForegroundColor Green
npm run dev
```

사용법:
```powershell
.\start-dev.ps1
```

---

**도움이 필요하면:**
- FTE 문서 참조
- `DEVELOPMENT.md` 확인
- GitHub Issues에 질문 등록
