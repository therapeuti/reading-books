# 동화책 자동 인식 TTS 웹 앱 - 데이터베이스 설계

## 1. IndexedDB 개요

**Database Name:** `BookReaderDB`
**Version:** 1
**저장소:** 클라이언트 브라우저 로컬 저장소
**최대 용량:** 브라우저에 따라 다름 (일반적 50MB ~ 1GB)

---

## 2. Object Store 스키마

### 2.1 books (책 정보 저장소)

**Primary Key:** `bookId`

#### 필드 정의

| 필드명 | 타입 | 필수 | 인덱스 | 설명 |
|--------|------|------|--------|------|
| bookId | String | ✓ | Primary Key | 책의 고유 ID (UUID) |
| title | String | ✓ | - | 책 제목 |
| author | String | ✓ | - | 저자명 |
| publisher | String | - | - | 출판사 |
| coverImage | Blob | ✓ | - | 표지 이미지 (최대 500KB) |
| totalPages | Number | ✓ | - | 총 페이지 수 |
| createdAt | Number | - | createdAt | 생성 시간 (Unix timestamp) |
| updatedAt | Number | - | updatedAt | 최종 수정 시간 (Unix timestamp) |
| pages | Array[String] | ✓ | - | 포함된 페이지 ID 배열 |

#### 데이터 예시

```json
{
  "bookId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "신데렐라",
  "author": "형제들 그림형제",
  "publisher": "출판사명",
  "coverImage": "<Blob>",
  "totalPages": 254,
  "createdAt": 1732784400000,
  "updatedAt": 1732870800000,
  "pages": [
    "page-001-uuid",
    "page-002-uuid",
    "page-003-uuid"
  ]
}
```

#### 인덱스 정의

```typescript
// books store 생성
const booksStore = db.createObjectStore('books', { keyPath: 'bookId' });

// 인덱스 생성
booksStore.createIndex('createdAt', 'createdAt', { unique: false });
booksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
```

#### 사용 예시

```typescript
// 모든 책 조회 (최근 수정순)
const transaction = db.transaction(['books']);
const store = transaction.objectStore('books');
const index = store.index('updatedAt');
const allBooks = await index.getAll();
allBooks.reverse();  // 역순 정렬

// 특정 책 조회
const book = await store.get('550e8400-e29b-41d4-a716-446655440000');

// 책 저장
await store.put({
  bookId: '550e8400-e29b-41d4-a716-446655440000',
  title: '신데렐라',
  // ... 다른 필드
});

// 책 삭제
await store.delete('550e8400-e29b-41d4-a716-446655440000');
```

---

### 2.2 pages (페이지 정보 저장소)

**Primary Key:** `pageId`

#### 필드 정의

| 필드명 | 타입 | 필수 | 인덱스 | 설명 |
|--------|------|------|--------|------|
| pageId | String | ✓ | Primary Key | 페이지의 고유 ID (UUID) |
| bookId | String | ✓ | bookId | 소속 책의 ID |
| pageNumber | Number | ✓ | pageNumber | 페이지 번호 (1부터 시작) |
| originalImage | Blob | ✓ | - | 원본 이미지 (최대 1MB) |
| thumbnailImage | Blob | ✓ | - | 섬네일 이미지 (최대 100KB) |
| originalText | String | ✓ | - | OCR로 추출한 원본 텍스트 |
| editedText | String | - | - | 사용자가 수정한 텍스트 |
| ocrConfidence | Number | ✓ | - | OCR 신뢰도 점수 (0-100) |
| createdAt | Number | ✓ | - | 생성 시간 (Unix timestamp) |
| editedAt | Number | - | - | 최종 수정 시간 (Unix timestamp) |
| editHistory | Array | - | - | 수정 이력 배열 |

#### editHistory 구조

```typescript
interface EditHistoryItem {
  version: number;              // 수정 버전 번호 (1부터 시작)
  text: string;                 // 해당 버전의 텍스트
  editedAt: number;             // 수정 시간 (Unix timestamp)
}
```

#### 데이터 예시

```json
{
  "pageId": "page-001-550e8400-e29b-41d4-a716-446655440000",
  "bookId": "550e8400-e29b-41d4-a716-446655440000",
  "pageNumber": 1,
  "originalImage": "<Blob>",
  "thumbnailImage": "<Blob>",
  "originalText": "옛날 옛날에 산 골짜기에 호랑이가 살고 있었습니다.",
  "editedText": "옛날 옛날에 산 골짜기에 호랑이가 살고 있었습니다.",
  "ocrConfidence": 87,
  "createdAt": 1732784400000,
  "editedAt": 1732870800000,
  "editHistory": [
    {
      "version": 1,
      "text": "옛날 옛날에 산 골자기에 호랑이가 살고 있었습니다.",
      "editedAt": 1732870800000
    }
  ]
}
```

#### 인덱스 정의

```typescript
// pages store 생성
const pagesStore = db.createObjectStore('pages', { keyPath: 'pageId' });

// 인덱스 생성
pagesStore.createIndex('bookId', 'bookId', { unique: false });
pagesStore.createIndex('pageNumber', 'pageNumber', { unique: false });
```

#### 사용 예시

```typescript
// 특정 책의 모든 페이지 조회 (페이지 번호 순)
const transaction = db.transaction(['pages']);
const store = transaction.objectStore('pages');
const index = store.index('bookId');
const pages = await index.getAll('550e8400-e29b-41d4-a716-446655440000');
pages.sort((a, b) => a.pageNumber - b.pageNumber);

// 페이지 저장
await store.put({
  pageId: 'page-001-550e8400-e29b-41d4-a716-446655440000',
  bookId: '550e8400-e29b-41d4-a716-446655440000',
  pageNumber: 1,
  // ... 다른 필드
});

// 페이지 텍스트 수정
const getRequest = store.get('page-001-550e8400-e29b-41d4-a716-446655440000');
const page = getRequest.result;

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

page.editedText = '수정된 텍스트';
page.editedAt = Date.now();

await store.put(page);
```

---

### 2.3 preferences (사용자 설정 저장소)

**Primary Key:** `userId`

#### 필드 정의

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
|--------|------|------|--------|------|
| userId | String | ✓ | 'default' | 사용자 ID (현재는 'default' 사용) |
| uiLanguage | String | ✓ | 'ko' | UI 언어 ('ko' \| 'en') |
| ttsLanguage | String | ✓ | 'ko' | TTS 음성 언어 ('ko' \| 'en') |
| ttsVoice | String | ✓ | 'female-1' | TTS 음성 선택 |
| ttsSpeed | Number | ✓ | 1.0 | TTS 재생 속도 (0.5 ~ 2.0) |
| ttsVolume | Number | ✓ | 80 | TTS 음량 (0 ~ 100) |
| ttsAutoPlay | Boolean | ✓ | true | TTS 자동 재생 여부 |
| cameraResolution | String | ✓ | '1080p' | 카메라 해상도 ('1080p' \| '720p' \| '480p') |
| pageSensitivity | Number | ✓ | 50 | 페이지 감지 민감도 (0 ~ 100) |
| vibrationEnabled | Boolean | ✓ | true | 진동 피드백 활성화 여부 |
| soundEnabled | Boolean | ✓ | true | 음향 신호 활성화 여부 |
| lastReadBook | String | - | null | 마지막으로 읽은 책 ID |
| lastReadPage | Number | - | 1 | 마지막으로 읽은 페이지 번호 |

#### 데이터 예시

```json
{
  "userId": "default",
  "uiLanguage": "ko",
  "ttsLanguage": "ko",
  "ttsVoice": "female-1",
  "ttsSpeed": 1.0,
  "ttsVolume": 80,
  "ttsAutoPlay": true,
  "cameraResolution": "1080p",
  "pageSensitivity": 50,
  "vibrationEnabled": true,
  "soundEnabled": true,
  "lastReadBook": "550e8400-e29b-41d4-a716-446655440000",
  "lastReadPage": 45
}
```

#### 인덱스 정의

```typescript
// preferences store 생성
db.createObjectStore('preferences', { keyPath: 'userId' });
```

#### 사용 예시

```typescript
// 사용자 설정 조회
const transaction = db.transaction(['preferences']);
const store = transaction.objectStore('preferences');
const prefs = await store.get('default');

// 사용자 설정 저장
await store.put({
  userId: 'default',
  uiLanguage: 'ko',
  ttsLanguage: 'ko',
  // ... 다른 필드
});
```

---

## 3. 데이터베이스 초기화 코드

```typescript
class DatabaseManager {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookReaderDB', 1);

      request.onerror = () => {
        reject(new Error(`데이터베이스 열기 실패: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // books store
        if (!db.objectStoreNames.contains('books')) {
          const booksStore = db.createObjectStore('books', { keyPath: 'bookId' });
          booksStore.createIndex('createdAt', 'createdAt', { unique: false });
          booksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // pages store
        if (!db.objectStoreNames.contains('pages')) {
          const pagesStore = db.createObjectStore('pages', { keyPath: 'pageId' });
          pagesStore.createIndex('bookId', 'bookId', { unique: false });
          pagesStore.createIndex('pageNumber', 'pageNumber', { unique: false });
        }

        // preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'userId' });
        }
      };
    });
  }

  getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다. initDB()를 먼저 호출하세요.');
    }
    return this.db;
  }
}
```

---

## 4. 쿼리 패턴

### 4.1 모든 책 조회 (최근 수정순)

```typescript
async function getAllBooksRecent(): Promise<Book[]> {
  const db = this.getDB();
  const transaction = db.transaction(['books']);
  const store = transaction.objectStore('books');
  const index = store.index('updatedAt');

  return new Promise((resolve, reject) => {
    const request = index.getAll();

    request.onsuccess = () => {
      const books = request.result;
      books.reverse();  // 역순 정렬 (최신부터)
      resolve(books);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
```

### 4.2 특정 책의 모든 페이지 조회 (페이지 번호 순)

```typescript
async function getPagesByBook(bookId: string): Promise<Page[]> {
  const db = this.getDB();
  const transaction = db.transaction(['pages']);
  const store = transaction.objectStore('pages');
  const index = store.index('bookId');

  return new Promise((resolve, reject) => {
    const request = index.getAll(bookId);

    request.onsuccess = () => {
      const pages = request.result;
      pages.sort((a, b) => a.pageNumber - b.pageNumber);
      resolve(pages);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
```

### 4.3 페이지 범위 조회

```typescript
async function getPageRange(
  bookId: string,
  startPage: number,
  endPage: number
): Promise<Page[]> {
  const db = this.getDB();
  const transaction = db.transaction(['pages']);
  const store = transaction.objectStore('pages');
  const index = store.index('bookId');

  return new Promise((resolve, reject) => {
    const request = index.getAll(bookId);

    request.onsuccess = () => {
      const pages = request.result
        .filter(p => p.pageNumber >= startPage && p.pageNumber <= endPage)
        .sort((a, b) => a.pageNumber - b.pageNumber);
      resolve(pages);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
```

### 4.4 책의 마지막 페이지 조회

```typescript
async function getLastPage(bookId: string): Promise<Page | undefined> {
  const pages = await this.getPagesByBook(bookId);
  return pages[pages.length - 1];
}
```

### 4.5 트랜잭션을 사용한 원자적 작업

```typescript
async function copyBook(sourceBookId: string, newTitle: string): Promise<string> {
  const db = this.getDB();
  const transaction = db.transaction(['books', 'pages'], 'readwrite');

  const booksStore = transaction.objectStore('books');
  const pagesStore = transaction.objectStore('pages');

  return new Promise((resolve, reject) => {
    // 원본 책 조회
    const getBookRequest = booksStore.get(sourceBookId);

    getBookRequest.onsuccess = () => {
      const sourceBook = getBookRequest.result;
      if (!sourceBook) {
        reject(new Error('원본 책을 찾을 수 없습니다.'));
        return;
      }

      // 새 책 생성
      const newBookId = uuid();
      const newBook = {
        ...sourceBook,
        bookId: newBookId,
        title: newTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pages: []
      };

      const saveBookRequest = booksStore.put(newBook);

      saveBookRequest.onsuccess = () => {
        // 원본 책의 모든 페이지 조회
        const index = pagesStore.index('bookId');
        const getPagesRequest = index.getAll(sourceBookId);

        getPagesRequest.onsuccess = () => {
          const pages = getPagesRequest.result;

          // 각 페이지를 복사
          pages.forEach(page => {
            const newPageId = uuid();
            const newPage = {
              ...page,
              pageId: newPageId,
              bookId: newBookId,
              createdAt: Date.now(),
              editedAt: Date.now(),
              editHistory: []
            };

            pagesStore.put(newPage);
            newBook.pages.push(newPageId);
          });

          // 책의 페이지 목록 업데이트
          booksStore.put(newBook);

          resolve(newBookId);
        };

        getPagesRequest.onerror = () => {
          reject(getPagesRequest.error);
        };
      };

      saveBookRequest.onerror = () => {
        reject(saveBookRequest.error);
      };
    };

    getBookRequest.onerror = () => {
      reject(getBookRequest.error);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}
```

---

## 5. 성능 최적화 전략

### 5.1 이미지 압축

```typescript
async function compressImage(
  imageBlob: Blob,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          resolve(blob || imageBlob);
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(imageBlob);
  });
}

// 사용
const originalBlob = await cameraModule.captureFrameAsBlob();
const compressedBlob = await compressImage(originalBlob, 0.75);
```

### 5.2 캐싱 전략

```typescript
class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 50;  // 최대 캐시 엔트리 수

  set(key: string, value: any, ttl: number = 3600000): void {
    if (this.cache.size >= this.maxSize) {
      // LRU 제거
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### 5.3 배치 작업

```typescript
async function savePagesInBatch(pages: Page[]): Promise<void> {
  const db = this.getDB();
  const transaction = db.transaction(['pages'], 'readwrite');
  const store = transaction.objectStore('pages');

  return new Promise((resolve, reject) => {
    pages.forEach(page => {
      store.put(page);
    });

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}
```

---

## 6. 마이그레이션 가이드

### 6.1 스키마 업그레이드 예시

```typescript
// DB 버전 2로 업그레이드 시
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  const oldVersion = event.oldVersion;

  if (oldVersion < 2) {
    // 새로운 필드 추가: 책의 카테고리
    // 주의: object store 스키마는 변경 불가능
    // 대신 데이터 마이그레이션 로직 필요
    const booksStore = db.transaction(['books']).objectStore('books');
    const allBooks = await booksStore.getAll();

    allBooks.forEach(book => {
      book.category = 'general';  // 기본값
      booksStore.put(book);
    });
  }
};
```

---

## 7. 데이터 유효성 검사

```typescript
function validateBook(book: any): book is Book {
  return (
    typeof book.bookId === 'string' &&
    typeof book.title === 'string' &&
    typeof book.author === 'string' &&
    book.coverImage instanceof Blob &&
    typeof book.totalPages === 'number' &&
    Array.isArray(book.pages)
  );
}

function validatePage(page: any): page is Page {
  return (
    typeof page.pageId === 'string' &&
    typeof page.bookId === 'string' &&
    typeof page.pageNumber === 'number' &&
    page.originalImage instanceof Blob &&
    page.thumbnailImage instanceof Blob &&
    typeof page.originalText === 'string' &&
    typeof page.ocrConfidence === 'number'
  );
}

function validateUserPreferences(
  prefs: any
): prefs is UserPreferences {
  return (
    typeof prefs.userId === 'string' &&
    ['ko', 'en'].includes(prefs.uiLanguage) &&
    ['ko', 'en'].includes(prefs.ttsLanguage) &&
    typeof prefs.ttsSpeed === 'number' &&
    typeof prefs.ttsVolume === 'number'
  );
}
```

---

이 데이터베이스 설계는 확장성, 성능, 그리고 사용자 경험을 모두 고려하여 작성되었습니다.
