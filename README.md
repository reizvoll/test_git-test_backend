[English](#english) | [한국어](#korean)

<a id="english"></a>
# Git Test Backend

GitHub Activity Tracker Backend is a server application that provides API endpoints for tracking and analyzing GitHub contributions.

## Features

- 🔐 Secure GitHub OAuth authentication
- 📊 GitHub contribution data processing
- 📈 Historical data management
- 🛡️ Rate limiting and security features

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma
- Passport.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone [repository-url]
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
# Database Configuration
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5433/${DB_NAME}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=git_test_db
DB_USER=your_name
DB_PASSWORD=your_db_password

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_clientID
GITHUB_CLIENT_SECRET=your_github_clientSecret
JWT_SECRET=your_jwt_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

4. Database Setup
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
- `npm run migrate`: Run database migrations

## Prisma Commands

- Generate Prisma Client: `npx prisma generate`
- Create migration: `npx prisma migrate dev`
- Reset database: `npx prisma migrate reset`
- View database: `npx prisma studio`

## Project Structure

```
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── db/          # Database related files
│   ├── middleware/  # Custom middleware
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   ├── types/       # TypeScript types
│   └── utils/       # Utility functions
├── prisma/          # Prisma schema and migrations
└── [config files]   # Configuration files
```

## License

MIT

---

<a id="korean"></a>
# Git Test Backend

GitHub Activity Tracker Backend는 GitHub 기여도를 추적하고 분석하기 위한 API 엔드포인트를 제공하는 서버 애플리케이션입니다.

## 주요 기능

- 🔐 안전한 GitHub OAuth 인증
- 📊 GitHub 기여도 데이터 처리
- 📈 히스토리 데이터 관리
- 🛡️ 요청 제한 및 보안 기능

## 기술 스택

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma
- Passport.js

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- npm 또는 yarn
- PostgreSQL

### 설치

1. 저장소 클론
```bash
git clone [repository-url]
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 다음 변수를 설정합니다:
```
# DB 설정
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5433/${DB_NAME}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=git_test_db
DB_USER=your_name
DB_PASSWORD=your_db_password

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_clientID
GITHUB_CLIENT_SECRET=your_github_clientSecret
JWT_SECRET=your_jwt_secret

# 프론트엔드 URL (CORS용)
FRONTEND_URL=http://localhost:3000
```

4. 데이터베이스 설정
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
- `npm run migrate`: 데이터베이스 마이그레이션 실행

## Prisma 명령어

- Prisma Client 생성: `npx prisma generate`
- 마이그레이션 생성: `npx prisma migrate dev`
- 데이터베이스 초기화: `npx prisma migrate reset`
- 데이터베이스 관리: `npx prisma studio`

## 프로젝트 구조

```
├── src/
│   ├── config/       # 설정 파일
│   ├── controllers/  # 라우트 컨트롤러
│   ├── db/          # 데이터베이스 관련 파일
│   ├── middleware/  # 커스텀 미들웨어
│   ├── routes/      # API 라우트
│   ├── services/    # 비즈니스 로직
│   ├── types/       # TypeScript 타입
│   └── utils/       # 유틸리티 함수
├── prisma/          # Prisma 스키마 및 마이그레이션
└── [config files]   # 설정 파일들
```

## 라이선스

MIT 
