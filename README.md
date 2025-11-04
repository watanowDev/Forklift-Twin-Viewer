# Forklift Twin Viewer (FTV)

**Forklift Twin Viewer**는 Forklift Twin Engine(FTE)의 실시간 데이터를 시각화하고 모니터링하는 엔지니어/운영자용 경량 웹 기반 뷰어입니다.

## 📋 프로젝트 개요

Forklift Twin Viewer는 지게차 엣지 시스템에서 수집된 센서 데이터, 액션 이벤트, 헬스 상태 등을 실시간으로 표시하고 관리할 수 있는 대시보드를 제공합니다.

### 주요 기능

#### 📊 실시간 데이터 시각화
- **대시보드**: 핵심 KPI, 오류율, 지연, 최근 액션 이벤트 모니터링
- **센서 모니터링**: 전처리된 센서 데이터 요약 및 실시간 차트
- **액션 이벤트 타임라인**: 필터링, 재생/정지 기능이 있는 이벤트 뷰어
- **헬스 & 진단**: 모듈 상태, 라이프사이클, 진단 정보 표시
- **로그 스트림**: 실시간 로그 검색, 필터링, 다운로드

#### ⚙️ 센서 세팅 및 제어
- **센서 파라미터 조정**: 웹 UI를 통한 센서 설정 변경
- **임계값 설정**: 액션 이벤트 트리거 조건 설정
- **캘리브레이션 제어**: 센서 보정 명령 실행
- **설정 이력 추적**: 변경 내역 및 롤백 기능
- **실시간 피드백**: 설정 변경 즉시 반영 확인

## 🏗️ 아키텍처

### 시스템 구성도

```
┌───────────────────────────────────────────────────────────┐
│           FTE (Forklift Twin Engine)                      │
│           엔진 / 게이트웨이                                 │
│                                                           │
│  - ROS2 센서 데이터 수집                                    │
│  - 데이터 전처리 및 필터링                                   │
│  - WebSocket 서버 운영                                     │
└─┬─────────────────────────────────────────────────────┬───┘
  │                                                     │
  │ wss:// (PUBLISH)                      wss:// (COMMAND)
  │ 실시간 데이터 스트림                         설정/제어 명령
  │ - actions.event                          - 센서 설정 변경
  │ - health.overall                         - 파라미터 조정
  │ - logs.metric                            - 캘리브레이션
  ↓                                                     ↑
┌───────────────────────────────────────────────────────────┐
│           FTV (Forklift Twin Viewer)                      │
│           뷰어 및 지게차 센서 세팅 도구                       │
│                                                           │
│  [실시간 데이터 시각화]                                      │
│  - 대시보드 (KPI, 상태 모니터링)                             │
│  - 센서 데이터 차트 (실시간 그래프)                           │
│  - 액션 이벤트 타임라인                                      │
│  - 헬스 & 진단 정보                                         │
│                                                           │
│  [센서 세팅 기능]                                           │
│  - 센서 파라미터 조정 UI                                     │
│  - 임계값 설정                                              │
│  - 캘리브레이션 제어                                         │
│  - 설정 변경 이력 추적                                       │
└───────────────────────────────────────────────────────────┘
       │
       │ 사용자 (엔지니어/운영자)
       └─ 웹 브라우저 (Chrome, Firefox)
```

### 아키텍처 설명

이 프로젝트는 **클라이언트-서버 양방향 통신 구조**를 가집니다:

1. **FTE (Forklift Twin Engine)**:
   - Linux PC에서 실행되는 백엔드 엔진/게이트웨이
   - ROS2 기반으로 지게차의 센서 데이터를 수집하고 전처리
   - WebSocket 서버를 운영하여 FTV와 통신

2. **통신 프로토콜**:
   - **PUBLISH (FTE → FTV)**: FTE가 FTV로 실시간 데이터를 일방향으로 푸시. 센서 데이터, 액션 이벤트, 헬스 상태 등을 250ms 주기로 전송
   - **COMMAND (FTV → FTE)**: FTV가 FTE로 제어 명령을 전송. 센서 파라미터 변경, 임계값 설정, 캘리브레이션 실행 등의 양방향 요청-응답 통신

3. **FTV (Forklift Twin Viewer)**:
   - Windows PC의 웹 브라우저에서 실행되는 React 기반 프론트엔드
   - 두 가지 주요 역할을 수행:
     - **실시간 데이터 시각화**: WebSocket으로 수신한 데이터를 대시보드, 차트, 타임라인으로 표시
     - **센서 세팅 도구**: 엔지니어가 웹 UI를 통해 지게차 센서를 원격으로 설정/조정

### 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite
- **상태 관리**: Zustand
- **차트**: Chart.js (경량 캔버스 기반)
- **통신**: WebSocket (바이너리 - Protobuf/MessagePack)
- **스타일링**: CSS Modules / Tailwind CSS (선택)

### 통신 프로토콜

FTV는 FTE와 WebSocket 바이너리 통신을 사용합니다:

```
wss://<host>:<port>/ws (subprotocol: fte.v1)
```

#### 메시지 타입

- `PUBLISH`: 실시간 데이터 스트림 (250ms 주기)
- `SUB/UNSUB`: 채널 구독 관리
- `COMMAND`: 제어 명령 (권한 필요)
- `ACK/ERROR`: 응답 및 오류

#### 주요 채널

- `actions.event`: 액션 이벤트 스트림
- `health.overall`: 전체 헬스 상태
- `logs.metric`: 메트릭 및 로그
- `control.indicator`: 제어 명령 (선택)

## 🚀 시작하기

### 필요 사항

- Node.js 18+
- npm 또는 yarn
- 실행 중인 Forklift Twin Engine (FTE)

### 설치

```bash
# 저장소 클론
git clone https://github.com/watanowDev/Forklift-Twin-Viewer.git
cd Forklift-Twin-Viewer

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 디렉토리에 생성됩니다.

### 프로덕션 실행

```bash
npm run preview
```

## ⚙️ 설정

### 환경 변수

`.env` 파일을 생성하여 FTE 연결 정보를 설정합니다:

```env
VITE_FTE_WS_URL=ws://localhost:8080/ws
VITE_FTE_API_URL=http://localhost:8080/api/v1
```

### 연결 프로파일

애플리케이션 내에서 다양한 환경(개발/스테이징/프로덕션)에 대한 연결 프로파일을 저장하고 관리할 수 있습니다.

## 📁 프로젝트 구조

```
Forklift-Twin-Viewer/
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── Dashboard/     # 대시보드 컴포넌트
│   │   ├── Sensors/       # 센서 모니터링
│   │   ├── Actions/       # 액션 이벤트 뷰어
│   │   ├── Health/        # 헬스 & 진단
│   │   ├── Logs/          # 로그 스트림
│   │   └── Config/        # 설정 관리
│   ├── services/          # WebSocket, API 클라이언트
│   ├── stores/            # Zustand 스토어
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   ├── App.tsx            # 메인 앱 컴포넌트
│   └── main.tsx           # 엔트리 포인트
├── public/                # 정적 파일
├── index.html             # HTML 템플릿
├── vite.config.ts         # Vite 설정
├── tsconfig.json          # TypeScript 설정
└── package.json           # 프로젝트 의존성
```

## 🔒 보안

- **인증**: JWT 기반 인증 (Bearer 토큰)
- **권한**: 역할 기반 접근 제어 (RBAC)
  - `viewer`: 읽기 전용
  - `operator`: 제어 명령 실행 가능
- **암호화**: wss:// (TLS), mTLS 옵션 지원

## 🎯 성능 최적화

- **렌더링**: requestAnimationFrame 배치, 가상화된 리스트/테이블
- **차트**: downsample을 통한 데이터 포인트 최적화
- **데이터**: Web Worker를 통한 바이너리 디코딩
- **네트워크**: 백프레셔 감지 시 렌더링 주기 조정
- **메모리**: 고정 크기 링버퍼, 메모리 릭 방지

### 성능 목표

- Time to Interactive (TTI): < 2초
- 평균 프레임 지연: < 16ms (60 FPS)
- CPU 사용률: < 5% (유휴 시)
- 메모리 사용: < 200MB

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트 (Playwright)
npm run test:e2e

# 커버리지
npm run test:coverage
```

## 📦 배포

### 정적 파일 서빙 (nginx 예시)

```nginx
server {
    listen 80;
    server_name ftv.example.com;

    root /var/www/forklift-twin-viewer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker 배포

```bash
docker build -t forklift-twin-viewer .
docker run -p 80:80 forklift-twin-viewer
```

## 📚 추가 문서

- **개발 가이드**: [`DEVELOPMENT.md`](./DEVELOPMENT.md) - 프로젝트 구조 및 기술 스택 상세
- **원격 디버깅**: [`REMOTE_DEBUG.md`](./REMOTE_DEBUG.md) - Windows-Linux 원격 개발 환경 설정
- **디버깅 설정**: [`DEBUG_SETUP.md`](./DEBUG_SETUP.md) - VS Code 디버거 사용법
- **정책 문서**: [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) - 코딩 스타일 및 컨벤션

