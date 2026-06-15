# 룸 대관 서비스 (Room Booking)

Next.js 14 + Cloudflare Pages + Cloudflare Workers(Pages Functions) + Cloudflare D1 기반 룸 예약 시스템

---

## 📁 프로젝트 구조

```
room-booking/
├── src/
│   ├── app/
│   │   ├── booking/          # 예약 신청 페이지
│   │   ├── calendar/         # 예약 현황 달력
│   │   └── admin/            # 관리자 페이지 (비밀번호 보호)
│   ├── components/           # 공통 컴포넌트
│   ├── lib/utils.ts          # 유틸 함수
│   ├── services/
│   │   └── reservationService.ts  # API fetch 레이어
│   ├── types/index.ts        # 타입 & 상수
│   └── hooks/
│       └── useReservation.ts # 예약 훅
├── functions/
│   └── api/
│       └── reservations/
│           ├── index.ts      # GET(목록조회) / POST(예약생성+중복체크)
│           └── [id].ts       # DELETE(예약삭제)
├── schema.sql                # D1 테이블 정의
├── wrangler.toml             # Cloudflare 설정
├── .env.local                # 관리자 비밀번호
└── package.json
```

---

## 🚀 Cloudflare 최초 설정 순서

### 1단계 — Cloudflare 계정 & wrangler 로그인

```bash
npm install
npx wrangler login
```
브라우저가 열리면 Cloudflare 계정으로 로그인하세요.

---

### 2단계 — D1 데이터베이스 생성

```bash
npx wrangler d1 create room-booking-db
```

실행하면 아래처럼 출력됩니다:
```
✅ Successfully created DB 'room-booking-db'
[[d1_databases]]
binding = "DB"
database_name = "room-booking-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   ← 이 값 복사
```

`wrangler.toml` 에서 `YOUR_D1_DATABASE_ID` 를 위 `database_id` 값으로 교체합니다.

---

### 3단계 — D1 테이블 생성

```bash
# 운영 DB에 테이블 생성
npx wrangler d1 execute room-booking-db --remote --file=./schema.sql

# 로컬 테스트용 (선택)
npx wrangler d1 execute room-booking-db --local --file=./schema.sql
```

---

### 4단계 — .env.local 설정

```env
NEXT_PUBLIC_ADMIN_PASSWORD=원하는비밀번호
```

---

### 5단계 — 로컬 개발

```bash
# Next.js 개발 서버 (API 없이 UI만)
npm run dev

# Cloudflare Pages + Workers 포함 전체 로컬 실행
npm run pages:dev
```

> `pages:dev` 는 D1 로컬 DB와 Workers(Functions)까지 함께 실행되어 실제 배포 환경과 동일하게 테스트할 수 있습니다.

---

### 6단계 — 배포

```bash
npm run deploy
```

내부적으로 `next build → wrangler pages deploy out` 순서로 실행됩니다.

최초 배포 시 Cloudflare Pages 프로젝트 이름을 물어봅니다 → `room-booking` 입력

---

### 7단계 — Pages 프로젝트에 D1 바인딩 연결

배포 후 **Cloudflare Dashboard → Pages → room-booking → Settings → Functions → D1 database bindings** 에서:

| Variable name | D1 database       |
|---------------|-------------------|
| DB            | room-booking-db   |

추가 후 **재배포** 한 번 더 실행:
```bash
npm run deploy
```

---

## 🔑 변경해야 할 것 요약

| 파일 | 변경 내용 |
|------|-----------|
| `wrangler.toml` | `database_id` → D1 생성 시 출력된 실제 ID |
| `.env.local` | `NEXT_PUBLIC_ADMIN_PASSWORD` → 원하는 비밀번호 |

---

## 🌐 구조 설명

| 역할 | 기술 |
|------|------|
| 프론트엔드 호스팅 | Cloudflare Pages |
| API 서버 | Cloudflare Pages Functions (Workers) |
| 데이터베이스 | Cloudflare D1 (SQLite) |
| 파일 저장 | Cloudflare R2 (현재 미사용, 확장용) |

### API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/reservations` | 전체 예약 조회 |
| GET | `/api/reservations?room=A&date=2024-07-01` | 룸+날짜 필터 |
| GET | `/api/reservations?date=2024-07-01` | 날짜 필터 |
| GET | `/api/reservations?year=2024&month=7` | 월별 조회 |
| POST | `/api/reservations` | 예약 생성 (서버측 중복 체크) |
| DELETE | `/api/reservations/:id` | 예약 삭제 |

---

## 📱 페이지 구성

- `/booking` — 예약 신청
- `/calendar` — 예약 현황 달력
- `/admin` — 관리자 (비밀번호 인증 후 전체 조회·삭제·CSV 내보내기)
