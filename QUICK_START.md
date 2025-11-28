# 프로토타입 빠른 시작 가이드

## 🚀 5분 안에 프로젝트 시작하기

### 1단계: 프로젝트 생성 (2분)

```bash
# Vite를 사용해 React 프로젝트 생성
npm create vite@latest reading-books -- --template react

# 프로젝트 디렉토리로 이동
cd reading-books

# 의존성 설치
npm install
```

### 2단계: 필요한 패키지 설치 (2분)

```bash
npm install --save \
  tailwindcss \
  postcss \
  autoprefixer \
  zustand \
  tesseract.js \
  uuid

npm install --save-dev \
  @tailwindcss/forms
```

### 3단계: Tailwind CSS 설정 (1분)

```bash
# Tailwind 초기화
npx tailwindcss init -p
```

**tailwind.config.js 수정:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

**src/index.css 생성:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}
```

---

## 🏗️ 폴더 구조 생성

```bash
cd src

# 폴더 생성
mkdir -p components/{pages,common,features}
mkdir -p modules
mkdir -p hooks
mkdir -p store
mkdir -p utils
mkdir -p styles

# 기본 파일 생성
touch modules/camera.js
touch modules/ocr.js
touch modules/tts.js
touch modules/storage.js
touch modules/pageDetection.js

touch hooks/useCamera.js
touch hooks/useOCR.js
touch hooks/useTTS.js
touch hooks/useBook.js

touch store/appStore.js
touch utils/constants.js
```

---

## ⚡ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 열기

---

## 📱 제1 단계: 카메라 모듈 구현

**src/modules/camera.js:**
```javascript
class CameraModule {
  constructor() {
    this.mediaStream = null;
    this.videoElement = null;
  }

  async init(videoElementId) {
    try {
      this.videoElement = document.getElementById(videoElementId);

      // 카메라 접근 권한 요청
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // 스트림을 video 요소에 연결
      this.videoElement.srcObject = this.mediaStream;

      console.log('카메라 초기화 완료');
      return true;
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      throw new Error('카메라 권한이 필요합니다.');
    }
  }

  captureFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0);

    return canvas;
  }

  async captureFrameAsBlob() {
    const canvas = this.captureFrame();
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  }

  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}

export default CameraModule;
```

---

## 🔤 제2 단계: OCR 모듈 구현

**src/modules/ocr.js:**
```javascript
import Tesseract from 'tesseract.js';

class OCRModule {
  constructor() {
    this.worker = null;
  }

  async init() {
    this.worker = await Tesseract.createWorker('kor'); // 한글 지원
    console.log('OCR 초기화 완료');
  }

  async extractText(imageBlob) {
    try {
      const result = await this.worker.recognize(imageBlob);

      // 신뢰도 계산
      const confidence = Math.round(
        result.data.confidence ||
        (result.data.words
          .reduce((sum, word) => sum + word.confidence, 0) /
          result.data.words.length)
      );

      return {
        text: result.data.text,
        confidence: Math.min(confidence, 100)
      };
    } catch (error) {
      console.error('OCR 실패:', error);
      throw new Error('텍스트 인식에 실패했습니다.');
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}

export default OCRModule;
```

---

## 🔊 제3 단계: TTS 모듈 구현

**src/modules/tts.js:**
```javascript
class TTSModule {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
  }

  async speak(text, options = {}) {
    // 기존 음성 중지
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = options.speed || 1.0;
    utterance.volume = (options.volume || 80) / 100;
    utterance.pitch = 1.0;

    return new Promise((resolve, reject) => {
      utterance.onstart = () => {
        this.isPlaying = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        reject(new Error(`음성 재생 실패: ${event.error}`));
      };

      this.utterance = utterance;
      this.synth.speak(utterance);
    });
  }

  pause() {
    if (this.synth.paused === false) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    this.synth.cancel();
    this.isPlaying = false;
  }

  setSpeed(speed) {
    if (this.utterance) {
      this.utterance.rate = Math.max(0.5, Math.min(2.0, speed));
    }
  }

  setVolume(volume) {
    if (this.utterance) {
      this.utterance.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }

  getAvailableVoices() {
    return this.synth.getVoices()
      .filter(voice => voice.lang.startsWith('ko'));
  }
}

export default TTSModule;
```

---

## 💾 제4 단계: Storage 모듈 구현

**src/modules/storage.js:**
```javascript
import { v4 as uuidv4 } from 'uuid';

class StorageModule {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookReaderDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // books store
        if (!db.objectStoreNames.contains('books')) {
          const booksStore = db.createObjectStore('books', { keyPath: 'bookId' });
          booksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // pages store
        if (!db.objectStoreNames.contains('pages')) {
          const pagesStore = db.createObjectStore('pages', { keyPath: 'pageId' });
          pagesStore.createIndex('bookId', 'bookId', { unique: false });
        }

        // preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'userId' });
        }
      };
    });
  }

  async saveBook(book) {
    const transaction = this.db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    const bookData = {
      ...book,
      bookId: book.bookId || uuidv4(),
      createdAt: book.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(bookData);
      request.onsuccess = () => resolve(bookData.bookId);
      request.onerror = () => reject(request.error);
    });
  }

  async getBook(bookId) {
    const transaction = this.db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');

    return new Promise((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBooks() {
    const transaction = this.db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    const index = store.index('updatedAt');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const books = request.result;
        books.reverse(); // 최신순
        resolve(books);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async savePage(page) {
    const transaction = this.db.transaction(['pages'], 'readwrite');
    const store = transaction.objectStore('pages');

    const pageData = {
      ...page,
      pageId: page.pageId || uuidv4(),
      createdAt: page.createdAt || Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(pageData);
      request.onsuccess = () => resolve(pageData.pageId);
      request.onerror = () => reject(request.error);
    });
  }

  async getPagesByBook(bookId) {
    const transaction = this.db.transaction(['pages'], 'readonly');
    const store = transaction.objectStore('pages');
    const index = store.index('bookId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(bookId);
      request.onsuccess = () => {
        const pages = request.result.sort((a, b) => a.pageNumber - b.pageNumber);
        resolve(pages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updatePageText(pageId, editedText) {
    const transaction = this.db.transaction(['pages'], 'readwrite');
    const store = transaction.objectStore('pages');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(pageId);

      getRequest.onsuccess = () => {
        const page = getRequest.result;
        page.editedText = editedText;
        page.editedAt = Date.now();

        const putRequest = store.put(page);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteBook(bookId) {
    const transaction = this.db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    return new Promise((resolve, reject) => {
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default StorageModule;
```

---

## 🎯 제5 단계: 상태 관리 설정

**src/store/appStore.js:**
```javascript
import { create } from 'zustand';

const useAppStore = create((set) => ({
  // 책 상태
  books: [],
  currentBook: null,
  currentPage: 1,
  currentPageData: null,

  // UI 상태
  loading: false,
  error: null,
  toastMessage: null,

  // TTS 상태
  isPlaying: false,
  ttsSpeed: 1.0,
  ttsVolume: 80,

  // 액션
  setBooks: (books) => set({ books }),
  setCurrentBook: (book) => set({ currentBook: book }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentPageData: (data) => set({ currentPageData: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setToast: (message) => set({ toastMessage: message }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setTTSSpeed: (speed) => set({ ttsSpeed: speed }),
  setTTSVolume: (volume) => set({ ttsVolume: volume }),

  // 리셋
  reset: () => set({
    books: [],
    currentBook: null,
    currentPage: 1,
    currentPageData: null,
    loading: false,
    error: null,
    isPlaying: false
  })
}));

export default useAppStore;
```

---

## 🎨 제6 단계: 기본 컴포넌트 만들기

**src/components/common/Header.jsx:**
```javascript
export function Header({ title, onBack }) {
  return (
    <header className="bg-white shadow-md p-4 flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="text-2xl">◀</button>
      )}
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}
```

**src/pages/HomePage.jsx:**
```javascript
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <Header title="동화책 TTS 리더" />

      <div className="p-4 space-y-4">
        <button
          onClick={() => navigate('/camera')}
          className="w-full bg-blue-500 text-white p-4 rounded-lg text-lg font-bold"
        >
          📷 카메라로 책 읽기
        </button>

        <button
          onClick={() => navigate('/books')}
          className="w-full bg-green-500 text-white p-4 rounded-lg text-lg font-bold"
        >
          📚 저장된 책 보기
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="w-full bg-gray-500 text-white p-4 rounded-lg text-lg font-bold"
        >
          ⚙️ 설정
        </button>
      </div>
    </div>
  );
}
```

---

## 📦 package.json 확인

프로젝트의 `package.json`이 다음과 같은지 확인하세요:

```json
{
  "name": "reading-books",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.0.0",
    "zustand": "^4.4.0",
    "tesseract.js": "^5.0.0",
    "uuid": "^9.0.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## ✅ 다음 단계

1. ✅ 기본 라우팅 설정 (React Router)
2. ✅ 카메라 페이지 UI 만들기
3. ✅ OCR + TTS 통합
4. ✅ 책 목록 페이지 UI
5. ✅ GitHub Pages 배포 설정

---

## 🐛 문제 해결

### Q: 카메라가 안 열림
A: HTTPS 필요합니다. `localhost` 또는 GitHub Pages 사용

### Q: OCR이 너무 느림
A: Tesseract.js는 처음 로드 시 모델을 다운로드합니다. (5-10초)

### Q: TTS가 작동 안 함
A: 일부 브라우저에서 제한될 수 있습니다. 최신 Chrome/Safari 사용

---

이제 개발을 시작할 준비가 되었습니다! 🚀

