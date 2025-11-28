/**
 * IndexedDB를 사용한 로컬 저장소 모듈
 */
import { v4 as uuidv4 } from 'uuid';

class StorageModule {
  constructor() {
    this.db = null;
  }

  /**
   * IndexedDB 초기화
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookReaderDB', 1);

      request.onerror = () => {
        console.error('❌ IndexedDB 열기 실패:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB 초기화 완료');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // books store
        if (!db.objectStoreNames.contains('books')) {
          const booksStore = db.createObjectStore('books', { keyPath: 'bookId' });
          booksStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          console.log('✅ books store 생성됨');
        }

        // pages store
        if (!db.objectStoreNames.contains('pages')) {
          const pagesStore = db.createObjectStore('pages', { keyPath: 'pageId' });
          pagesStore.createIndex('bookId', 'bookId', { unique: false });
          console.log('✅ pages store 생성됨');
        }

        // preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'userId' });
          console.log('✅ preferences store 생성됨');
        }
      };
    });
  }

  /**
   * 책 저장
   * @param {Object} book - 책 정보
   * @returns {Promise<string>} bookId
   */
  async saveBook(book) {
    const transaction = this.db.transaction(['books'], 'readwrite');
    const store = transaction.objectStore('books');

    const bookData = {
      ...book,
      bookId: book.bookId || uuidv4(),
      createdAt: book.createdAt || Date.now(),
      updatedAt: Date.now(),
      pages: book.pages || []
    };

    return new Promise((resolve, reject) => {
      const request = store.put(bookData);
      request.onsuccess = () => {
        console.log(`✅ 책 저장됨: ${bookData.bookId}`);
        resolve(bookData.bookId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 책 조회
   * @param {string} bookId - 책 ID
   * @returns {Promise<Object|undefined>}
   */
  async getBook(bookId) {
    const transaction = this.db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');

    return new Promise((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 모든 책 조회
   * @returns {Promise<Array>}
   */
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

  /**
   * 책 삭제
   * @param {string} bookId - 책 ID
   * @returns {Promise<void>}
   */
  async deleteBook(bookId) {
    const transaction = this.db.transaction(['books', 'pages'], 'readwrite');
    const booksStore = transaction.objectStore('books');
    const pagesStore = transaction.objectStore('pages');
    const index = pagesStore.index('bookId');

    return new Promise((resolve, reject) => {
      // 먼저 책의 모든 페이지 삭제
      const getPages = index.getAll(bookId);
      getPages.onsuccess = () => {
        const pages = getPages.result;
        pages.forEach(page => {
          pagesStore.delete(page.pageId);
        });

        // 책 삭제
        const deleteBook = booksStore.delete(bookId);
        deleteBook.onsuccess = () => {
          console.log(`✅ 책 삭제됨: ${bookId}`);
          resolve();
        };
        deleteBook.onerror = () => reject(deleteBook.error);
      };
      getPages.onerror = () => reject(getPages.error);
    });
  }

  /**
   * 페이지 저장
   * @param {Object} page - 페이지 정보
   * @returns {Promise<string>} pageId
   */
  async savePage(page) {
    const transaction = this.db.transaction(['pages', 'books'], 'readwrite');
    const pagesStore = transaction.objectStore('pages');
    const booksStore = transaction.objectStore('books');

    const pageData = {
      ...page,
      pageId: page.pageId || uuidv4(),
      createdAt: page.createdAt || Date.now(),
      editedAt: page.editedAt || Date.now(),
      editHistory: page.editHistory || []
    };

    return new Promise((resolve, reject) => {
      // 페이지 저장
      const savePage = pagesStore.put(pageData);
      savePage.onsuccess = () => {
        // 책의 페이지 ID 목록 업데이트
        const getBook = booksStore.get(page.bookId);
        getBook.onsuccess = () => {
          const book = getBook.result;
          if (book && !book.pages.includes(pageData.pageId)) {
            book.pages.push(pageData.pageId);
            book.updatedAt = Date.now();
            booksStore.put(book);
          }
        };

        console.log(`✅ 페이지 저장됨: ${pageData.pageId}`);
        resolve(pageData.pageId);
      };
      savePage.onerror = () => reject(savePage.error);
    });
  }

  /**
   * 특정 책의 모든 페이지 조회
   * @param {string} bookId - 책 ID
   * @returns {Promise<Array>}
   */
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

  /**
   * 페이지 조회
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<Object|undefined>}
   */
  async getPage(pageId) {
    const transaction = this.db.transaction(['pages'], 'readonly');
    const store = transaction.objectStore('pages');

    return new Promise((resolve, reject) => {
      const request = store.get(pageId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 페이지 텍스트 수정
   * @param {string} pageId - 페이지 ID
   * @param {string} editedText - 수정된 텍스트
   * @returns {Promise<void>}
   */
  async updatePageText(pageId, editedText) {
    const transaction = this.db.transaction(['pages', 'books'], 'readwrite');
    const store = transaction.objectStore('pages');
    const booksStore = transaction.objectStore('books');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(pageId);

      getRequest.onsuccess = () => {
        const page = getRequest.result;
        if (!page) {
          reject(new Error(`페이지를 찾을 수 없습니다: ${pageId}`));
          return;
        }

        // 수정 이력 추가
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
        putRequest.onsuccess = () => {
          // 책의 updatedAt 업데이트
          const getBook = booksStore.get(page.bookId);
          getBook.onsuccess = () => {
            const book = getBook.result;
            if (book) {
              book.updatedAt = Date.now();
              booksStore.put(book);
            }
          };

          console.log(`✅ 페이지 텍스트 수정됨: ${pageId}`);
          resolve();
        };
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * 페이지 삭제
   * @param {string} pageId - 페이지 ID
   * @returns {Promise<void>}
   */
  async deletePage(pageId) {
    const transaction = this.db.transaction(['pages', 'books'], 'readwrite');
    const pagesStore = transaction.objectStore('pages');
    const booksStore = transaction.objectStore('books');

    return new Promise((resolve, reject) => {
      const getPage = pagesStore.get(pageId);
      getPage.onsuccess = () => {
        const page = getPage.result;
        const deletePageReq = pagesStore.delete(pageId);

        deletePageReq.onsuccess = () => {
          // 책의 pages 배열에서 제거
          const getBook = booksStore.get(page.bookId);
          getBook.onsuccess = () => {
            const book = getBook.result;
            if (book) {
              book.pages = book.pages.filter(id => id !== pageId);
              book.updatedAt = Date.now();
              booksStore.put(book);
            }
          };

          console.log(`✅ 페이지 삭제됨: ${pageId}`);
          resolve();
        };
        deletePageReq.onerror = () => reject(deletePageReq.error);
      };
      getPage.onerror = () => reject(getPage.error);
    });
  }

  /**
   * 사용자 설정 저장
   * @param {Object} prefs - 사용자 설정
   * @returns {Promise<void>}
   */
  async savePreferences(prefs) {
    const transaction = this.db.transaction(['preferences'], 'readwrite');
    const store = transaction.objectStore('preferences');

    const prefData = {
      ...prefs,
      userId: prefs.userId || 'default'
    };

    return new Promise((resolve, reject) => {
      const request = store.put(prefData);
      request.onsuccess = () => {
        console.log('✅ 설정 저장됨');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 사용자 설정 조회
   * @returns {Promise<Object|undefined>}
   */
  async getPreferences() {
    const transaction = this.db.transaction(['preferences'], 'readonly');
    const store = transaction.objectStore('preferences');

    return new Promise((resolve, reject) => {
      const request = store.get('default');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 데이터베이스 크기 조회
   * @returns {Promise<{used: number, quota: number}>}
   */
  async getDBSize() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        quota: estimate.quota
      };
    }
    return { used: 0, quota: 0 };
  }

  /**
   * 데이터베이스 초기화
   * @returns {Promise<void>}
   */
  async reset() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('BookReaderDB');
      request.onsuccess = () => {
        console.log('✅ 데이터베이스 초기화됨');
        this.db = null;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export default StorageModule;
