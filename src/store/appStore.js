import { create } from 'zustand';

/**
 * Zustand를 사용한 글로벌 상태 관리
 */
const useAppStore = create((set, get) => ({
  // ===== 책 상태 =====
  books: [],
  currentBook: null,
  currentPageNumber: 1,
  currentPageData: null,

  // ===== UI 상태 =====
  loading: false,
  error: null,
  toastMessage: null,
  isInitialized: false,

  // ===== TTS 상태 =====
  isPlaying: false,
  isPaused: false,
  ttsSpeed: 1.0,
  ttsVolume: 80,

  // ===== 카메라 상태 =====
  cameraActive: false,
  cameraError: null,

  // ===== OCR 상태 =====
  ocrLoading: false,
  ocrConfidence: 0,

  // ===== 사용자 설정 =====
  preferences: {
    uiLanguage: 'ko',
    ttsLanguage: 'ko',
    ttsAutoPlay: true,
    cameraResolution: '1080p',
    pageSensitivity: 50,
    vibrationEnabled: true,
    soundEnabled: true
  },

  // ===== 액션: 책 =====
  setBooks: (books) => set({ books }),
  setCurrentBook: (book) => set({ currentBook: book }),
  setCurrentPageNumber: (page) => set({ currentPageNumber: page }),
  setCurrentPageData: (data) => set({ currentPageData: data }),

  addBook: (book) => set((state) => ({
    books: [book, ...state.books]
  })),

  updateBook: (bookId, updates) => set((state) => ({
    books: state.books.map(b => b.bookId === bookId ? { ...b, ...updates } : b)
  })),

  deleteBook: (bookId) => set((state) => ({
    books: state.books.filter(b => b.bookId !== bookId),
    currentBook: state.currentBook?.bookId === bookId ? null : state.currentBook
  })),

  // ===== 액션: UI =====
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setToast: (message) => set({ toastMessage: message }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  clearError: () => set({ error: null }),
  clearToast: () => set({ toastMessage: null }),

  // ===== 액션: TTS =====
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setTTSSpeed: (speed) => set({ ttsSpeed: Math.max(0.5, Math.min(2.0, speed)) }),
  setTTSVolume: (volume) => set({ ttsVolume: Math.max(0, Math.min(100, volume)) }),

  // ===== 액션: 카메라 =====
  setCameraActive: (active) => set({ cameraActive: active }),
  setCameraError: (error) => set({ cameraError: error }),

  // ===== 액션: OCR =====
  setOCRLoading: (loading) => set({ ocrLoading: loading }),
  setOCRConfidence: (confidence) => set({ ocrConfidence: confidence }),

  // ===== 액션: 설정 =====
  setPreferences: (prefs) => set({ preferences: { ...get().preferences, ...prefs } }),
  updatePreference: (key, value) => set((state) => ({
    preferences: { ...state.preferences, [key]: value }
  })),

  // ===== 액션: 전체 리셋 =====
  reset: () => set({
    books: [],
    currentBook: null,
    currentPageNumber: 1,
    currentPageData: null,
    loading: false,
    error: null,
    toastMessage: null,
    isPlaying: false,
    isPaused: false,
    cameraActive: false,
    cameraError: null,
    ocrLoading: false,
    ocrConfidence: 0
  })
}));

export default useAppStore;
