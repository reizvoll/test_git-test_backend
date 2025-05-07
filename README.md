# Git Test Backend

[English](#english) | [한국어](#korean)

<a id="english"></a>
# Git Test Backend

A backend service for tracking GitHub activities.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma
- NextAuth.js
- Passport.js
- Docker

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd git-test-backend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the project root and set the following variables:
```
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5433/${DB_NAME}"
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. Start the database using Docker
```bash
docker-compose up -d
```

5. Set up Prisma
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Running the Application

Development mode:
```bash
npm run dev
# or
yarn dev
```

Production build:
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Available Scripts

- `npm run dev`: Start development server (nodemon)
- `npm run build`: Compile TypeScript
- `npm start`: Start production server
- `npm test`: Run tests with Jest
- `npm run migrate`: Run database migrations

## Docker Commands

- Start database: `docker-compose up -d`
- Stop database: `docker-compose down`
- View logs: `docker-compose logs -f`
- Remove volumes: `docker-compose down -v`

## Prisma Commands

- Generate Prisma Client: `npx prisma generate`
- Create migration: `npx prisma migrate dev`
- Reset database: `npx prisma migrate reset`
- View database: `npx prisma studio`

## License

MIT

---

<a id="korean"></a>
# Git Test Backend

GitHub 활동 추적을 위한 백엔드 서비스입니다.

## 기술 스택

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma
- NextAuth.js
- Passport.js
- Docker

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- Docker와 Docker Compose
- npm 또는 yarn

### 설치

1. 저장소 클론
```bash
git clone [repository-url]
cd git-test-backend
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정합니다:
```
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5433/${DB_NAME}"
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

4. Docker로 데이터베이스 실행
```bash
docker-compose up -d
```

5. Prisma 설정
```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate dev
```

### 실행

개발 모드:
```bash
npm run dev
# 또는
yarn dev
```

프로덕션 빌드:
```bash
npm run build
npm start
# 또는
yarn build
yarn start
```

## 사용 가능한 스크립트

- `npm run dev`: 개발 서버 실행 (nodemon)
- `npm run build`: TypeScript 컴파일
- `npm start`: 프로덕션 서버 실행
- `npm test`: Jest를 사용한 테스트 실행
- `npm run migrate`: 데이터베이스 마이그레이션 실행

## Docker 명령어

- 데이터베이스 시작: `docker-compose up -d`
- 데이터베이스 중지: `docker-compose down`
- 로그 확인: `docker-compose logs -f`
- 볼륨 삭제: `docker-compose down -v`

## Prisma 명령어

- Prisma Client 생성: `npx prisma generate`
- 마이그레이션 생성: `npx prisma migrate dev`
- 데이터베이스 초기화: `npx prisma migrate reset`
- 데이터베이스 관리: `npx prisma studio`

## 라이선스

MIT 