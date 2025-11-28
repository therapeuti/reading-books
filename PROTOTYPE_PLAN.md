# 동화책 자동 인식 TTS 웹 앱 - 프로토타입 개발 계획

## 1. 프로토타입 개요

### 1.1 목표
- 최소 기능 구현 (MVP: Minimum Viable Product)
- GitHub Pages로 배포 가능
- 실제 사용자 피드백 수집
- 백엔드 없이 순수 프론트엔드로 구현

### 1.2 핵심 기능 (Phase 1)

```
✅ 카메라로 책 페이지 촬영
✅ OCR로 텍스트 추출
✅ TTS로 음성 재생
✅ IndexedDB에 로컬 저장
✅ 저장된 책 목록 조회 및 재생
❌ 백엔드 (제외)
❌ 클라우드 동기화 (제외)
❌ 사용자 계정 (제외)
```

---

## 2. 기술 스택 (최종)

### 프론트엔드
```
- React 18 (UI 프레임워크)
- Vite (빌드 도구)
- JavaScript (ES6+)
- Tailwind CSS (스타일링)
- Zustand (상태 관리)  ← Redux 대신 더 간단함
- Tesseract.js (OCR)
- Web Speech API (TTS)
- IndexedDB (로컬 저장소)
```

### 배포
```
- GitHub Pages (정적 호스팅)
- GitHub Actions (자동 배포)
```

### 개발 도구
```
- Node.js 18+
- npm 또는 yarn
- Git
- VS Code
```

---

## 3. 프로젝트 구조

```
reading-books/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CameraPage.jsx
│   │   │   ├── BookListPage.jsx
│   │   │   ├── BookDetailPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Modal.jsx
│   │   │
│   │   └── features/
│   │       ├── Camera/
│   │       │   ├── CameraView.jsx
│   │       │   └── CameraView.css
│   │       │
│   │       ├── TextDisplay/
│   │       │   ├── TextDisplay.jsx
│   │       │   └── TextDisplay.css
│   │       │
│   │       ├── TTSControls/
│   │       │   ├── TTSControls.jsx
│   │       │   └── TTSControls.css
│   │       │
│   │       └── BookCard/
│   │           ├── BookCard.jsx
│   │           └── BookCard.css
│   │
│   ├── modules/
│   │   ├── camera.js
│   │   ├── ocr.js
│   │   ├── tts.js
│   │   ├── storage.js
│   │   └── pageDetection.js
│   │
│   ├── hooks/
│   │   ├── useCamera.js
│   │   ├── useOCR.js
│   │   ├── useTTS.js
│   │   ├── useBook.js
│   │   └── useStorage.js
│   │
│   ├── store/
│   │   ├── appStore.js (Zustand)
│   │   └── storageStore.js
│   │
│   ├── utils/
│   │   ├── imageProcessing.js
│   │   ├── validation.js
│   │   ├── uuid.js
│   │   └── constants.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .github/
│   └── workflows/
│       └── deploy.yml (GitHub Actions)
│
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 4. 개발 단계별 계획

### Phase 1: 프로젝트 초기 설정 (2-3일)

#### 1.1 프로젝트 생성 및 의존성 설치
```bash
npm create vite@latest reading-books -- --template react
cd reading-books
npm install
```

#### 1.2 필요한 패키지 설치
```bash
npm install --save \
  tailwindcss postcss autoprefixer \
  zustand \
  tesseract.js \
  uuid

npm install --save-dev \
  @tailwindcss/forms \
  @tailwindcss/typography
```

#### 1.3 Tailwind CSS 설정
```bash
npx tailwindcss init -p
```

#### 1.4 Git 저장소 설정
```bash
git init
git add .
git commit -m "Initial commit: project setup"
git branch -M main
git remote add origin https://github.com/your-username/reading-books.git
git push -u origin main
```

**완료물:**
- ✅ Vite 프로젝트 생성
- ✅ Tailwind CSS 설정 완료
- ✅ GitHub 저장소 연결
- ✅ 기본 폴더 구조 생성

---

### Phase 2: 핵심 모듈 개발 (1주일)

#### 2.1 Camera 모듈 (2일)
```javascript
// src/modules/camera.js

class CameraModule {
  constructor() {
    this.mediaStream = null;
    this.videoElement = null;
    this.canvasElement = null;
  }

  async init(videoElementId) {
    // 1. video 요소 가져오기
    // 2. getUserMedia로 카메라 접근
    // 3. 스트림 시작
  }

  captureFrame() {
    // Canvas에 현재 프레임 그리기
    // Blob으로 변환 후 반환
  }

  async switchCamera() {
    // 카메라 전환 (전면/후면)
  }

  stop() {
    // 카메라 중지
  }
}

export default CameraModule;
```

**작업:**
- [ ] CameraModule 클래스 구현
- [ ] 카메라 권한 요청 처리
- [ ] 프레임 캡처 함수
- [ ] 에러 처리

---

#### 2.2 OCR 모듈 (3일)
```javascript
// src/modules/ocr.js

class OCRModule {
  constructor() {
    this.worker = null;
  }

  async init() {
    // Tesseract Worker 초기화
  }

  async extractText(image) {
    // 이미지에서 텍스트 추출
    // 신뢰도 점수 반환
    return {
      text: '추출된 텍스트',
      confidence: 85
    };
  }

  async preprocessImage(image) {
    // 이미지 전처리 (선택사항)
  }

  terminate() {
    // Worker 종료
  }
}

export default OCRModule;
```

**작업:**
- [ ] Tesseract.js 초기화
- [ ] 텍스트 추출 함수
- [ ] 신뢰도 점수 계산
- [ ] 에러 처리

---

#### 2.3 TTS 모듈 (2일)
```javascript
// src/modules/tts.js

class TTSModule {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
  }

  async speak(text, options = {}) {
    // 1. 기존 음성 중지
    // 2. SpeechSynthesisUtterance 생성
    // 3. 옵션 적용 (속도, 음량 등)
    // 4. 음성 재생 시작
  }

  pause() {
    // 음성 일시정지
  }

  resume() {
    // 음성 재개
  }

  stop() {
    // 음성 중지
  }

  setSpeed(speed) {
    // 속도 설정 (0.5 ~ 2.0)
  }

  setVolume(volume) {
    // 음량 설정 (0 ~ 100)
  }

  getAvailableVoices() {
    // 사용 가능한 음성 목록 반환
  }
}

export default TTSModule;
```

**작업:**
- [ ] Web Speech API 통합
- [ ] 음성 재생/제어 함수
- [ ] 속도/음량 조절
- [ ] 한국어 음성 지원

---

#### 2.4 Storage 모듈 (2일)
```javascript
// src/modules/storage.js

class StorageModule {
  constructor() {
    this.db = null;
  }

  async init() {
    // IndexedDB 데이터베이스 초기화
    // 3개 Object Store 생성:
    // - books: 책 정보
    // - pages: 페이지 정보
    // - preferences: 사용자 설정
  }

  async saveBook(book) {
    // 책 저장
  }

  async getBook(bookId) {
    // 책 조회
  }

  async getAllBooks() {
    // 모든 책 조회
  }

  async deletebook(bookId) {
    // 책 삭제
  }

  async savePage(page) {
    // 페이지 저장
  }

  async updatePageText(pageId, text) {
    // 페이지 텍스트 수정
  }

  // ... 다른 CRUD 함수들
}

export default StorageModule;
```

**작업:**
- [ ] IndexedDB 초기화
- [ ] 책/페이지 CRUD 함수
- [ ] 사용자 설정 저장
- [ ] 트랜잭션 처리

---

#### 2.5 Page Detection 모듈 (1일)
```javascript
// src/modules/pageDetection.js

class PageDetectionModule {
  constructor() {
    this.previousFrameHash = null;
    this.callbacks = [];
    this.isMonitoring = false;
  }

  startMonitoring(frameProvider, sensitivity = 50) {
    // 프레임 모니터링 시작
    // 페이지 변경 감지 시 콜백 실행
  }

  stopMonitoring() {
    // 모니터링 중지
  }

  onPageChange(callback) {
    // 페이지 변경 리스너 등록
  }

  // 프레임 차이 계산 함수
  calculateFrameDifference(frame1, frame2) {
    // 두 프레임의 유사도 계산
  }
}

export default PageDetectionModule;
```

**작업:**
- [ ] 프레임 모니터링 로직
- [ ] 페이지 변경 감지 알고리즘
- [ ] 콜백 시스템 구현

---

### Phase 3: UI 컴포넌트 개발 (1주일)

#### 3.1 기본 레이아웃 (2일)
- [ ] App.jsx (라우팅 설정)
- [ ] Header.jsx (헤더 컴포넌트)
- [ ] HomePage.jsx (메인 화면)
- [ ] Tailwind CSS 기본 스타일

#### 3.2 카메라 화면 (3일)
- [ ] CameraPage.jsx
- [ ] CameraView.jsx (비디오 스트림)
- [ ] TextDisplay.jsx (추출된 텍스트)
- [ ] TTSControls.jsx (음성 제어)
- [ ] Modal (파일 업로드, 텍스트 입력)

#### 3.3 책 목록/상세 화면 (2일)
- [ ] BookListPage.jsx
- [ ] BookDetailPage.jsx
- [ ] BookCard.jsx
- [ ] PageSlider (페이지 네비게이션)

#### 3.4 설정 화면 (1일)
- [ ] SettingsPage.jsx
- [ ] 각 설정 옵션 UI

---

### Phase 4: 상태 관리 (3일)

#### 4.1 Zustand Store 설정
```javascript
// src/store/appStore.js

import { create } from 'zustand';

const useAppStore = create((set) => ({
  // 상태
  currentBook: null,
  currentPage: 1,
  books: [],
  loading: false,
  error: null,

  // 액션
  setCurrentBook: (book) => set({ currentBook: book }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setBooks: (books) => set({ books }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));

export default useAppStore;
```

**작업:**
- [ ] 카메라 상태 관리
- [ ] 책/페이지 상태 관리
- [ ] TTS 상태 관리
- [ ] 설정 상태 관리

#### 4.2 Custom Hooks
- [ ] useCamera.js
- [ ] useOCR.js
- [ ] useTTS.js
- [ ] useBook.js
- [ ] useStorage.js

---

### Phase 5: 통합 및 테스트 (3-4일)

#### 5.1 기능 통합
- [ ] 카메라 → OCR 연결
- [ ] OCR → 저장소 연결
- [ ] 저장소 → TTS 연결
- [ ] 상태 관리 통합

#### 5.2 테스트
- [ ] 카메라 접근 테스트
- [ ] OCR 텍스트 추출 테스트
- [ ] TTS 음성 재생 테스트
- [ ] IndexedDB 저장/조회 테스트
- [ ] UI 반응성 테스트

#### 5.3 버그 수정 및 최적화
- [ ] 발견된 버그 수정
- [ ] 성능 최적화
- [ ] 모바일 반응형 테스트

---

### Phase 6: GitHub Pages 배포 (1-2일)

#### 6.1 배포 설정
```bash
# package.json 수정
"homepage": "https://your-username.github.io/reading-books",

# vite.config.js 수정
export default {
  base: '/reading-books/',
  // ...
}
```

#### 6.2 GitHub Actions 자동 배포
```yaml
# .github/workflows/deploy.yml

name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 6.3 배포 실행
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

**결과:** https://your-username.github.io/reading-books

---

## 5. 전체 일정

| Phase | 작업 | 기간 | 누적 |
|-------|------|------|------|
| 1 | 프로젝트 초기 설정 | 2-3일 | 2-3일 |
| 2 | 핵심 모듈 개발 | 7일 | 9-10일 |
| 3 | UI 컴포넌트 | 7일 | 16-17일 |
| 4 | 상태 관리 | 3일 | 19-20일 |
| 5 | 통합 및 테스트 | 3-4일 | 22-24일 |
| 6 | GitHub Pages 배포 | 1-2일 | 23-26일 |
| **총 기간** | | | **약 3.5~4주** |

---

## 6. 개발 시작 체크리스트

### 준비 단계
- [ ] Node.js 18+ 설치 확인
- [ ] Git 설치 확인
- [ ] GitHub 계정 생성
- [ ] VS Code 설치

### 저장소 생성
- [ ] GitHub에서 새 저장소 생성 (reading-books)
- [ ] 저장소 설정:
  - [ ] Settings → Pages → GitHub Actions 선택
  - [ ] Branch: main, folder: root 설정

### 로컬 환경 설정
- [ ] `npm create vite@latest reading-books -- --template react`
- [ ] 의존성 설치
- [ ] Git 저장소 연결
- [ ] 첫 커밋

### 개발 시작
- [ ] Phase 1: 기본 설정
- [ ] Phase 2: 모듈 개발
- [ ] Phase 3: UI 개발
- [ ] 이하 반복...

---

## 7. 주의사항

### 성능 최적화
- Tesseract.js는 Worker 사용 (UI 블로킹 방지)
- 이미지는 압축해서 저장
- IndexedDB는 큰 Blob 객체 주의

### 호환성
- Safari iOS의 카메라 접근 확인
- Web Speech API 브라우저 호환성 확인
- IndexedDB 용량 제한 (50MB+)

### 보안
- 카메라 영상은 서버에 저장하지 않음
- 로컬에만 저장

---

## 8. 다음 단계 (프로토타입 이후)

프로토타입 완성 후 다음을 고려:
- ✅ 사용자 피드백 수집
- ✅ 기능 개선
- ⚠️ 백엔드 구축 (필요시)
- ⚠️ 사용자 계정 시스템 (필요시)
- ⚠️ 클라우드 동기화 (필요시)

---

이 계획에 따라 진행하면 약 3-4주 안에 프로토타입을 GitHub Pages에 배포할 수 있습니다!
