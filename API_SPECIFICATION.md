# 동화책 자동 인식 TTS 웹 앱 - API 명세 문서

## 1. CameraModule API

### 1.1 인터페이스 정의

```typescript
interface ICameraModule {
  // 카메라 초기화
  initCamera(constraints?: MediaStreamConstraints): Promise<void>;

  // 현재 프레임을 Canvas로 반환
  captureFrame(): Canvas;

  // 현재 프레임을 Blob(이미지 파일)으로 반환
  captureFrameAsBlob(): Promise<Blob>;

  // 사용 가능한 카메라 장치 목록 조회
  getDevices(): Promise<MediaDeviceInfo[]>;

  // 카메라 전환 (전면 ↔ 후면)
  switchCamera(deviceId?: string): Promise<void>;

  // 카메라 중지
  stopCamera(): void;

  // 비디오 요소 반환 (화면 표시용)
  getVideoElement(): HTMLVideoElement;
}
```

### 1.2 메서드 상세 설명

#### initCamera(constraints?: MediaStreamConstraints): Promise<void>

**설명:** 카메라 초기화 및 비디오 스트림 시작

**파라미터:**
```typescript
constraints?: {
  video?: {
    width?: number | ConstrainULongRange;
    height?: number | ConstrainULongRange;
    facingMode?: 'user' | 'environment' | 'left' | 'right';
  };
  audio?: boolean;
}
```

**반환값:** Promise<void>

**에러:**
- `NotAllowedError`: 사용자가 권한 거부
- `NotFoundError`: 카메라 장치 없음
- `NotReadableError`: 카메라 사용 불가

**사용 예시:**
```typescript
const cameraModule = new CameraModule();
await cameraModule.initCamera({
  video: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'environment'
  }
});
```

---

#### captureFrame(): Canvas

**설명:** 현재 비디오 프레임을 Canvas로 캡처

**파라미터:** 없음

**반환값:** Canvas 객체

**사용 예시:**
```typescript
const frame = cameraModule.captureFrame();
const ctx = frame.getContext('2d');
// Canvas 처리...
```

---

#### captureFrameAsBlob(): Promise<Blob>

**설명:** 현재 비디오 프레임을 이미지 Blob으로 반환

**파라미터:** 없음

**반환값:** Promise<Blob>

**사용 예시:**
```typescript
const imageBlob = await cameraModule.captureFrameAsBlob();
await ocrModule.extractText(imageBlob);
```

---

#### getDevices(): Promise<MediaDeviceInfo[]>

**설명:** 사용 가능한 모든 카메라 장치 목록 조회

**파라미터:** 없음

**반환값:** Promise<MediaDeviceInfo[]>

**반환 타입:**
```typescript
interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
  groupId: string;
}
```

**사용 예시:**
```typescript
const devices = await cameraModule.getDevices();
const videoCameras = devices.filter(d => d.kind === 'videoinput');
```

---

#### switchCamera(deviceId?: string): Promise<void>

**설명:** 카메라 장치 전환

**파라미터:**
- `deviceId?` (string): 전환할 카메라 장치 ID. 생략 시 다음 카메라로 자동 선택

**반환값:** Promise<void>

**사용 예시:**
```typescript
// 다음 카메라로 자동 전환
await cameraModule.switchCamera();

// 특정 카메라로 전환
await cameraModule.switchCamera('device-id-123');
```

---

#### stopCamera(): void

**설명:** 카메라 중지 및 리소스 해제

**파라미터:** 없음

**반환값:** void

**사용 예시:**
```typescript
cameraModule.stopCamera();
```

---

#### getVideoElement(): HTMLVideoElement

**설명:** 카메라 비디오를 표시하는 HTML video 요소 반환

**파라미터:** 없음

**반환값:** HTMLVideoElement

**사용 예시:**
```typescript
const videoEl = cameraModule.getVideoElement();
document.getElementById('camera-container').appendChild(videoEl);
```

---

## 2. OCRModule API

### 2.1 인터페이스 정의

```typescript
interface IOCRModule {
  // 이미지에서 텍스트 추출
  extractText(image: Blob | Canvas): Promise<{
    text: string;
    confidence: number;
    rawResult: Tesseract.RecognizeResult;
  }>;

  // 이미지 전처리
  preprocessImage(image: Blob): Promise<Canvas>;

  // 페이지 변경 감지
  detectPageChange(currentFrame: Canvas, previousFrame?: Canvas): boolean;

  // 프레임 간 차이도 계산 (0-100)
  calculateFrameDifference(frame1: Canvas, frame2: Canvas): number;

  // 페이지 감지 민감도 설정 (0-100)
  setSensitivity(sensitivity: number): void;

  // Worker 초기화 (병렬 처리)
  initWorker(): Promise<void>;

  // Worker 종료
  terminateWorker(): void;
}
```

### 2.2 메서드 상세 설명

#### extractText(image: Blob | Canvas): Promise<{text, confidence, rawResult}>

**설명:** 이미지에서 텍스트 추출

**파라미터:**
- `image` (Blob | Canvas): 입력 이미지

**반환값:**
```typescript
Promise<{
  text: string;              // 추출된 텍스트
  confidence: number;        // 신뢰도 (0-100)
  rawResult: Tesseract.RecognizeResult;  // 원본 Tesseract 결과
}>
```

**에러:**
- Error: OCR 처리 실패

**사용 예시:**
```typescript
const imageBlob = await cameraModule.captureFrameAsBlob();
const result = await ocrModule.extractText(imageBlob);

console.log(`텍스트: ${result.text}`);
console.log(`신뢰도: ${result.confidence}%`);

if (result.confidence >= 60) {
  // 신뢰도 충분, 저장 진행
  await storageModule.savePage({
    pageId: uuid(),
    bookId: currentBookId,
    pageNumber: currentPageNumber,
    originalText: result.text,
    ocrConfidence: result.confidence,
    // ... 다른 필드
  });
}
```

---

#### preprocessImage(image: Blob): Promise<Canvas>

**설명:** 이미지 전처리 (명암 조정, 기울기 보정 등)

**파라미터:**
- `image` (Blob): 입력 이미지

**반환값:** Promise<Canvas>

**전처리 단계:**
1. 이미지 로드
2. 명암 조정 (Contrast Enhancement)
3. 기울기 보정 (Skew Correction)
4. 이진화 (Binarization)
5. 잡음 제거 (Denoising)

**사용 예시:**
```typescript
const processedCanvas = await ocrModule.preprocessImage(imageBlob);
// processedCanvas를 다시 extractText에 전달 가능
```

---

#### detectPageChange(currentFrame: Canvas, previousFrame?: Canvas): boolean

**설명:** 페이지 변경 감지

**파라미터:**
- `currentFrame` (Canvas): 현재 프레임
- `previousFrame?` (Canvas): 이전 프레임 (생략 시 내부 저장된 프레임 사용)

**반환값:** boolean (페이지 변경 여부)

**동작:**
1. 현재 프레임 해시값 계산
2. 이전 프레임과의 차이도 계산
3. 임계값 비교 (기본값: 30%)
4. 변경 감지 시 true 반환 및 내부 상태 업데이트

**사용 예시:**
```typescript
const currentFrame = cameraModule.captureFrame();
const hasChanged = ocrModule.detectPageChange(currentFrame);

if (hasChanged) {
  console.log('페이지가 변경되었습니다!');
  // OCR 실행 등의 처리
}
```

---

#### calculateFrameDifference(frame1: Canvas, frame2: Canvas): number

**설명:** 두 프레임 간의 차이도 계산

**파라미터:**
- `frame1` (Canvas): 첫 번째 프레임
- `frame2` (Canvas): 두 번째 프레임

**반환값:** number (차이도, 0-100)

**알고리즘:** 해밍 거리 (Hamming Distance) 기반 퍼셉션 해싱

**사용 예시:**
```typescript
const frame1 = cameraModule.captureFrame();
// ... 시간 경과 ...
const frame2 = cameraModule.captureFrame();

const difference = ocrModule.calculateFrameDifference(frame1, frame2);
console.log(`차이도: ${difference}%`);
```

---

#### setSensitivity(sensitivity: number): void

**설명:** 페이지 감지 민감도 설정

**파라미터:**
- `sensitivity` (number): 민감도 (0-100)
  - 낮음 (0-33): 큰 변화만 감지
  - 중간 (34-66): 표준 감지
  - 높음 (67-100): 작은 변화도 감지

**반환값:** void

**기본값:** 50 (중간)

**사용 예시:**
```typescript
// 민감도를 높음으로 설정
ocrModule.setSensitivity(75);
```

---

#### initWorker(): Promise<void>

**설명:** Tesseract Worker 초기화 (병렬 처리 지원)

**파라미터:** 없음

**반환값:** Promise<void>

**주의:** OCR 처리 전 반드시 호출 필요

**사용 예시:**
```typescript
const ocrModule = new OCRModule();
await ocrModule.initWorker();
// 이제 extractText 사용 가능
```

---

#### terminateWorker(): void

**설명:** Tesseract Worker 종료 및 리소스 해제

**파라미터:** 없음

**반환값:** void

**사용 예시:**
```typescript
// 앱 종료 시 호출
ocrModule.terminateWorker();
```

---

## 3. TTSModule API

### 3.1 인터페이스 정의

```typescript
interface ITTSModule {
  // 텍스트 음성 재생
  speak(text: string, options?: TTSOptions): Promise<void>;

  // 음성 재생 일시정지
  pause(): void;

  // 일시정지된 음성 재개
  resume(): void;

  // 음성 재생 중지
  stop(): void;

  // 재생 속도 설정 (0.5-2.0)
  setSpeed(speed: number): void;

  // 음량 설정 (0-100)
  setVolume(volume: number): void;

  // 음성 선택
  setVoice(voice: SpeechSynthesisVoice): void;

  // 사용 가능한 음성 목록 조회
  getAvailableVoices(): SpeechSynthesisVoice[];

  // 재생 상태 확인
  isPlaying(): boolean;

  // 현재 설정 조회
  getCurrentSettings(): TTSSettings;
}

interface TTSOptions {
  speed?: number;           // 0.5-2.0
  volume?: number;          // 0-100
  voice?: SpeechSynthesisVoice;
  pitch?: number;           // 0.5-2.0
}

interface TTSSettings {
  speed: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  pitch: number;
  isPlaying: boolean;
}
```

### 3.2 메서드 상세 설명

#### speak(text: string, options?: TTSOptions): Promise<void>

**설명:** 텍스트를 음성으로 재생

**파라미터:**
- `text` (string): 재생할 텍스트
- `options?` (TTSOptions): 선택 옵션

**반환값:** Promise<void>

**동작:**
1. 현재 재생 중인 음성 중지
2. 옵션 적용
3. SpeechSynthesisUtterance 생성
4. 음성 재생 시작

**에러:**
- 브라우저 미지원: Error

**사용 예시:**
```typescript
const ttsModule = new TTSModule();

// 기본 재생
await ttsModule.speak("옛날 옛날에 호랑이가 살고 있었습니다.");

// 옵션과 함께 재생
await ttsModule.speak("이 텍스트는 빠르게 재생됩니다.", {
  speed: 1.5,
  volume: 80,
  pitch: 1.2
});
```

---

#### pause(): void

**설명:** 현재 재생 중인 음성 일시정지

**파라미터:** 없음

**반환값:** void

**사용 예시:**
```typescript
ttsModule.pause();
```

---

#### resume(): void

**설명:** 일시정지된 음성 재개

**파라미터:** 없음

**반환값:** void

**사용 예시:**
```typescript
ttsModule.resume();
```

---

#### stop(): void

**설명:** 음성 재생 중지

**파라미터:** 없음

**반환값:** void

**사용 예시:**
```typescript
ttsModule.stop();
```

---

#### setSpeed(speed: number): void

**설명:** 음성 재생 속도 설정

**파라미터:**
- `speed` (number): 재생 속도 (0.5 ~ 2.0)
  - 0.5: 매우 느림
  - 1.0: 기본 속도 (기본값)
  - 1.5: 빠름
  - 2.0: 매우 빠름

**반환값:** void

**에러:** RangeError (범위 벗어남)

**사용 예시:**
```typescript
ttsModule.setSpeed(1.2);
```

---

#### setVolume(volume: number): void

**설명:** 음성 음량 설정

**파라미터:**
- `volume` (number): 음량 (0 ~ 100)
  - 0: 음소거
  - 50: 중간 음량
  - 100: 최대 음량 (기본값)

**반환값:** void

**에러:** RangeError (범위 벗어남)

**사용 예시:**
```typescript
ttsModule.setVolume(75);
```

---

#### setVoice(voice: SpeechSynthesisVoice): void

**설명:** 음성 선택

**파라미터:**
- `voice` (SpeechSynthesisVoice): 선택할 음성

**반환값:** void

**사용 예시:**
```typescript
const voices = ttsModule.getAvailableVoices();
const femaleVoice = voices.find(v => v.name.includes('Female'));
if (femaleVoice) {
  ttsModule.setVoice(femaleVoice);
}
```

---

#### getAvailableVoices(): SpeechSynthesisVoice[]

**설명:** 사용 가능한 음성 목록 조회

**파라미터:** 없음

**반환값:** SpeechSynthesisVoice[]

**반환 타입:**
```typescript
interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}
```

**사용 예시:**
```typescript
const voices = ttsModule.getAvailableVoices();
voices.forEach(voice => {
  console.log(`${voice.name} (${voice.lang})`);
});

// 한국어 음성만 필터링
const koreanVoices = voices.filter(v => v.lang.startsWith('ko'));
```

---

#### isPlaying(): boolean

**설명:** 현재 음성 재생 상태 확인

**파라미터:** 없음

**반환값:** boolean (재생 중 여부)

**사용 예시:**
```typescript
if (ttsModule.isPlaying()) {
  console.log("음성이 재생 중입니다.");
}
```

---

#### getCurrentSettings(): TTSSettings

**설명:** 현재 TTS 설정 조회

**파라미터:** 없음

**반환값:** TTSSettings

**사용 예시:**
```typescript
const settings = ttsModule.getCurrentSettings();
console.log(`속도: ${settings.speed}x`);
console.log(`음량: ${settings.volume}%`);
console.log(`음성: ${settings.voice?.name}`);
```

---

## 4. StorageModule API

### 4.1 인터페이스 정의

```typescript
interface IStorageModule {
  // 데이터베이스 초기화
  initDB(): Promise<void>;

  // 책 저장
  saveBook(book: Book): Promise<string>;

  // 책 조회
  getBook(bookId: string): Promise<Book | undefined>;

  // 모든 책 조회
  getAllBooks(sortBy?: 'createdAt' | 'updatedAt' | 'title'): Promise<Book[]>;

  // 책 삭제
  deleteBook(bookId: string): Promise<void>;

  // 페이지 저장
  savePage(page: Page): Promise<string>;

  // 특정 책의 모든 페이지 조회
  getPagesByBook(bookId: string): Promise<Page[]>;

  // 페이지 조회
  getPage(pageId: string): Promise<Page | undefined>;

  // 페이지 텍스트 수정
  updatePageText(pageId: string, editedText: string): Promise<void>;

  // 페이지 삭제
  deletePage(pageId: string): Promise<void>;

  // 사용자 설정 저장
  saveUserPreferences(prefs: UserPreferences): Promise<void>;

  // 사용자 설정 조회
  getUserPreferences(): Promise<UserPreferences | undefined>;

  // 데이터베이스 용량 조회
  getDBSize(): Promise<{ used: number; quota: number }>;

  // 캐시 삭제
  clearCache(): Promise<void>;

  // 데이터베이스 삭제 (초기화)
  resetDB(): Promise<void>;
}
```

### 4.2 메서드 상세 설명

#### initDB(): Promise<void>

**설명:** IndexedDB 데이터베이스 초기화

**파라미터:** 없음

**반환값:** Promise<void>

**사용 예시:**
```typescript
const storageModule = new StorageModule();
await storageModule.initDB();
// 이제 다른 메서드 사용 가능
```

---

#### saveBook(book: Book): Promise<string>

**설명:** 책 정보 저장

**파라미터:**
```typescript
interface Book {
  bookId: string;
  title: string;
  author: string;
  publisher?: string;
  coverImage: Blob;
  totalPages: number;
  createdAt?: number;
  updatedAt?: number;
  pages: string[];  // pageId 배열
}
```

**반환값:** Promise<string> (bookId)

**사용 예시:**
```typescript
const bookId = await storageModule.saveBook({
  bookId: '123-456-789',
  title: '신데렐라',
  author: '동화 작가',
  publisher: '출판사',
  coverImage: coverBlob,
  totalPages: 254,
  pages: []
});

console.log(`책이 저장되었습니다: ${bookId}`);
```

---

#### getBook(bookId: string): Promise<Book | undefined>

**설명:** 책 조회

**파라미터:**
- `bookId` (string): 책의 ID

**반환값:** Promise<Book | undefined>

**사용 예시:**
```typescript
const book = await storageModule.getBook('123-456-789');
if (book) {
  console.log(`책 제목: ${book.title}`);
} else {
  console.log('책을 찾을 수 없습니다.');
}
```

---

#### getAllBooks(sortBy?: string): Promise<Book[]>

**설명:** 모든 책 조회

**파라미터:**
- `sortBy?` ('createdAt' | 'updatedAt' | 'title'): 정렬 기준 (기본값: updatedAt 역순)

**반환값:** Promise<Book[]>

**사용 예시:**
```typescript
// 최근 수정순으로 조회
const books = await storageModule.getAllBooks('updatedAt');

// 모든 책 표시
books.forEach(book => {
  console.log(`${book.title} - ${book.author}`);
});
```

---

#### deleteBook(bookId: string): Promise<void>

**설명:** 책 삭제 (연관된 페이지도 함께 삭제)

**파라미터:**
- `bookId` (string): 책의 ID

**반환값:** Promise<void>

**사용 예시:**
```typescript
await storageModule.deleteBook('123-456-789');
```

---

#### savePage(page: Page): Promise<string>

**설명:** 페이지 저장

**파라미터:**
```typescript
interface Page {
  pageId: string;
  bookId: string;
  pageNumber: number;
  originalImage: Blob;
  thumbnailImage: Blob;
  originalText: string;
  editedText?: string;
  ocrConfidence: number;
  createdAt?: number;
  editedAt?: number;
  editHistory?: EditHistoryItem[];
}
```

**반환값:** Promise<string> (pageId)

**사용 예시:**
```typescript
const pageId = await storageModule.savePage({
  pageId: 'page-001',
  bookId: '123-456-789',
  pageNumber: 1,
  originalImage: imageBlob,
  thumbnailImage: thumbBlob,
  originalText: '옛날 옛날에...',
  ocrConfidence: 85,
  editedText: '옛날 옛날에...'
});
```

---

#### getPagesByBook(bookId: string): Promise<Page[]>

**설명:** 특정 책의 모든 페이지 조회 (페이지 번호 순)

**파라미터:**
- `bookId` (string): 책의 ID

**반환값:** Promise<Page[]> (페이지 번호로 정렬됨)

**사용 예시:**
```typescript
const pages = await storageModule.getPagesByBook('123-456-789');
console.log(`총 ${pages.length}개 페이지`);

pages.forEach((page, index) => {
  console.log(`페이지 ${page.pageNumber}: ${page.originalText.substring(0, 50)}...`);
});
```

---

#### getPage(pageId: string): Promise<Page | undefined>

**설명:** 페이지 조회

**파라미터:**
- `pageId` (string): 페이지의 ID

**반환값:** Promise<Page | undefined>

**사용 예시:**
```typescript
const page = await storageModule.getPage('page-001');
if (page) {
  console.log(`${page.pageNumber}번 페이지: ${page.originalText}`);
}
```

---

#### updatePageText(pageId: string, editedText: string): Promise<void>

**설명:** 페이지 텍스트 수정

**파라미터:**
- `pageId` (string): 페이지의 ID
- `editedText` (string): 수정할 텍스트

**반환값:** Promise<void>

**동작:**
1. 기존 텍스트를 수정 이력에 저장
2. 새로운 텍스트로 업데이트
3. 최근 5개 이력만 유지

**사용 예시:**
```typescript
await storageModule.updatePageText('page-001', '수정된 텍스트...');
```

---

#### deletePage(pageId: string): Promise<void>

**설명:** 페이지 삭제

**파라미터:**
- `pageId` (string): 페이지의 ID

**반환값:** Promise<void>

**사용 예시:**
```typescript
await storageModule.deletePage('page-001');
```

---

#### saveUserPreferences(prefs: UserPreferences): Promise<void>

**설명:** 사용자 설정 저장

**파라미터:**
```typescript
interface UserPreferences {
  userId: string;
  uiLanguage: 'ko' | 'en';
  ttsLanguage: 'ko' | 'en';
  ttsVoice: string;
  ttsSpeed: number;
  ttsVolume: number;
  ttsAutoPlay: boolean;
  cameraResolution: '1080p' | '720p' | '480p';
  pageSensitivity: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  lastReadBook?: string;
  lastReadPage?: number;
}
```

**반환값:** Promise<void>

**사용 예시:**
```typescript
await storageModule.saveUserPreferences({
  userId: 'default',
  uiLanguage: 'ko',
  ttsLanguage: 'ko',
  ttsVoice: 'female-1',
  ttsSpeed: 1.0,
  ttsVolume: 80,
  ttsAutoPlay: true,
  cameraResolution: '1080p',
  pageSensitivity: 50,
  vibrationEnabled: true,
  soundEnabled: true
});
```

---

#### getUserPreferences(): Promise<UserPreferences | undefined>

**설명:** 사용자 설정 조회

**파라미터:** 없음

**반환값:** Promise<UserPreferences | undefined>

**사용 예시:**
```typescript
const prefs = await storageModule.getUserPreferences();
if (prefs) {
  console.log(`UI 언어: ${prefs.uiLanguage}`);
  console.log(`TTS 속도: ${prefs.ttsSpeed}x`);
}
```

---

#### getDBSize(): Promise<{ used: number; quota: number }>

**설명:** 데이터베이스 저장 용량 조회

**파라미터:** 없음

**반환값:** Promise<{ used: number; quota: number }> (바이트 단위)

**사용 예시:**
```typescript
const size = await storageModule.getDBSize();
console.log(`사용: ${(size.used / 1024 / 1024).toFixed(2)}MB`);
console.log(`할당: ${(size.quota / 1024 / 1024).toFixed(2)}MB`);
```

---

#### clearCache(): Promise<void>

**설명:** 캐시 및 임시 데이터 삭제

**파라미터:** 없음

**반환값:** Promise<void>

**사용 예시:**
```typescript
await storageModule.clearCache();
```

---

#### resetDB(): Promise<void>

**설명:** 전체 데이터베이스 초기화 (주의: 데이터 손실)

**파라미터:** 없음

**반환값:** Promise<void>

**사용 예시:**
```typescript
// 사용자 확인 후 실행
if (confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
  await storageModule.resetDB();
}
```

---

## 5. PageDetectionModule API

### 5.1 인터페이스 정의

```typescript
interface IPageDetectionModule {
  // 페이지 감지 모니터링 시작
  startMonitoring(
    frameProvider: () => Canvas,
    sensitivity: number,
    interval?: number
  ): void;

  // 페이지 감지 모니터링 중지
  stopMonitoring(): void;

  // 페이지 변경 이벤트 리스너 등록
  onPageChange(callback: (newFrame: Canvas) => void): void;

  // 민감도 설정 (0-100)
  setSensitivity(sensitivity: number): void;

  // 현재 민감도 조회
  getSensitivity(): number;

  // 모니터링 상태 확인
  isMonitoring(): boolean;
}
```

### 5.2 메서드 상세 설명

#### startMonitoring(frameProvider, sensitivity, interval?): void

**설명:** 페이지 감지 모니터링 시작

**파라미터:**
- `frameProvider` (() => Canvas): 프레임을 제공하는 콜백 함수
- `sensitivity` (number): 민감도 (0-100)
- `interval?` (number): 체크 간격 (ms, 기본값: 100)

**반환값:** void

**사용 예시:**
```typescript
const pageDetection = new PageDetectionModule();

pageDetection.startMonitoring(
  () => cameraModule.captureFrame(),  // frameProvider
  75,                                  // sensitivity
  100                                  // interval (ms)
);
```

---

#### stopMonitoring(): void

**설명:** 페이지 감지 모니터링 중지

**파라미터:** 없음

**반환값:** void

**사용 예시:**
```typescript
pageDetection.stopMonitoring();
```

---

#### onPageChange(callback): void

**설명:** 페이지 변경 이벤트 리스너 등록

**파라미터:**
- `callback` ((newFrame: Canvas) => void): 페이지 변경 시 호출되는 콜백

**반환값:** void

**사용 예시:**
```typescript
pageDetection.onPageChange(async (newFrame) => {
  console.log('페이지가 변경되었습니다!');

  // OCR 실행
  const result = await ocrModule.extractText(newFrame);
  console.log(`추출된 텍스트: ${result.text}`);

  // 저장 및 TTS 재생...
});
```

---

#### setSensitivity(sensitivity: number): void

**설명:** 민감도 설정

**파라미터:**
- `sensitivity` (number): 민감도 (0-100)

**반환값:** void

**사용 예시:**
```typescript
pageDetection.setSensitivity(80);  // 민감도 증가
```

---

#### getSensitivity(): number

**설명:** 현재 민감도 조회

**파라미터:** 없음

**반환값:** number (0-100)

**사용 예시:**
```typescript
const currentSensitivity = pageDetection.getSensitivity();
console.log(`현재 민감도: ${currentSensitivity}`);
```

---

#### isMonitoring(): boolean

**설명:** 모니터링 상태 확인

**파라미터:** 없음

**반환값:** boolean (모니터링 중 여부)

**사용 예시:**
```typescript
if (pageDetection.isMonitoring()) {
  console.log('페이지 감지 모니터링 중입니다.');
} else {
  console.log('모니터링이 중지되었습니다.');
}
```

---

## 6. 통합 사용 예시

### 6.1 실시간 책 읽기 플로우

```typescript
async function startReadingBook() {
  // 모듈 초기화
  const cameraModule = new CameraModule();
  const ocrModule = new OCRModule();
  const ttsModule = new TTSModule();
  const storageModule = new StorageModule();
  const pageDetection = new PageDetectionModule();

  await cameraModule.initCamera();
  await ocrModule.initWorker();
  await storageModule.initDB();

  // 책 생성
  const bookId = await storageModule.saveBook({
    bookId: uuid(),
    title: '신데렐라',
    author: '동화 작가',
    coverImage: coverBlob,
    totalPages: 254,
    pages: []
  });

  // 페이지 변경 감지 시작
  let pageNumber = 1;

  pageDetection.onPageChange(async (newFrame) => {
    console.log(`페이지 ${pageNumber} 감지됨`);

    // OCR 실행
    const result = await ocrModule.extractText(newFrame);

    if (result.confidence >= 60) {
      // 페이지 저장
      const pageId = await storageModule.savePage({
        pageId: uuid(),
        bookId: bookId,
        pageNumber: pageNumber,
        originalImage: await cameraModule.captureFrameAsBlob(),
        thumbnailImage: thumbBlob,
        originalText: result.text,
        ocrConfidence: result.confidence
      });

      // TTS 재생
      await ttsModule.speak(result.text);

      pageNumber++;
    }
  });

  pageDetection.startMonitoring(
    () => cameraModule.captureFrame(),
    75,
    100
  );
}
```

---

이 API 명세서는 모든 모듈의 사용 방법을 상세히 설명하고 있습니다.
