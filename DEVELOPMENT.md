# Forklift Twin Viewer

실시간 지게차 디지털 트윈 데이터 모니터링 뷰어

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
