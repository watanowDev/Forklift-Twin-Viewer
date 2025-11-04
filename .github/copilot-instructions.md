# GitHub Copilot 지침 문서

## 프로젝트 개요

**Forklift Twin Viewer (FTV)**는 Forklift Twin Engine(FTE)의 실시간 데이터를 시각화하고 모니터링하는 웹 기반 대시보드입니다.

- **기술 스택**: React 18 + TypeScript + Vite
- **상태 관리**: Zustand
- **통신**: WebSocket (바이너리 - Protobuf/MessagePack)
- **차트**: Chart.js
- **대상 사용자**: 엔지니어 및 운영자

## 시스템 아키텍처

```
┌───────────────────────────────────────────────────────────┐
│           FTE (Forklift Twin Engine)                      │
│           엔진 / 게이트웨이                                   │
└─┬─────────────────────────────────────────────────────┬─┘
  │                                                     │
  │ wss:// (PUBLISH)                      wss:// (COMMAND)
  │ 실시간 데이터 스트림                         설정/제어 명령
  ↓                                                     ↑
┌───────────────────────────────────────────────────────────┐
│           FTV (Forklift Twin Viewer)                      │
│           뷰어 및 지게차 센서 세팅 도구                         │
│                                                           │
│  [실시간 데이터 시각화]    [센서 세팅 기능]                    │
│  - 대시보드              - 파라미터 조정                      │
│  - 센서 차트             - 임계값 설정                        │
│  - 이벤트 타임라인        - 캘리브레이션                       │
└───────────────────────────────────────────────────────────┘
```

### 주요 기능
- **실시간 데이터 시각화**: WebSocket을 통한 센서 데이터 모니터링
- **센서 세팅**: 웹 UI를 통한 지게차 센서 파라미터 조정 및 제어

## 코딩 스타일 및 컨벤션

### TypeScript

- **엄격한 타입 체크 사용**: `tsconfig.json`의 strict 모드 준수
- **명시적 타입 정의**: `any` 타입 사용 최소화
- **타입 정의 위치**: `src/types/index.ts`에 공통 타입 정의
- **인터페이스 네이밍**: PascalCase 사용 (예: `ConnectionStatus`, `SensorData`)

```typescript
// ✅ 좋은 예
interface ForkliftData {
  id: string;
  timestamp: number;
  sensors: SensorReading[];
}

// ❌ 나쁜 예
const data: any = response;
```

### React 컴포넌트

- **함수형 컴포넌트**: 항상 함수형 컴포넌트 사용 (클래스 컴포넌트 금지)
- **파일 구조**: 컴포넌트당 하나의 폴더 생성
  ```
  components/
    ComponentName/
      ComponentName.tsx
      ComponentName.css
  ```
- **Props 타입**: 컴포넌트 Props는 항상 인터페이스로 정의
- **Export**: Named export 대신 Default export 사용

```typescript
// ✅ 좋은 예
interface DashboardProps {
  connectionStatus: ConnectionStatus;
  onRefresh: () => void;
}

export default function Dashboard({ connectionStatus, onRefresh }: DashboardProps) {
  // ...
}
```

### Zustand 상태 관리

- **Store 위치**: `src/stores/` 디렉터리
- **Store 네이밍**: `*Store.ts` 형식 (예: `connectionStore.ts`, `dataStore.ts`)
- **불변성 유지**: 상태 업데이트 시 불변성 패턴 사용

```typescript
// ✅ 좋은 예
export const useDataStore = create<DataStore>((set) => ({
  sensors: [],
  updateSensors: (newSensors) => 
    set((state) => ({ sensors: [...state.sensors, ...newSensors] })),
}));
```

### WebSocket 통신

- **연결 관리**: `connectionStore`에서 중앙 관리
- **메시지 타입**: Protobuf 또는 MessagePack 사용
- **에러 핸들링**: 재연결 로직 및 사용자 피드백 필수
- **구독 관리**: 컴포넌트 마운트/언마운트 시 구독/구독 해제

```typescript
// ✅ 좋은 예
useEffect(() => {
  const ws = connectionStore.getState().websocket;
  ws?.send(JSON.stringify({ type: 'SUB', channel: 'actions.event' }));
  
  return () => {
    ws?.send(JSON.stringify({ type: 'UNSUB', channel: 'actions.event' }));
  };
}, []);
```

### CSS 스타일링

- **파일 위치**: 컴포넌트와 동일한 폴더에 배치
- **클래스 네이밍**: BEM 또는 kebab-case 사용
- **반응형 디자인**: 모바일 우선 접근 방식

## 파일 및 폴더 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Dashboard/      # 메인 대시보드
│   ├── ConnectionStatus/ # 연결 상태 표시
│   └── [ComponentName]/ # 각 컴포넌트는 자체 폴더
├── stores/             # Zustand 상태 관리
│   ├── connectionStore.ts
│   └── dataStore.ts
├── types/              # TypeScript 타입 정의
│   └── index.ts
├── utils/              # 유틸리티 함수
├── hooks/              # 커스텀 React Hooks
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx            # 진입점
```

## 개발 가이드라인

### 성능 최적화

- **메모이제이션**: 무거운 계산은 `useMemo` 사용
- **콜백 최적화**: 이벤트 핸들러는 `useCallback` 사용
- **리렌더링 최소화**: 필요한 상태만 구독
- **차트 최적화**: Chart.js 업데이트는 배치로 처리

```typescript
// ✅ 좋은 예
const chartData = useMemo(() => {
  return processHeavySensorData(sensors);
}, [sensors]);
```

### 에러 핸들링

- **경계 처리**: Error Boundary 사용 권장
- **사용자 피드백**: 에러 발생 시 명확한 메시지 표시
- **로깅**: 개발 환경에서 console.error로 상세 로그 출력

```typescript
// ✅ 좋은 예
try {
  const data = JSON.parse(message);
  processData(data);
} catch (error) {
  console.error('Failed to parse WebSocket message:', error);
  // 사용자에게 알림 표시
}
```

### 테스트

- **단위 테스트**: Vitest 사용
- **E2E 테스트**: Playwright 사용
- **커버리지**: 주요 비즈니스 로직은 80% 이상 목표

### 접근성 (Accessibility)

- **시맨틱 HTML**: 적절한 HTML 태그 사용
- **ARIA 속성**: 필요한 경우 ARIA 레이블 추가
- **키보드 내비게이션**: 모든 인터랙티브 요소는 키보드로 접근 가능

## 금지 사항

❌ **피해야 할 패턴**:
- `any` 타입 남용
- 인라인 스타일 과다 사용
- 컴포넌트 내부에서 직접 WebSocket 연결 생성
- 전역 변수 사용
- 하드코딩된 설정 값 (환경 변수 사용)

## 환경 변수

환경 변수는 `.env` 파일에서 관리:

```bash
VITE_WS_URL=wss://localhost:8080/ws
VITE_RECONNECT_INTERVAL=5000
VITE_MAX_RECONNECT_ATTEMPTS=10
```

## 커밋 메시지 규칙

Conventional Commits 스타일 사용:

### 기본 규칙

- **언어**: 한국어로 작성
- **이모지**: 사용 금지
- **형식**: `<타입>: <설명>` (콜론 뒤 공백 필수)

### 타입 종류

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스, 패키지 매니저 설정 등
perf: 성능 개선
```

### 예시

```
✅ 좋은 예:
feat: 실시간 센서 데이터 차트 컴포넌트 추가
fix: WebSocket 재연결 시 메모리 누수 해결
refactor: Dashboard 컴포넌트를 작은 서브 컴포넌트로 분리
docs: 환경 변수 설정 가이드 추가

❌ 나쁜 예:
feat: Add real-time chart (영어 사용)
✨ feat: 차트 추가 (이모지 사용)
새 기능 추가 (타입 누락)
feat:차트추가 (공백 누락)
```

## 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Zustand 문서](https://docs.pmnd.rs/zustand/)
- [Chart.js 문서](https://www.chartjs.org/docs/)
- [Vite 문서](https://vitejs.dev/)

## 도움이 필요한 경우

- 프로젝트 구조는 `README.md` 참조
- 개발 환경 설정은 `DEVELOPMENT.md` 참조
- WebSocket 프로토콜 상세는 FTE 문서 참조

---

**마지막 업데이트**: 2025-11-04  
**작성자**: watanowDev
