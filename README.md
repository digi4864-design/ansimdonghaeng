# 안심동행 - 병원 동행 서비스

어르신의 병원 방문을 전문 매니저가 함께하는 병원 동행 서비스 플랫폼입니다.

## 구성

| 앱 | 설명 | 포트 |
|---|---|---|
| `apps/api` | NestJS REST API 서버 | 3000 |
| `apps/user-app` | 어르신/보호자용 React Native 앱 | 8081 |
| `apps/manager-app` | 매니저용 React Native 앱 | 8082 |
| `apps/admin-web` | 관리자 대시보드 (Next.js) | 3001 |

## 기술 스택

- **API**: NestJS, Prisma, SQLite, JWT 인증
- **모바일**: Expo (React Native), TanStack Query
- **관리자**: Next.js, Tailwind CSS
- **모노레포**: npm workspaces + Turborepo

## 예약 플로우

```
어르신 예약 신청 (PENDING)
    → 매니저 동행 신청 (MATCHED)
    → 단계 업데이트: 출발 → 병원도착 → 진료중 → 진료완료 → 귀가중 → 완료 (COMPLETED)
    → 교통비 입력
    → 진료 리포트 제출
```

## 실행 방법

### 사전 요구사항

- Node.js 18+
- Expo Go 앱 (Android/iOS)

### 설치

```bash
npm install
```

### API 서버 실행

```bash
cd apps/api
npm run start:dev
```

### 모바일 앱 실행

```bash
# 어르신 앱
cd apps/user-app
npx expo start --port 8081

# 매니저 앱
cd apps/manager-app
npx expo start --port 8082
```

### 관리자 웹 실행

```bash
cd apps/admin-web
npm run dev
```

## 환경변수

`apps/api/.env.example` 참고:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

## 주요 기능

### 어르신 앱 (user-app)
- 병원 동행 예약 신청
- 예약 현황 실시간 확인
- 매니저 배정 알림
- 예약 취소

### 매니저 앱 (manager-app)
- 신청 가능한 동행 목록 조회
- 동행 수락 및 단계별 진행 업데이트
- 교통비 입력 (택시/대중교통/매니저 자가용)
- 진료 리포트 작성

### 관리자 대시보드 (admin-web)
- 전체 예약 현황 관리
- 매니저/사용자 관리
- 통계
