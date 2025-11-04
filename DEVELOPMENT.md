# Forklift Twin Viewer

실시간 지게차 디지털 트윈 데이터 모니터링 뷰어

## 시스템 아키텍처

```
┌───────────────────────────────────────────────────────────┐
│           FTE (Forklift Twin Engine)                      │
│           엔진 / 게이트웨이                                   │
│                                                           │
│  - ROS2 센서 데이터 수집                                     │
│  - 데이터 전처리 및 필터링                                     │
│  - WebSocket 서버 운영                                      │
└─┬─────────────────────────────────────────────────────┬─┘
  │                                                     │
  │ wss:// (PUBLISH)                      wss:// (COMMAND)
  │ 실시간 데이터 스트림                         설정/제어 명령
  │ - actions.event                          - 센서 설정 변경
  │ - health.overall                         - 파라미터 조정
  │ - logs.metric                            - 캘리브레이션
  ↓                                                     ↑
┌───────────────────────────────────────────────────────────┐
│           FTV (Forklift Twin Viewer)                      │
│           뷰어 및 지게차 센서 세팅 도구                         │
│                                                           │
│  [실시간 데이터 시각화]                                       │
│  - 대시보드 (KPI, 상태 모니터링)                              │
│  - 센서 데이터 차트 (실시간 그래프)                            │
│  - 액션 이벤트 타임라인                                       │
│  - 헬스 & 진단 정보                                          │
│                                                           │
│  [센서 세팅 기능]                                            │
│  - 센서 파라미터 조정 UI                                     │
│  - 임계값 설정                                              │
│  - 캘리브레이션 제어                                         │
│  - 설정 변경 이력 추적                                       │
└───────────────────────────────────────────────────────────┘
       │
       │ 사용자 (엔지니어/운영자)
       └─ 웹 브라우저 (Chrome, Firefox)
```

### 통신 프로토콜

#### PUBLISH (FTE → FTV)
- **프로토콜**: WebSocket (wss://)
- **데이터 형식**: Protobuf / MessagePack / JSON
- **주기**: 250ms (실시간)
- **채널**:
  - `actions.event`: 액션 이벤트 스트림
  - `health.overall`: 시스템 헬스 상태
  - `health.sensors`: 센서별 상태
  - `logs.metric`: 메트릭 및 로그

#### COMMAND (FTV → FTE)
- **프로토콜**: WebSocket (wss://)
- **데이터 형식**: JSON
- **용도**:
  - 센서 설정 변경
  - 파라미터 조정
  - 캘리브레이션 실행
  - 제어 명령 전송

## 프로젝트 구조

```
Forklift-Twin-Viewer/
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── Dashboard/        # 메인 대시보드
│   │   └── ConnectionStatus/ # WebSocket 연결 상태
│   ├── stores/               # Zustand 상태 관리
│   │   ├── connectionStore.ts
│   │   └── dataStore.ts
│   ├── types/                # TypeScript 타입 정의
│   ├── App.tsx               # 메인 애플리케이션
│   ├── main.tsx              # 엔트리 포인트
│   └── vite-env.d.ts         # Vite 환경 타입
├── public/                   # 정적 파일
├── .env.example              # 환경 변수 예시
├── index.html                # HTML 템플릿
├── package.json              # 의존성 관리
├── tsconfig.json             # TypeScript 설정
├── vite.config.ts            # Vite 설정
└── README.md                 # 프로젝트 문서
```

## 기술 스택

- React 18 + TypeScript
- Vite (빌드 도구)
- Zustand (상태 관리)
- WebSocket (FTE 통신)
- Chart.js (데이터 시각화 - 추후 추가 예정)

## 시작하기

1. 의존성 설치: `npm install`
2. 개발 서버 실행: `npm run dev`
3. 브라우저에서 `http://localhost:5173` 접속

자세한 내용은 상위 README.md를 참조하세요.
