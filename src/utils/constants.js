/**
 * 애플리케이션 상수
 */

// ===== 앱 정보 =====
export const APP_NAME = '동화책 자동 인식 TTS 리더';
export const APP_VERSION = '0.0.1';

// ===== OCR 설정 =====
export const OCR_MIN_CONFIDENCE = 60; // 최소 신뢰도 (%);
export const OCR_TIMEOUT = 30000; // OCR 타임아웃 (ms)

// ===== TTS 설정 =====
export const TTS_DEFAULT_SPEED = 1.0;
export const TTS_MIN_SPEED = 0.5;
export const TTS_MAX_SPEED = 2.0;
export const TTS_DEFAULT_VOLUME = 80;
export const TTS_MIN_VOLUME = 0;
export const TTS_MAX_VOLUME = 100;

// ===== 카메라 설정 =====
export const CAMERA_RESOLUTIONS = {
  '480p': { width: 640, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 }
};

// ===== 페이지 감지 =====
export const PAGE_DETECTION_INTERVAL = 100; // ms
export const PAGE_DETECTION_MIN_SENSITIVITY = 0;
export const PAGE_DETECTION_MAX_SENSITIVITY = 100;
export const PAGE_DETECTION_DEFAULT_SENSITIVITY = 50;

// ===== 저장소 =====
export const DB_NAME = 'BookReaderDB';
export const DB_VERSION = 1;
export const STORAGE_QUOTA_WARNING = 0.8; // 80% 이상 사용 시 경고
export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const THUMBNAIL_SIZE = 200; // px

// ===== 언어 =====
export const SUPPORTED_LANGUAGES = {
  ko: '한국어',
  en: 'English'
};

// ===== UI =====
export const TOAST_DURATION = 3000; // ms
export const LOADING_SPINNER_SIZE = 40; // px

// ===== 에러 메시지 =====
export const ERROR_MESSAGES = {
  CAMERA_PERMISSION_DENIED: '카메라 권한이 필요합니다. 브라우저 설정을 확인해주세요.',
  CAMERA_NOT_FOUND: '카메라 장치를 찾을 수 없습니다.',
  OCR_FAILED: '텍스트 인식에 실패했습니다. 다시 시도해주세요.',
  TTS_FAILED: '음성 재생에 실패했습니다.',
  STORAGE_FAILED: '데이터 저장에 실패했습니다.',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  INVALID_INPUT: '입력값이 올바르지 않습니다.'
};

// ===== 성공 메시지 =====
export const SUCCESS_MESSAGES = {
  BOOK_SAVED: '책이 저장되었습니다.',
  PAGE_SAVED: '페이지가 저장되었습니다.',
  TEXT_UPDATED: '텍스트가 수정되었습니다.',
  SETTINGS_SAVED: '설정이 저장되었습니다.',
  BOOK_DELETED: '책이 삭제되었습니다.'
};

// ===== 라우트 =====
export const ROUTES = {
  HOME: '/',
  CAMERA: '/camera',
  BOOK_LIST: '/books',
  BOOK_DETAIL: '/books/:bookId',
  SETTINGS: '/settings',
  EDIT_PAGE: '/books/:bookId/pages/:pageId/edit'
};
