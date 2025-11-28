# 기술 스택 업데이트 (TypeScript → JavaScript)

## 📋 변경 사항 요약

### 이전 (TypeScript 기반)
```
프론트엔드: React 18 + TypeScript
상태 관리: Redux Toolkit
빌드: Vite
배포: 백엔드 포함 풀스택
```

### 현재 (JavaScript 기반 - 프로토타입)
```
프론트엔드: React 18 + JavaScript
상태 관리: Zustand (더 간단함)
빌드: Vite
배포: GitHub Pages (정적 호스팅)
백엔드: 제외 (IndexedDB만 사용)
```

---

## 🛠️ 최종 기술 스택

### 프론트엔드
| 분야 | 기술 | 버전 | 이유 |
|------|------|------|------|
| **프레임워크** | React | 18+ | UI 렌더링, 컴포넌트 기반 |
| **언어** | JavaScript (ES6+) | - | 간단하고 빠른 개발 |
| **빌드 도구** | Vite | 4+ | 빠른 빌드, HMR 지원 |
| **스타일링** | Tailwind CSS | 3+ | 유틸리티 기반, 반응형 |
| **상태 관리** | Zustand | 4+ | Redux보다 간단, 번들 작음 |
| **라우팅** | React Router | 6+ | 페이지 네비게이션 |
| **OCR** | Tesseract.js | 5+ | 오프라인 지원, 한글 지원 |
| **TTS** | Web Speech API | 브라우저 내장 | 무료, 한글 지원 |
| **저장소** | IndexedDB | 브라우저 내장 | 50MB+ 저장, 쿼리 지원 |
| **UUID 생성** | uuid | 9+ | 고유 ID 생성 |

### 개발 도구
| 도구 | 버전 | 용도 |
|------|------|------|
| **Node.js** | 18+ | 런타임 환경 |
| **npm** | 9+ | 패키지 매니저 |
| **Git** | 2+ | 버전 관리 |
| **GitHub** | - | 코드 호스팅 |
| **VS Code** | 최신 | 코드 에디터 |

### 배포
| 항목 | 선택 | 이유 |
|------|------|------|
| **정적 호스팅** | GitHub Pages | 무료, 자동 배포 |
| **CI/CD** | GitHub Actions | 무료, GitHub 통합 |
| **빌드 프로세스** | Vite | 빠르고 효율적 |

---

## 📦 설치 명령어

### 1. 프로젝트 생성
```bash
npm create vite@latest reading-books -- --template react
cd reading-books
npm install
```

### 2. 필요한 패키지 설치
```bash
npm install --save \
  react-router-dom \
  zustand \
  tesseract.js \
  uuid \
  tailwindcss \
  postcss \
  autoprefixer

npm install --save-dev \
  @tailwindcss/forms \
  @tailwindcss/typography
```

### 3. Tailwind CSS 초기화
```bash
npx tailwindcss init -p
```

---

## 🎯 각 기술의 역할

### React 18
- **용도**: UI 렌더링, 컴포넌트 관리
- **이유**: 가장 인기 있는 라이브러리, 많은 생태계
- **파일**: `src/components/**/*.jsx`

### JavaScript (ES6+)
- **용도**: 논리 구현, 함수형 프로그래밍
- **이유**: TypeScript보다 간단한 학습곡선
- **파일**: `src/modules/**/*.js`, `src/hooks/**/*.js`

### Vite
- **용도**: 빌드 및 개발 서버
- **이유**: 매우 빠른 빌드, HMR 지원
- **설정**: `vite.config.js`

### Tailwind CSS
- **용도**: UI 스타일링
- **이유**: 빠른 개발, 모바일 반응형 지원
- **설정**: `tailwind.config.js`
- **사용**: `className="bg-blue-500 p-4 rounded-lg"`

### Zustand
- **용도**: 전역 상태 관리
- **이유**: Redux보다 간단, 번들 크기 작음
- **파일**: `src/store/appStore.js`
- **대안**: Redux (복잡함), Context API (성능 이슈)

### React Router
- **용도**: 페이지 라우팅
- **이유**: 표준 라우팅 라이브러리
- **파일**: `src/App.jsx`

### Tesseract.js
- **용도**: 이미지 → 텍스트 변환 (OCR)
- **이유**: 오프라인 지원, 한글 지원
- **위치**: 클라이언트 (Worker 사용)
- **파일**: `src/modules/ocr.js`

### Web Speech API
- **용도**: 텍스트 → 음성 변환 (TTS)
- **이유**: 브라우저 내장, 무료
- **위치**: 클라이언트
- **파일**: `src/modules/tts.js`

### IndexedDB
- **용도**: 로컬 저장소 (책, 페이지, 설정)
- **이유**: 50MB 이상 저장 가능, 쿼리 지원
- **위치**: 브라우저
- **파일**: `src/modules/storage.js`

### GitHub Pages
- **용도**: 정적 웹사이트 호스팅
- **이유**: 무료, 자동 배포
- **URL**: `https://username.github.io/reading-books`

### GitHub Actions
- **용도**: CI/CD 자동화
- **이유**: 푸시할 때마다 자동 빌드 및 배포
- **파일**: `.github/workflows/deploy.yml`

---

## 📊 기술 스택 비교

### 과거 (요구사항 명세서 기준)
| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 18 + TypeScript | 타입 안정성 |
| 상태 관리 | Redux Toolkit | 복잡한 상태 관리 |
| 백엔드 | Node.js + Express | 풀스택 앱 |
| 데이터베이스 | MongoDB | NoSQL |
| 배포 | AWS/Heroku | 풀스택 필요 |

### 현재 (프로토타입)
| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 18 + JavaScript | 빠른 개발 |
| 상태 관리 | Zustand | 간단, 가벼움 |
| 백엔드 | 없음 | 프로토타입만 필요 |
| 데이터베이스 | IndexedDB | 로컬 저장소 |
| 배포 | GitHub Pages | 무료, 간단 |

---

## 🚀 개발 흐름

```
1. 로컬 개발
   npm run dev → localhost:5173

2. 코드 커밋
   git add .
   git commit -m "message"
   git push origin main

3. GitHub Actions 자동 실행
   → npm install
   → npm run build
   → dist/ 생성

4. GitHub Pages 배포
   → dist/를 gh-pages 브랜치에 배포
   → https://username.github.io/reading-books 배포 완료
```

---

## 📁 폴더 구조 (최종)

```
reading-books/
├── public/                    # 정적 파일
│   └── index.html
│
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── common/          # 공용 컴포넌트
│   │   └── features/        # 기능별 컴포넌트
│   │
│   ├── modules/             # 비즈니스 로직
│   │   ├── camera.js
│   │   ├── ocr.js
│   │   ├── tts.js
│   │   ├── storage.js
│   │   └── pageDetection.js
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useCamera.js
│   │   ├── useOCR.js
│   │   ├── useTTS.js
│   │   └── useStorage.js
│   │
│   ├── store/               # Zustand 스토어
│   │   └── appStore.js
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── constants.js
│   │   ├── validation.js
│   │   └── imageProcessing.js
│   │
│   ├── styles/              # CSS 파일
│   │   └── index.css
│   │
│   ├── App.jsx              # 메인 App 컴포넌트
│   └── main.jsx             # 진입점
│
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions 배포 설정
│
├── .gitignore
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🔧 vite.config.js 설정

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/reading-books/',  // GitHub Pages 서브폴더
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false
  }
})
```

---

## 📝 npm 스크립트

```json
{
  "scripts": {
    "dev": "vite",                    // 개발 서버 실행
    "build": "vite build",            // 프로덕션 빌드
    "preview": "vite preview",        // 빌드 결과 미리보기
    "deploy": "npm run build"         // 배포 (GitHub Actions에서 자동)
  }
}
```

---

## 🎯 JavaScript vs TypeScript

### JavaScript (현재) 선택 이유
✅ 개발 속도 빠름
✅ 학습 곡선 낮음
✅ 프로토타입 개발에 적합
✅ 번들 크기 작음

### TypeScript의 장점 (향후 고려)
⚠️ 타입 안정성
⚠️ IDE 자동완성 우수
⚠️ 리팩토링 용이
⚠️ 팀 규모 확대 시 강점

**결론**: 프로토타입은 JavaScript로, 이후 필요시 TypeScript로 전환 가능

---

## 🔄 TypeScript로 전환 (선택)

프로토타입 완성 후 TypeScript로 전환하려면:

1. **타입 정의 파일 추가** (`src/types/index.d.js`)
2. **JSDoc 주석 추가** (JavaScript에서 타입 안정성)
3. **완전 TypeScript로 전환** (향후)

---

## 🚀 배포 체크리스트

- [ ] GitHub 저장소 생성
- [ ] GitHub Pages 설정 (Settings → Pages)
- [ ] GitHub Actions 워크플로우 파일 추가
- [ ] `vite.config.js`에서 `base` 설정
- [ ] `package.json`에서 `homepage` 설정
- [ ] 코드 커밋 및 푸시
- [ ] GitHub Actions 빌드 확인
- [ ] GitHub Pages 배포 확인

---

## 📊 번들 크기 비교

| 라이브러리 | 크기 | 비고 |
|-----------|------|------|
| React | 42KB | 필수 |
| React DOM | 45KB | 필수 |
| Zustand | 2KB | 상태 관리 |
| React Router | 30KB | 라우팅 |
| Tailwind CSS | ~15KB | 스타일 |
| Tesseract.js | 2.4MB | 큰 모델 포함 |
| **합계** | ~2.6MB | 압축 후 ~600KB |

> Tesseract.js는 처음 로드 시 모델을 다운로드하므로 초기 로딩이 느릴 수 있음

---

## 🎓 학습 자료

- [React 공식 문서](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vite 공식 가이드](https://vitejs.dev)
- [GitHub Pages 가이드](https://docs.github.com/en/pages)

---

이제 프로토타입 개발을 시작할 준비가 완벽히 되었습니다! 🚀

