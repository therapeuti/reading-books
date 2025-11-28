# 동화책 자동 인식 TTS 웹 앱 - 설계 문서

## 1. 고수준 설계 (HLD: High-Level Design)

### 1.1 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                       사용자 (브라우저)                          │
│                     (iOS/Android 모바일)                         │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    프론트엔드 (React.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              UI 레이어 (컴포넌트)                        │  │
│  │  ┌─────────────┬──────────────┬────────────┬──────────┐  │  │
│  │  │ 카메라 뷰   │ 텍스트 에디터 │ 플레이어   │ 책 목록  │  │  │
│  │  └─────────────┴──────────────┴────────────┴──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          비즈니스 로직 레이어 (모듈/서비스)              │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ CameraModule │ OCRModule │ TTSModule │ StorageModule  │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         상태 관리 레이어 (Redux/Zustand)                │  │
│  │        (카메라 상태, 책 정보, 설정 등)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────┬────────────────────┬──────────────┘
           │                  │                    │
           ▼                  ▼                    ▼
    ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
    │  IndexedDB  │   │   Tesseract  │   │  Web Speech  │
    │  (로컬)      │   │    API (OCR) │   │   API (TTS)  │
    └─────────────┘   └──────────────┘   └──────────────┘
           │                  │                    │
           └──────────────────┴────────────────────┘
                              │
                    (선택사항) ▼
                   ┌──────────────────┐
                   │ Firebase/Supabase│
                   │   (클라우드)      │
                   └──────────────────┘
```

### 1.2 핵심 모듈 설명

#### 1.2.1 카메라 모듈 (CameraModule)
**책임:**
- getUserMedia API를 통한 카메라 접근 및 권한 관리
- 실시간 비디오 스트림 제공
- 수동 사진 캡처
- 카메라 전환 (전면/후면)

**주요 메서드:**
```
- initCamera(constraints) → Promise<void>
- captureFrame() → Canvas
- switchCamera() → void
- stopCamera() → void
```

#### 1.2.2 OCR 모듈 (OCRModule)
**책임:**
- Tesseract.js를 사용한 텍스트 추출
- 이미지 전처리 (명암, 기울기 보정)
- OCR 신뢰도 점수 계산
- 프레임 차이 분석을 통한 페이지 변경 감지

**주요 메서드:**
```
- extractText(image) → Promise<{text, confidence}>
- preprocessImage(image) → Canvas
- detectPageChange(currentFrame, previousFrame) → boolean
- calculateFrameDifference(frame1, frame2) → number (0-100)
```

#### 1.2.3 TTS 모듈 (TTSModule)
**책임:**
- Web Speech API 또는 Google Cloud TTS를 사용한 음성 합성
- 음성 재생, 일시정지, 중지 제어
- 속도 및 음량 조절
- 음성 캐싱

**주요 메서드:**
```
- speak(text, options) → Promise<void>
- pause() → void
- resume() → void
- stop() → void
- setSpeed(speed: 0.5-2.0) → void
- setVolume(volume: 0-100) → void
```

#### 1.2.4 저장소 모듈 (StorageModule)
**책임:**
- IndexedDB를 통한 로컬 데이터 저장/조회
- 책 및 페이지 정보 CRUD
- 사용자 설정 저장

**주요 메서드:**
```
- saveBook(book) → Promise<string> (bookId)
- getBook(bookId) → Promise<Book>
- getAllBooks() → Promise<Book[]>
- savePage(page) → Promise<string> (pageId)
- updatePageText(pageId, text) → Promise<void>
- saveUserPreferences(preferences) → Promise<void>
- getUserPreferences() → Promise<UserPreferences>
```

#### 1.2.5 페이지 감지 모듈 (PageDetectionModule)
**책임:**
- 연속 프레임 분석
- 페이지 변경 임계값 설정 및 관리
- 페이지 변경 알림 발송

**주요 메서드:**
```
- startMonitoring(sensitivity) → void
- stopMonitoring() → void
- onPageChange(callback) → void
```

### 1.3 데이터 흐름

```
카메라 영상 입력
         │
         ▼
┌──────────────────────┐
│ 프레임 캡처          │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ 페이지 변경 감지?     │───NO─→ 계속 모니터링
└──────────────────────┘
         │ YES
         ▼
┌──────────────────────┐
│ 이미지 저장 및       │
│ 사진으로 변환        │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ OCR 신뢰도 점수 확인│
└──────────────────────┘
         │
         ├─ 신뢰도 < 60% ──→ 수동 재캡처 대기
         │
         └─ 신뢰도 ≥ 60%
                  │
                  ▼
         ┌──────────────────────┐
         │ 텍스트 추출          │
         └──────────────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ IndexedDB에 저장     │
         └──────────────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ TTS 자동 재생        │
         │ (설정 활성화 시)     │
         └──────────────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ 사용자 대기          │
         │ (음성 재생 중)       │
         └──────────────────────┘
```

---

## 2. 상세 설계 (LLD: Low-Level Design)

### 2.1 주요 컴포넌트 상세 구조

#### 2.1.1 CameraModule 상세 설계

```typescript
class CameraModule {
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement;
  private canvasContext: CanvasRenderingContext2D;
  private devices: MediaDeviceInfo[] = [];
  private currentDeviceId: string | null = null;

  async initCamera(constraints: MediaStreamConstraints): Promise<void> {
    // 1. 사용 가능한 카메라 목록 조회
    // 2. 후면 카메라 기본 선택
    // 3. getUserMedia 호출
    // 4. video 태그에 스트림 바인딩
  }

  captureFrame(): Canvas {
    // 1. 현재 비디오 프레임을 캔버스에 그리기
    // 2. 이미지 품질 최적화 (해상도, 압축)
    // 3. Blob으로 변환 후 반환
  }

  async switchCamera(): Promise<void> {
    // 1. 다음 카메라 선택
    // 2. 현재 스트림 중지
    // 3. 새 카메라로 initCamera 호출
  }

  stopCamera(): void {
    // 1. MediaStream 트랙 중지
    // 2. 리소스 정리
  }
}
```

#### 2.1.2 OCRModule 상세 설계

```typescript
class OCRModule {
  private worker: Tesseract.Worker;
  private previousFrameHash: string | null = null;
  private frameDifferenceThreshold: number = 30; // %

  async extractText(image: Blob): Promise<{
    text: string;
    confidence: number;
  }> {
    // 1. 이미지 전처리
    const preprocessed = this.preprocessImage(image);

    // 2. Tesseract OCR 실행
    const result = await this.worker.recognize(preprocessed);

    // 3. 신뢰도 점수 계산
    const confidence = this.calculateConfidence(result);

    // 4. 결과 반환
    return { text: result.data.text, confidence };
  }

  preprocessImage(image: Blob): Canvas {
    // 1. 이미지 로드
    // 2. 명암 조정 (contrast enhancement)
    // 3. 기울기 보정 (skew correction)
    // 4. 이진화 (binarization)
    // 5. 잡음 제거 (denoising)
    // 6. 캔버스로 반환
  }

  detectPageChange(currentFrame: Canvas, previousFrame: Canvas): boolean {
    // 1. 현재 프레임 해시값 계산
    const currentHash = this.computeHash(currentFrame);

    // 2. 이전 프레임 해시값과 비교
    if (!this.previousFrameHash) {
      this.previousFrameHash = currentHash;
      return false;
    }

    // 3. 차이도 계산
    const difference = this.calculateFrameDifference(
      this.previousFrameHash,
      currentHash
    );

    // 4. 임계값 비교
    const hasChanged = difference > this.frameDifferenceThreshold;

    if (hasChanged) {
      this.previousFrameHash = currentHash;
    }

    return hasChanged;
  }

  private calculateFrameDifference(
    hash1: string,
    hash2: string
  ): number {
    // Hamming distance를 사용한 차이도 계산
    // 반환값: 0-100 (%)
  }

  private computeHash(canvas: Canvas): string {
    // 퍼셉션 해싱(Perceptual Hash) 또는 평균 해싱 사용
  }

  private calculateConfidence(result: Tesseract.RecognizeResult): number {
    // Tesseract 신뢰도 점수 기반 계산
    // 0-100 범위의 신뢰도 반환
  }
}
```

#### 2.1.3 TTSModule 상세 설계

```typescript
class TTSModule {
  private synth: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentSpeed: number = 1.0;
  private currentVolume: number = 1.0;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isPlaying: boolean = false;
  private cache: Map<string, Blob> = new Map();

  async speak(text: string, options?: {
    speed?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }): Promise<void> {
    // 1. 이전 재생 중지
    this.stop();

    // 2. 옵션 적용
    if (options?.speed) this.currentSpeed = options.speed;
    if (options?.volume) this.currentVolume = options.volume;
    if (options?.voice) this.currentVoice = options.voice;

    // 3. SpeechSynthesisUtterance 생성
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = this.currentSpeed;
    this.utterance.volume = this.currentVolume;
    this.utterance.voice = this.currentVoice;
    this.utterance.lang = 'ko-KR';

    // 4. 이벤트 리스너 등록
    this.utterance.onstart = () => {
      this.isPlaying = true;
    };
    this.utterance.onend = () => {
      this.isPlaying = false;
    };

    // 5. 재생 시작
    this.synth.speak(this.utterance);
  }

  pause(): void {
    this.synth.pause();
    this.isPlaying = false;
  }

  resume(): void {
    this.synth.resume();
    this.isPlaying = true;
  }

  stop(): void {
    this.synth.cancel();
    this.utterance = null;
    this.isPlaying = false;
  }

  setSpeed(speed: number): void {
    if (speed < 0.5 || speed > 2.0) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
    this.currentSpeed = speed;
    if (this.utterance) {
      this.utterance.rate = speed;
    }
  }

  setVolume(volume: number): void {
    if (volume < 0 || volume > 100) {
      throw new Error('Volume must be between 0 and 100');
    }
    this.currentVolume = volume / 100;
    if (this.utterance) {
      this.utterance.volume = this.currentVolume;
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices()
      .filter(voice => voice.lang.startsWith('ko'));
  }
}
```

#### 2.1.4 StorageModule 상세 설계

```typescript
class StorageModule {
  private db: IDBDatabase;
  private objectStores = {
    books: 'books',
    pages: 'pages',
    preferences: 'preferences'
  };

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookReaderDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // books store
        if (!db.objectStoreNames.contains(this.objectStores.books)) {
          const booksStore = db.createObjectStore(
            this.objectStores.books,
            { keyPath: 'bookId' }
          );
          booksStore.createIndex('createdAt', 'createdAt', { unique: false });
          booksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // pages store
        if (!db.objectStoreNames.contains(this.objectStores.pages)) {
          const pagesStore = db.createObjectStore(
            this.objectStores.pages,
            { keyPath: 'pageId' }
          );
          pagesStore.createIndex('bookId', 'bookId', { unique: false });
          pagesStore.createIndex('pageNumber', 'pageNumber', { unique: false });
        }

        // preferences store
        if (!db.objectStoreNames.contains(this.objectStores.preferences)) {
          db.createObjectStore(this.objectStores.preferences, { keyPath: 'userId' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async saveBook(book: Book): Promise<string> {
    const transaction = this.db.transaction([this.objectStores.books], 'readwrite');
    const store = transaction.objectStore(this.objectStores.books);

    const bookWithTimestamp = {
      ...book,
      createdAt: book.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(bookWithTimestamp);
      request.onsuccess = () => resolve(book.bookId);
      request.onerror = () => reject(request.error);
    });
  }

  async savePage(page: Page): Promise<string> {
    const transaction = this.db.transaction([this.objectStores.pages], 'readwrite');
    const store = transaction.objectStore(this.objectStores.pages);

    const pageWithTimestamp = {
      ...page,
      createdAt: page.createdAt || Date.now(),
      editedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(pageWithTimestamp);
      request.onsuccess = () => resolve(page.pageId);
      request.onerror = () => reject(request.error);
    });
  }

  async getBook(bookId: string): Promise<Book | undefined> {
    const transaction = this.db.transaction([this.objectStores.books], 'readonly');
    const store = transaction.objectStore(this.objectStores.books);

    return new Promise((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBooks(): Promise<Book[]> {
    const transaction = this.db.transaction([this.objectStores.books], 'readonly');
    const store = transaction.objectStore(this.objectStores.books);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPagesByBook(bookId: string): Promise<Page[]> {
    const transaction = this.db.transaction([this.objectStores.pages], 'readonly');
    const store = transaction.objectStore(this.objectStores.pages);
    const index = store.index('bookId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(bookId);
      request.onsuccess = () => {
        // pageNumber로 정렬
        resolve(request.result.sort((a, b) => a.pageNumber - b.pageNumber));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updatePageText(pageId: string, editedText: string): Promise<void> {
    const transaction = this.db.transaction([this.objectStores.pages], 'readwrite');
    const store = transaction.objectStore(this.objectStores.pages);

    return new Promise(async (resolve, reject) => {
      const getRequest = store.get(pageId);

      getRequest.onsuccess = () => {
        const page = getRequest.result;

        if (!page) {
          reject(new Error(`Page ${pageId} not found`));
          return;
        }

        // 수정 이력에 추가
        if (!page.editHistory) page.editHistory = [];
        page.editHistory.push({
          version: page.editHistory.length + 1,
          text: page.editedText || page.originalText,
          editedAt: Date.now()
        });

        // 최근 5개만 유지
        if (page.editHistory.length > 5) {
          page.editHistory = page.editHistory.slice(-5);
        }

        page.editedText = editedText;
        page.editedAt = Date.now();

        const putRequest = store.put(page);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}
```

### 2.2 모듈 간 인터페이스

```typescript
// 카메라 모듈 → OCR 모듈
interface CameraToOCR {
  onFrameCaptured: (frame: Canvas) => void;
}

// OCR 모듈 → 저장소 모듈
interface OCRToStorage {
  onTextExtracted: (text: string, confidence: number, image: Blob) => void;
  onPageChanged: () => void;
}

// 저장소 모듈 → TTS 모듈
interface StorageToTTS {
  onTextReady: (text: string, options?: TTSOptions) => void;
}

// UI 컴포넌트 ↔ 상태 관리
interface UIToState {
  updateCameraStatus: (status: 'active' | 'inactive') => void;
  updateOCRStatus: (status: 'processing' | 'idle', confidence?: number) => void;
  updateTTSStatus: (status: 'playing' | 'paused' | 'idle') => void;
}
```

---

## 3. 데이터베이스 설계 (IndexedDB)

### 3.1 데이터베이스 스키마

**Database Name:** `BookReaderDB`
**Version:** 1

#### Object Store: books

| 필드 | 타입 | 키 | 인덱스 | 설명 |
|------|------|-----|--------|------|
| bookId | String | Primary Key | - | 책의 고유 ID (UUID) |
| title | String | - | - | 책 제목 |
| author | String | - | - | 저자 |
| publisher | String | - | - | 출판사 |
| coverImage | Blob | - | - | 표지 이미지 |
| totalPages | Number | - | - | 총 페이지 수 |
| createdAt | Number | - | **createdAt** | 생성 시간 (타임스탐프) |
| updatedAt | Number | - | **updatedAt** | 최종 수정 시간 |
| pages | Array[String] | - | - | 포함된 페이지 ID 목록 |

#### Object Store: pages

| 필드 | 타입 | 키 | 인덱스 | 설명 |
|------|------|-----|--------|------|
| pageId | String | Primary Key | - | 페이지의 고유 ID (UUID) |
| bookId | String | - | **bookId** | 소속 책의 ID |
| pageNumber | Number | - | **pageNumber** | 페이지 번호 |
| originalImage | Blob | - | - | 원본 이미지 |
| thumbnailImage | Blob | - | - | 섬네일 이미지 |
| originalText | String | - | - | 원본 추출 텍스트 |
| editedText | String | - | - | 수정된 텍스트 |
| ocrConfidence | Number | - | - | OCR 신뢰도 점수 (0-100) |
| createdAt | Number | - | - | 생성 시간 |
| editedAt | Number | - | - | 수정 시간 |
| editHistory | Array | - | - | 수정 이력 |

#### Object Store: preferences

| 필드 | 타입 | 키 | 설명 |
|------|------|-----|------|
| userId | String | Primary Key | 사용자 ID (기본값: 'default') |
| uiLanguage | String | - | UI 언어 ('ko' \| 'en') |
| ttsLanguage | String | - | TTS 음성 언어 ('ko' \| 'en') |
| ttsVoice | String | - | TTS 음성 ID |
| ttsSpeed | Number | - | TTS 재생 속도 (0.5-2.0) |
| ttsVolume | Number | - | TTS 음량 (0-100) |
| ttsAutoPlay | Boolean | - | TTS 자동 재생 여부 |
| cameraResolution | String | - | 카메라 해상도 ('1080p' \| '720p' \| '480p') |
| pageSensitivity | Number | - | 페이지 감지 민감도 (0-100) |
| vibrationEnabled | Boolean | - | 진동 피드백 활성화 여부 |
| soundEnabled | Boolean | - | 음향 신호 활성화 여부 |
| lastReadBook | String | - | 마지막 읽은 책 ID |
| lastReadPage | Number | - | 마지막 읽은 페이지 번호 |

### 3.2 인덱싱 전략

```typescript
// books store 인덱스
booksStore.createIndex('createdAt', 'createdAt', { unique: false });
booksStore.createIndex('updatedAt', 'updatedAt', { unique: false });

// pages store 인덱스
pagesStore.createIndex('bookId', 'bookId', { unique: false });
pagesStore.createIndex('pageNumber', 'pageNumber', { unique: false });
```

### 3.3 쿼리 예시

```typescript
// 최근 수정순으로 모든 책 조회
const booksIndex = db.transaction(['books'])
  .objectStore('books')
  .index('updatedAt');
const allBooks = await booksIndex.getAll();
allBooks.reverse(); // 역순 정렬

// 특정 책의 모든 페이지 조회 (페이지번호 순)
const pagesIndex = db.transaction(['pages'])
  .objectStore('pages')
  .index('bookId');
const pages = await pagesIndex.getAll(bookId);
pages.sort((a, b) => a.pageNumber - b.pageNumber);

// 책의 마지막 페이지 찾기
const lastPage = pages[pages.length - 1];
```
