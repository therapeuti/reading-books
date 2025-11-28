# 동화책 자동 인식 TTS 리더

폰 카메라로 동화책을 비추면 자동으로 텍스트를 인식하고 음성으로 읽어주는 웹 앱입니다.

## 기능

- 📷 **카메라 인식**: 스마트폰 카메라로 동화책을 비추면 실시간으로 페이지 인식
- 🔤 **OCR 텍스트 추출**: Tesseract.js를 사용한 고정밀 한글 텍스트 인식
- 🔊 **TTS 음성 읽기**: 추출된 텍스트를 자연스러운 음성으로 자동 재생
- 💾 **로컬 저장**: IndexedDB를 사용한 안전한 로컬 저장소 (50MB+)
- 📝 **텍스트 수정**: 오인식된 텍스트를 직접 수정하여 정확성 향상
- 🔖 **여러 책 관리**: 여러 권의 책을 따로 저장하고 관리
- ⚙️ **설정 커스터마이징**: 음성 속도, 볼륨, 카메라 해상도 조정

## 기술 스택

| 계층 | 기술 |
|------|------|
| **프레임워크** | React 18 + JavaScript (ES6+) |
| **빌드 도구** | Vite |
| **상태 관리** | Zustand |
| **스타일링** | Tailwind CSS |
| **라우팅** | React Router v6 |
| **OCR** | Tesseract.js (한글 지원) |
| **TTS** | Web Speech API |
| **저장소** | IndexedDB |
| **배포** | GitHub Pages + GitHub Actions |

## 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/reading-books.git
cd reading-books

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173/reading-books`를 열어주세요.

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과는 `dist/` 디렉토리에 생성됩니다.

### 프로덕션 빌드 미리보기

```bash
npm run preview
```

## 사용 방법

### 1. 홈 화면
앱을 열면 홈 화면이 표시됩니다.
- **📷 카메라**: 새 책을 등록합니다
- **📚 책 목록**: 저장된 책을 확인합니다
- **⚙️ 설정**: 앱 설정을 변경합니다

### 2. 카메라 페이지
- 스마트폰 카메라 권한을 허용합니다
- 동화책 페이지를 카메라에 비춥니다
- **"텍스트 추출"** 버튼을 눌러 OCR 실행
- 추출된 텍스트가 자동으로 음성으로 읽힙니다
- **"저장"** 버튼으로 새 책 등록 또는 페이지 추가

### 3. 책 목록 페이지
- 저장된 모든 책을 카드 형식으로 표시
- **"읽기"** 버튼으로 책 상세 페이지 이동
- **"삭제"** 버튼으로 책 삭제 (확인 필요)

### 4. 책 상세 페이지
- 현재 페이지의 텍스트와 이미지 표시
- **"음성 읽기"** 버튼으로 현재 페이지 재생
- **"이전/다음"** 버튼으로 페이지 네비게이션
- **"수정"** 버튼으로 텍스트 편집

### 5. 설정 페이지
- **언어**: UI 및 음성 언어 변경 (한글/English)
- **음성**: TTS 속도, 볼륨, 자동 재생 설정
- **카메라**: 해상도, 감도 조정
- **피드백**: 진동, 소리 알림 설정

## 프로젝트 구조

```
reading-books/
├── src/
│   ├── modules/              # 핵심 기능 모듈
│   │   ├── camera.js         # 카메라 제어
│   │   ├── ocr.js            # 텍스트 추출 (Tesseract.js)
│   │   ├── tts.js            # 음성 읽기 (Web Speech API)
│   │   └── storage.js        # 데이터 저장 (IndexedDB)
│   ├── store/
│   │   └── appStore.js       # Zustand 상태 관리
│   ├── utils/
│   │   ├── imageProcessing.js # 이미지 처리 유틸
│   │   └── constants.js      # 상수 정의
│   ├── components/
│   │   ├── common/           # 재사용 가능한 UI 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Loading.jsx
│   │   └── pages/            # 페이지 컴포넌트
│   │       ├── HomePage.jsx
│   │       ├── CameraPage.jsx
│   │       ├── BookListPage.jsx
│   │       ├── BookDetailPage.jsx
│   │       └── SettingsPage.jsx
│   ├── App.jsx               # 메인 앱 컴포넌트
│   ├── App.css               # 전역 스타일
│   └── main.jsx              # 엔트리 포인트
├── public/
│   └── vite.svg
├── index.html                # HTML 템플릿
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

## 주요 모듈 설명

### camera.js
카메라 스트림을 초기화하고 프레임을 캡처합니다.
- `init(videoElementId)`: 카메라 초기화
- `captureFrame()`: Canvas 형식으로 프레임 반환
- `captureFrameAsBlob(quality)`: Blob 형식으로 압축된 프레임 반환
- `stop()`: 카메라 스트림 종료

### ocr.js
Tesseract.js를 사용하여 이미지에서 한글 텍스트를 인식합니다.
- `init()`: Tesseract Worker 초기화
- `extractText(imageBlob)`: 이미지에서 텍스트 추출 및 신뢰도 반환
- `terminate()`: Worker 정리

### tts.js
Web Speech API를 사용하여 텍스트를 음성으로 재생합니다.
- `speak(text, options)`: 텍스트 음성 재생
- `pause()`, `resume()`, `stop()`: 재생 제어
- `setSpeed(speed)`: 음성 속도 설정 (0.5-2.0)
- `setVolume(volume)`: 음성 볼륨 설정 (0-100)
- `getAvailableVoices()`: 사용 가능한 음성 목록 반환

### storage.js
IndexedDB를 사용하여 책과 페이지 데이터를 저장합니다.
- **books**: 책 정보 (제목, 저자, 커버 이미지 등)
- **pages**: 각 페이지의 텍스트와 이미지
- **preferences**: 사용자 설정 저장

## 브라우저 지원

| 브라우저 | 버전 | 카메라 | OCR | TTS |
|---------|------|--------|-----|-----|
| Chrome | 최신 | ✅ | ✅ | ✅ |
| Firefox | 최신 | ✅ | ✅ | ✅ |
| Safari | 14+ | ⚠️ | ✅ | ✅ |
| Edge | 최신 | ✅ | ✅ | ✅ |

> ⚠️ Safari의 카메라 지원은 제한적일 수 있습니다.

## 제약 사항

- **저장 용량**: IndexedDB는 브라우저마다 다르지만 일반적으로 50MB 이상 사용 가능
- **음성 언어**: 기기 설정에 따라 음성 품질이 달라질 수 있음
- **카메라**: HTTPS 연결에서만 작동 (로컬호스트 제외)
- **오프라인**: 앱은 온라인 필요 (초기 로딩 후 OCR은 오프라인 가능)

## 성능 팁

1. **좋은 조명**: OCR 정확도를 높이려면 밝은 환경에서 사용하세요
2. **안정적인 카메라**: 카메라를 흔들지 않고 텍스트가 명확하게 보이도록 유지하세요
3. **텍스트 수정**: 오인식된 부분은 수동으로 수정하면 더 나은 경험을 제공합니다
4. **음성 설정**: 음성 속도와 볼륨을 개인 선호도에 맞게 조정하세요

## 데이터 관리

모든 데이터는 사용자의 기기에 로컬로 저장됩니다. 서버에 전송되지 않습니다.

### 데이터 초기화
설정 페이지에서 모든 데이터를 초기화할 수 있습니다 (삭제 후 복구 불가).

### 데이터 백업
IndexedDB 데이터는 브라우저별로 저장되므로:
- 다른 브라우저에서는 동일한 데이터에 접근 불가
- 브라우저 캐시 삭제 시 데이터 손실 가능

## 문제 해결

### 카메라가 작동하지 않는 경우
1. HTTPS 연결 확인 (로컬호스트 제외)
2. 브라우저 카메라 권한 확인
3. 다른 앱에서 카메라 사용 중인지 확인
4. 브라우저 재시작

### OCR이 정상 작동하지 않는 경우
1. 인터넷 연결 확인 (Tesseract 모델 다운로드 필요)
2. 이미지 품질 확인 (밝기, 선명도)
3. 한글만 지원되는지 확인
4. 브라우저 캐시 삭제 후 재시도

### TTS 음성이 들리지 않는 경우
1. 기기 음량 확인
2. 음성 설정에서 언어 및 속도 확인
3. 브라우저 설정에서 사운드 권한 확인
4. 다른 음성 선택해보기

## 개발 가이드

### 새로운 기능 추가

1. **새로운 페이지 추가**:
   ```javascript
   // src/pages/NewPage.jsx 파일 생성
   // src/App.jsx에 Route 추가
   <Route path="/newpage" element={<NewPage />} />
   ```

2. **상태 추가**:
   ```javascript
   // src/store/appStore.js에서 상태 및 액션 추가
   ```

3. **새로운 모듈 추가**:
   ```javascript
   // src/modules/newModule.js 파일 생성
   // 클래스 구조로 유지
   ```

### 스타일링

Tailwind CSS를 사용합니다. 클래스명 사용 방식:
```jsx
<div className="bg-blue-500 text-white px-4 py-2 rounded">
  Button
</div>
```

### 상태 관리

Zustand를 사용합니다. 예시:
```javascript
import { useAppStore } from './store/appStore';

function MyComponent() {
  const { books, addBook } = useAppStore();
  // ...
}
```

## 배포

### GitHub Pages에 자동 배포

1. GitHub에 저장소 생성
2. 코드 푸시
3. GitHub Actions가 자동으로 실행
4. GitHub Pages 설정에서 gh-pages 브랜치 선택

배포 URL: `https://yourusername.github.io/reading-books`

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 기여

버그 리포트 또는 기능 제안은 GitHub Issues를 통해 제출해주세요.

## 변경 로그

### v0.1.0 (초기 버전)
- 프로토타입 완성
- 기본 기능 구현 (카메라, OCR, TTS, 저장소)
- GitHub Pages 자동 배포 설정

---

**마지막 업데이트**: 2025년 11월 28일
