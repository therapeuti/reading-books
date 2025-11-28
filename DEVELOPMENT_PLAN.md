# 동화책 자동 인식 TTS 웹 앱 - 개발 계획

## 1. 프로젝트 구조

```
reading-books/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── CameraView.tsx
│   │   ├── TextDisplay.tsx
│   │   ├── TTSControls.tsx
│   │   ├── BookList.tsx
│   │   ├── BookDetail.tsx
│   │   ├── TextEditor.tsx
│   │   └── Settings.tsx
│   │
│   ├── modules/
│   │   ├── CameraModule.ts
│   │   ├── OCRModule.ts
│   │   ├── TTSModule.ts
│   │   ├── StorageModule.ts
│   │   └── PageDetectionModule.ts
│   │
│   ├── services/
│   │   ├── bookService.ts
│   │   ├── pageService.ts
│   │   └── settingsService.ts
│   │
│   ├── store/
│   │   ├── slices/
│   │   │   ├── cameraSlice.ts
│   │   │   ├── bookSlice.ts
│   │   │   ├── ttsSlice.ts
│   │   │   └── settingsSlice.ts
│   │   └── store.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── imageProcessing.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CameraPage.tsx
│   │   ├── BookListPage.tsx
│   │   ├── BookDetailPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 2. 개발 단계별 계획

### Phase 1: 프로젝트 초기 설정 (1주일)

#### 목표
기본 프로젝트 구조 완성 및 개발 환경 구성

#### 작업 항목
- [ ] React + TypeScript + Vite 프로젝트 생성
  - `npm create vite@latest reading-books -- --template react-ts`
  - 필요 패키지 설치

- [ ] Tailwind CSS 또는 Material-UI 설정
  - Tailwind CSS 추천 (가볍고 빠름)
  - tailwind.config.js 설정
  - globals.css 작성

- [ ] Redux Toolkit 및 React-Redux 설정
  - `npm install @reduxjs/toolkit react-redux`
  - store 구조 설정
  - Redux DevTools 설정

- [ ] TypeScript 설정 완료
  - tsconfig.json 최적화
  - 기본 타입 정의 (types/index.ts)

- [ ] 폴더 구조 생성
  - components/, modules/, services/, store/ 등 생성

- [ ] git 저장소 초기화
  - .gitignore 설정
  - 초기 커밋

**산출물:**
- 기본 프로젝트 구조 완성
- 개발 환경 구성 완료
- 초기 코드 커밋

**예상 소요 시간:** 5일

---

### Phase 2: 코어 모듈 개발 (3주일)

#### Subtask 2.1: 카메라 모듈 (5일)

**목표:** 카메라 실시간 스트림 및 캡처 기능 완성

**작업 항목:**
- [ ] CameraModule 클래스 구현
  ```typescript
  class CameraModule {
    initCamera(constraints: MediaStreamConstraints): Promise<void>
    captureFrame(): Canvas
    captureFrameAsBlob(): Promise<Blob>
    getDevices(): Promise<MediaDeviceInfo[]>
    switchCamera(deviceId?: string): Promise<void>
    stopCamera(): void
    getVideoElement(): HTMLVideoElement
  }
  ```

- [ ] getUserMedia API 통합
  - 권한 요청 처리
  - 에러 처리 (권한 거부, 장치 없음)
  - iOS/Android 호환성 확인

- [ ] 실시간 비디오 스트림
  - HTML5 video 태그 통합
  - 화면 고정 (세로 방향)

- [ ] 사진 캡처 기능
  - Canvas를 사용한 프레임 캡처
  - 이미지 품질 최적화
  - Blob 변환

- [ ] 카메라 전환 기능
  - 전면/후면 전환
  - 장치 목록 관리

- [ ] 단위 테스트 작성
  - initCamera 테스트
  - captureFrame 테스트
  - switchCamera 테스트

**산출물:**
- CameraModule 완성 및 테스트
- camera.test.ts

**예상 소요 시간:** 5일

---

#### Subtask 2.2: OCR 모듈 (7일)

**목표:** Tesseract.js를 사용한 OCR 텍스트 추출 완성

**작업 항목:**
- [ ] Tesseract.js 설치 및 통합
  - `npm install tesseract.js`
  - Worker 초기화

- [ ] OCRModule 클래스 구현
  ```typescript
  class OCRModule {
    extractText(image: Blob | Canvas): Promise<{text, confidence}>
    preprocessImage(image: Blob): Promise<Canvas>
    detectPageChange(currentFrame: Canvas, previousFrame: Canvas): boolean
    calculateFrameDifference(frame1: Canvas, frame2: Canvas): number
    setSensitivity(sensitivity: number): void
    initWorker(): Promise<void>
    terminateWorker(): void
  }
  ```

- [ ] 이미지 전처리 함수 개발
  - 명암 조정 (Contrast Enhancement)
  - 기울기 보정 (Skew Correction) - 선택사항
  - 이진화 (Binarization)
  - 잡음 제거 (Denoising)
  - OpenCV.js 또는 Canvas API 사용

- [ ] 텍스트 추출 로직
  - Tesseract.js로 텍스트 인식
  - 한글/영어 언어 설정
  - 에러 처리

- [ ] 신뢰도 점수 계산
  - Tesseract 신뢰도 점수 분석
  - 0-100 범위 정규화
  - 임계값 설정 (60%)

- [ ] 페이지 변경 감지 로직
  - 프레임 해시값 계산 (Perceptual Hash)
  - 이전 프레임과의 차이도 계산 (Hamming Distance)
  - 임계값 기반 감지

- [ ] 성능 최적화
  - Worker 스레드 사용
  - 메모리 누수 방지
  - 캐싱 구현

- [ ] 단위 테스트 작성
  - extractText 테스트
  - detectPageChange 테스트
  - preprocessImage 테스트

**산출물:**
- OCRModule 완성 및 테스트
- imageProcessing.ts (전처리 함수)
- ocr.test.ts

**예상 소요 시간:** 7일

---

#### Subtask 2.3: TTS 모듈 (5일)

**목표:** Web Speech API를 사용한 음성 합성 및 재생 완성

**작업 항목:**
- [ ] TTSModule 클래스 구현
  ```typescript
  class TTSModule {
    speak(text: string, options?: TTSOptions): Promise<void>
    pause(): void
    resume(): void
    stop(): void
    setSpeed(speed: number): void
    setVolume(volume: number): void
    setVoice(voice: SpeechSynthesisVoice): void
    getAvailableVoices(): SpeechSynthesisVoice[]
    isPlaying(): boolean
    getCurrentSettings(): TTSSettings
  }
  ```

- [ ] Web Speech API 통합
  - SpeechSynthesis 초기화
  - 한국어 음성 지원

- [ ] 음성 제어 기능
  - 재생, 일시정지, 재개, 중지
  - 속도 조절 (0.5x ~ 2.0x)
  - 음량 조절 (0 ~ 100%)

- [ ] 음성 선택
  - 사용 가능한 음성 목록 조회
  - 남성/여성 음성 선택

- [ ] 이벤트 처리
  - onstart, onend, onerror 콜백
  - 재생 상태 추적

- [ ] 음성 캐싱 (선택사항)
  - 동일한 텍스트 재사용 시 캐시

- [ ] 단위 테스트 작성
  - speak 테스트
  - pause/resume/stop 테스트
  - setSpeed/setVolume 테스트

**산출물:**
- TTSModule 완성 및 테스트
- tts.test.ts

**예상 소요 시간:** 5일

---

#### Subtask 2.4: 저장소 모듈 (3일)

**목표:** IndexedDB 기반 로컬 저장소 완성

**작업 항목:**
- [ ] StorageModule 클래스 구현
  ```typescript
  class StorageModule {
    initDB(): Promise<void>
    saveBook(book: Book): Promise<string>
    getBook(bookId: string): Promise<Book | undefined>
    getAllBooks(sortBy?: string): Promise<Book[]>
    deleteBook(bookId: string): Promise<void>
    savePage(page: Page): Promise<string>
    getPagesByBook(bookId: string): Promise<Page[]>
    getPage(pageId: string): Promise<Page | undefined>
    updatePageText(pageId: string, editedText: string): Promise<void>
    deletePage(pageId: string): Promise<void>
    saveUserPreferences(prefs: UserPreferences): Promise<void>
    getUserPreferences(): Promise<UserPreferences | undefined>
    getDBSize(): Promise<{used, quota}>
    clearCache(): Promise<void>
    resetDB(): Promise<void>
  }
  ```

- [ ] IndexedDB 스키마 설정
  - books, pages, preferences object stores 생성
  - 인덱스 설정 (createdAt, updatedAt, bookId, pageNumber)

- [ ] CRUD 함수 개발
  - Create: saveBook, savePage, saveUserPreferences
  - Read: getBook, getAllBooks, getPagesByBook, getPage, getUserPreferences
  - Update: updatePageText
  - Delete: deleteBook, deletePage

- [ ] 트랜잭션 처리
  - 동시성 제어
  - 에러 롤백

- [ ] 데이터 유효성 검사
  - 필수 필드 확인
  - 타입 검사

- [ ] 단위 테스트 작성
  - saveBook/getBook 테스트
  - CRUD 작업 테스트

**산출물:**
- StorageModule 완성 및 테스트
- storage.test.ts
- IndexedDB 스키마 정의

**예상 소요 시간:** 3일

---

#### Subtask 2.5: 페이지 감지 모듈 (3일)

**목표:** 실시간 프레임 분석을 통한 페이지 변경 감지

**작업 항목:**
- [ ] PageDetectionModule 클래스 구현
  ```typescript
  class PageDetectionModule {
    startMonitoring(frameProvider, sensitivity, interval): void
    stopMonitoring(): void
    onPageChange(callback): void
    setSensitivity(sensitivity: number): void
    getSensitivity(): number
    isMonitoring(): boolean
  }
  ```

- [ ] 프레임 모니터링 로직
  - requestAnimationFrame 또는 setInterval 사용
  - 프레임 캡처 및 저장
  - 메모리 관리 (이전 프레임만 유지)

- [ ] 페이지 변경 감지
  - OCRModule의 detectPageChange 사용
  - 감지 임계값 설정 및 관리

- [ ] 콜백 시스템
  - onPageChange 이벤트 리스너 등록
  - 여러 리스너 지원

- [ ] 에러 처리
  - 프레임 캡처 실패 시 처리
  - 모니터링 중단 시 정리

- [ ] 단위 테스트 작성
  - startMonitoring/stopMonitoring 테스트
  - onPageChange 콜백 테스트

**산출물:**
- PageDetectionModule 완성 및 테스트
- pageDetection.test.ts

**예상 소요 시간:** 3일

---

### Phase 3: UI 컴포넌트 개발 (2주일)

#### Subtask 3.1: 기본 레이아웃 (3일)

**목표:** 기본 네비게이션 및 레이아웃 구조 완성

**작업 항목:**
- [ ] App.tsx 메인 레이아웃
  - 라우팅 설정 (React Router)
  - 기본 레이아웃 구조

- [ ] Header 컴포넌트
  - 페이지 제목
  - 뒤로가기 버튼
  - 설정 버튼 (아이콘)

- [ ] Navigation 컴포넌트 (선택사항)
  - 하단 탭 네비게이션
  - 또는 메뉴 드로어

- [ ] HomePage 페이지
  - 3가지 주요 기능 버튼 (카메라, 책, 설정)
  - 최근 읽은 책 표시
  - 반응형 레이아웃

- [ ] Tailwind CSS 스타일링
  - 색상 팔레트 설정
  - Typography 스타일 정의
  - 컴포넌트 기본 스타일

**산출물:**
- App.tsx
- HomePage.tsx
- Header 컴포넌트
- 기본 스타일 완성

**예상 소요 시간:** 3일

---

#### Subtask 3.2: 카메라 화면 (5일)

**목표:** 실시간 카메라 뷰 및 텍스트 추출 UI 완성

**작업 항목:**
- [ ] CameraPage.tsx
  - 화면 레이아웃 (카메라 뷰 + 텍스트 영역)
  - 상단 헤더 (신뢰도 표시)

- [ ] CameraView 컴포넌트
  - 실시간 비디오 스트림
  - 카메라 권한 요청
  - 에러 처리

- [ ] TextDisplay 컴포넌트
  - 추출된 텍스트 표시
  - 신뢰도 스코어 표시
  - 로딩 상태 표시

- [ ] TTSControls 컴포넌트
  - 재생/일시정지/중지 버튼
  - 속도 조절 (슬라이더)
  - 음량 조절 (슬라이더)
  - 재생 시간 표시

- [ ] 하단 액션 버튼
  - "사진 촬영" 버튼
  - "파일 업로드" 버튼
  - "텍스트 직접 입력" 버튼

- [ ] 모달 컴포넌트
  - 파일 업로드 다이얼로그
  - 텍스트 입력 다이얼로그

- [ ] 통합 테스트
  - 카메라 권한 플로우
  - 텍스트 추출 UI 업데이트
  - TTS 컨트롤 반응성

**산출물:**
- CameraPage.tsx
- CameraView 컴포넌트
- TextDisplay 컴포넌트
- TTSControls 컴포넌트
- 모달 컴포넌트들

**예상 소요 시간:** 5일

---

#### Subtask 3.3: 저장된 책 화면 (4일)

**목표:** 책 목록 및 상세 조회 UI 완성

**작업 항목:**
- [ ] BookListPage.tsx
  - 저장된 책 목록 표시
  - 정렬 옵션 (최근순, 추가순, 제목순)
  - 빈 상태 메시지

- [ ] BookCard 컴포넌트
  - 책 표지 이미지
  - 제목, 저자, 페이지 수
  - 읽어주기, 편집 버튼

- [ ] BookDetailPage.tsx
  - 책 정보 헤더
  - 현재 페이지 표시
  - 페이지 이미지
  - 추출된 텍스트

- [ ] PageSlider 컴포넌트
  - 이전/다음 페이지 버튼
  - 페이지 번호 표시
  - 페이지 변경 시 자동 스크롤

- [ ] 북마크 기능
  - 북마크 토글 버튼
  - 북마크 상태 표시

- [ ] 통합 테스트
  - 책 목록 로딩
  - 페이지 네비게이션
  - 정렬 기능

**산출물:**
- BookListPage.tsx
- BookDetailPage.tsx
- BookCard 컴포넌트
- PageSlider 컴포넌트

**예상 소요 시간:** 4일

---

#### Subtask 3.4: 텍스트 편집 화면 (2일)

**목표:** 텍스트 수정 UI 완성

**작업 항목:**
- [ ] TextEditorPage.tsx
  - 원본 텍스트 표시
  - 수정 가능한 텍스트 에어리어

- [ ] TextEditor 컴포넌트
  - 텍스트 입력 필드
  - 원본으로 복원 버튼
  - 저장/취소 버튼

- [ ] 수정 이력 표시 (선택사항)
  - 이전 버전 목록
  - 버전 복원 기능

- [ ] 저장 확인 알림
  - 저장 성공 메시지
  - TTS 재생 확인

**산출물:**
- TextEditorPage.tsx
- TextEditor 컴포넌트

**예상 소요 시간:** 2일

---

#### Subtask 3.5: 설정 화면 (2일)

**목표:** 사용자 설정 UI 완성

**작업 항목:**
- [ ] SettingsPage.tsx
  - 섹션별 설정 그룹화

- [ ] 언어 설정
  - UI 언어 선택 (드롭다운)
  - TTS 언어 선택 (드롭다운)

- [ ] TTS 설정
  - 음성 선택 (드롭다운)
  - 속도 슬라이더 (0.5x ~ 2.0x)
  - 음량 슬라이더 (0 ~ 100%)
  - 자동 재생 토글

- [ ] 카메라 설정
  - 해상도 선택 (드롭다운)

- [ ] 페이지 감지 설정
  - 민감도 슬라이더
  - 진동 피드백 토글
  - 음향 신호 토글

- [ ] 데이터 관리
  - 저장 공간 표시
  - 캐시 삭제 버튼

- [ ] 정보
  - 앱 버전
  - 피드백 링크
  - 라이센스

**산출물:**
- SettingsPage.tsx

**예상 소요 시간:** 2일

---

### Phase 4: 상태 관리 및 통합 (1주일)

#### 목표
Redux를 사용한 전역 상태 관리 및 모든 컴포넌트-모듈 통합

**작업 항목:**
- [ ] Redux 슬라이스 작성
  - cameraSlice.ts (카메라 상태)
  - bookSlice.ts (책 정보)
  - ttsSlice.ts (TTS 상태)
  - settingsSlice.ts (사용자 설정)

- [ ] 비동기 액션 (createAsyncThunk)
  - 책 로드
  - 페이지 저장
  - 텍스트 수정
  - 설정 저장

- [ ] 모듈-컴포넌트 통합
  - CameraModule을 Redux와 연결
  - OCRModule 콜백 처리
  - TTSModule 상태 동기화
  - StorageModule CRUD 통합

- [ ] 커스텀 훅 작성
  - useCamera()
  - useOCR()
  - useTTS()
  - useBook()
  - useSettings()

- [ ] 에러 처리
  - Redux 에러 상태 관리
  - 토스트 알림 시스템

- [ ] 성능 최적화
  - Selector 메모이제이션
  - 불필요한 리렌더링 방지

- [ ] 통합 테스트
  - Redux 상태 업데이트
  - 비동기 액션 처리
  - 컴포넌트-Redux 연결

**산출물:**
- Redux 설정 완료
- 모든 슬라이스 파일
- 커스텀 훅들
- integration.test.ts

**예상 소요 시간:** 7일

---

### Phase 5: 기능 통합 테스트 (5일)

#### 목표
전체 기능의 엔드-투-엔드 테스트 및 버그 수정

**작업 항목:**
- [ ] 실시간 책 읽기 플로우 테스트
  - 카메라 실행
  - 페이지 감지
  - OCR 실행
  - TTS 재생

- [ ] 수동 페이지 로딩 테스트
  - 사진 촬영
  - 파일 업로드
  - 텍스트 직접 입력

- [ ] 텍스트 수정 및 저장 테스트
  - 페이지 텍스트 편집
  - 저장 확인
  - 수정 이력 확인

- [ ] 책 재생 기능 테스트
  - 책 목록 조회
  - 페이지 네비게이션
  - TTS 자동 재생

- [ ] 설정 기능 테스트
  - 언어 변경
  - TTS 설정 변경
  - 설정 저장 및 복원

- [ ] 에러 처리 테스트
  - 카메라 권한 거부
  - OCR 실패
  - 저장 실패
  - 네트워크 오류

- [ ] 성능 테스트
  - 카메라 응답 시간
  - OCR 처리 시간
  - TTS 로딩 시간

- [ ] 크로스 브라우저 테스트
  - Chrome
  - Safari (iOS)
  - Firefox

- [ ] 버그 수정
  - 발견된 버그 목록화
  - 우선순위별 수정
  - 재테스트

**산출물:**
- 테스트 보고서
- 버그 목록 및 수정 로그
- e2e.test.ts

**예상 소요 시간:** 5일

---

### Phase 6: 최적화 및 배포 준비 (1주일)

#### 목표
성능 최적화 및 프로덕션 배포 준비

**작업 항목:**
- [ ] 성능 최적화
  - 번들 크기 축소 (Tree shaking, Code splitting)
  - Lazy loading (페이지, 컴포넌트)
  - 이미지 최적화 (압축, WebP)
  - 캐싱 전략 설정

- [ ] 메모리 누수 점검
  - Chrome DevTools 프로파일링
  - 메모리 누수 식별 및 수정
  - 이벤트 리스너 정리

- [ ] 보안 감사
  - CORS 설정
  - API 키 관리 (환경 변수)
  - XSS/CSRF 방지
  - HTTPS 설정

- [ ] SEO 최적화 (선택사항)
  - Meta 태그
  - Open Graph 태그
  - robots.txt

- [ ] PWA 설정 (선택사항)
  - manifest.json
  - Service Worker
  - 오프라인 지원

- [ ] 브라우저 호환성 테스트
  - Caniuse 확인
  - Polyfill 추가 (필요시)
  - 구형 브라우저 대응

- [ ] 배포 설정
  - 프로덕션 빌드 설정
  - 환경 변수 설정
  - 배포 스크립트

- [ ] 문서 작성
  - README.md 업데이트
  - 개발자 가이드
  - 사용자 가이드

**산출물:**
- 최적화 완료
- 배포 가능한 프로덕션 빌드
- 배포 문서

**예상 소요 시간:** 7일

---

### Phase 7: 배포 및 모니터링 (진행 중)

#### 목표
테스트 및 프로덕션 배포, 사용자 피드백 수집

**작업 항목:**
- [ ] 배포 환경 준비
  - 호스팅 서비스 선택 (Vercel, Netlify, GitHub Pages 등)
  - CI/CD 파이프라인 설정

- [ ] 테스트 배포
  - Staging 환경 배포
  - QA 테스트
  - 사용자 피드백 수집

- [ ] 버그 수정
  - 발견된 버그 수정
  - 패치 배포

- [ ] 프로덕션 배포
  - 최종 배포
  - 모니터링 활성화

- [ ] 배포 후 모니터링
  - 에러 로깅 (Sentry 등)
  - 성능 모니터링 (Google Analytics)
  - 사용자 피드백

**산출물:**
- 배포된 웹 앱
- 모니터링 대시보드

**예상 소요 시간:** 지속적

---

## 3. 기술 스택 결정

| 카테고리 | 선택 | 이유 |
|---------|------|------|
| **프레임워크** | React 18 + TypeScript | 최신 기술, 타입 안전성, 큰 커뮤니티 |
| **상태 관리** | Redux Toolkit | 복잡한 상태 관리, 개발자 도구, DevTools 지원 |
| **라우팅** | React Router v6 | 표준 라우팅 라이브러리 |
| **OCR** | Tesseract.js | 오프라인 지원, 무료, 한글 지원 |
| **TTS** | Web Speech API | 기본 지원, 비용 무료 |
| **저장소** | IndexedDB | 브라우저 기본, 대용량 저장 (50MB+) |
| **UI 라이브러리** | Tailwind CSS | 빠른 개발, 커스터마이징 용이, 가볍다 |
| **컴포넌트** | Headless UI | Tailwind와 완벽 호환 |
| **빌드 도구** | Vite | 빠른 개발 서버, 빠른 빌드 |
| **테스트** | Vitest + React Testing Library | 최신 테스트 도구, 빠른 실행 |
| **E2E 테스트** | Playwright 또는 Cypress | 크로스 브라우저 테스트 |
| **HTTP 클라이언트** | Axios | API 호출 (클라우드 저장소 사용 시) |
| **로깅/모니터링** | Sentry | 에러 추적 (프로덕션용) |

---

## 4. 일정 추정

| Phase | 작업 | 예상 기간 | 누적 기간 |
|-------|------|----------|---------|
| 1 | 초기 설정 | 1주일 | 1주일 |
| 2.1 | 카메라 모듈 | 5일 | 2주일 |
| 2.2 | OCR 모듈 | 7일 | 3주일 |
| 2.3 | TTS 모듈 | 5일 | 3.5주일 |
| 2.4 | 저장소 모듈 | 3일 | 4주일 |
| 2.5 | 페이지 감지 모듈 | 3일 | 4주일 |
| 3.1 | 기본 레이아웃 | 3일 | 4.5주일 |
| 3.2 | 카메라 화면 | 5일 | 5.5주일 |
| 3.3 | 저장된 책 화면 | 4일 | 6주일 |
| 3.4 | 텍스트 편집 화면 | 2일 | 6.5주일 |
| 3.5 | 설정 화면 | 2일 | 6.5주일 |
| 4 | 상태 관리 통합 | 1주일 | 7.5주일 |
| 5 | 통합 테스트 | 5일 | 8.5주일 |
| 6 | 최적화 배포 준비 | 1주일 | 9.5주일 |
| 7 | 배포 모니터링 | 지속적 | - |
| **총 예상 기간** | | | **약 9.5주일 (2.4개월)** |

---

## 5. 리스크 관리

| 리스크 | 발생 확률 | 영향 | 대응 방안 |
|--------|----------|------|---------|
| OCR 신뢰도 낮음 | 중 | 높음 | 이미지 전처리 개선, Google Vision API 대안 검토 |
| 브라우저 호환성 문제 | 중 | 중 | 조기 호환성 테스트, Polyfill 사용 |
| IndexedDB 용량 부족 | 낮음 | 높음 | 이미지 압축, 클라우드 저장소 통합 |
| TTS 한국어 음성 품질 | 중 | 중 | Google Cloud TTS 대안, 사용자 피드백 수집 |
| 메모리 누수 | 중 | 높음 | 정기적인 성능 모니터링, 메모리 프로파일링 |
| 페이지 감지 오류율 | 중 | 중 | 민감도 튜닝, 머신러닝 모델 고려 |
| 개발 일정 지연 | 낮음 | 중 | 우선순위 재조정, 필수 기능 먼저 완성 |

---

## 6. 사전 요구사항

### 6.1 개발 환경
- Node.js 18+ 설치
- npm 또는 yarn 패키지 매니저
- Git 설치
- 코드 에디터 (VSCode 권장)

### 6.2 계정/서비스
- GitHub 계정 (코드 호스팅)
- 배포 서비스 계정 (Vercel/Netlify 등)
- (선택) Google Cloud 계정 (Vision API, Cloud TTS 사용 시)
- (선택) Firebase 계정 (클라우드 저장소 사용 시)

### 6.3 개발 도구
- Chrome DevTools
- Redux DevTools (확장 프로그램)
- React Developer Tools (확장 프로그램)

---

## 7. 개발 체크리스트

### 커밋 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 스타일 변경 (포매팅 등)
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드/의존성 변경
```

### 코드 리뷰 체크리스트
- [ ] 타입스크립트 타입 정의 완료
- [ ] 테스트 코드 작성
- [ ] 에러 처리 구현
- [ ] 성능 고려
- [ ] 코드 가독성

### 배포 체크리스트
- [ ] 모든 테스트 통과
- [ ] 번들 크기 확인
- [ ] 성능 지표 확인
- [ ] 보안 감사 완료
- [ ] 문서 업데이트
- [ ] 환경 변수 설정

---

이 개발 계획을 따르면 체계적이고 효율적인 개발이 가능합니다.
