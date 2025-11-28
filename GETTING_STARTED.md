# 빠른 시작 가이드 (5분)

프로토타입 앱을 로컬에서 실행하고 GitHub에 배포하는 방법을 5분 안에 완료하세요.

---

## 📦 1단계: 설치 (1분)

```bash
# 프로젝트 디렉토리로 이동
cd reading-books

# 의존성 설치
npm install
```

**예상 시간**: 1분
**결과**: node_modules 폴더 생성, 필요한 모든 라이브러리 설치

---

## 🚀 2단계: 로컬 개발 서버 실행 (1분)

```bash
# 개발 서버 시작
npm run dev
```

**예상 시간**: 30초
**출력 예시**:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/reading-books
➜  press h to show help
```

**브라우저 접속**: `http://localhost:5173/reading-books`

---

## ✅ 3단계: 기능 테스트 (2분)

### 홈 화면
- [x] 앱 로드되고 3개 버튼 표시
- [x] 설명 텍스트 보임

### 카메라 페이지
```bash
# 버튼 클릭: 📷 카메라
```
- [x] "카메라 권한을 허용하시겠습니까?" 팝업 표시
- [x] 허용 클릭
- [x] 카메라 영상 미리보기 표시
- [x] "텍스트 추출" 버튼 동작

### 설정 페이지
```bash
# 버튼 클릭: ⚙️ 설정
```
- [x] 언어, 음성, 카메라 설정 표시
- [x] 슬라이더 조절 가능
- [x] "저장" 버튼 동작

---

## 🌐 4단계: GitHub 배포 (1분)

### 4.1 GitHub 저장소 생성
1. https://github.com/new 방문
2. Repository name: `reading-books`
3. Description: `Fairy tale book auto-recognition TTS reader`
4. Public 선택
5. **Create repository** 클릭

### 4.2 로컬에서 푸시
```bash
# Git 초기화 (만약 안 했으면)
git init

# 모든 파일 스테이징
git add .

# 커밋
git commit -m "Initial commit: Complete prototype"

# 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/reading-books.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 4.3 GitHub Pages 설정
1. GitHub 저장소 > **Settings** 탭
2. 좌측 메뉴 > **Pages**
3. "Source" 섹션에서:
   - Branch: `gh-pages` (자동 생성됨, 없으면 deploy 후 생성됨)
   - Folder: `/ (root)`
4. **Save** 클릭

### 4.4 자동 배포 확인
1. GitHub 저장소 > **Actions** 탭
2. "Deploy to GitHub Pages" 워크플로우 실행 확인
3. 초록색 ✅ 표시되면 배포 완료

### 4.5 배포 URL에서 앱 접속
```
https://YOUR_USERNAME.github.io/reading-books
```

예시: `https://john-doe.github.io/reading-books`

---

## 🛠️ 일반 명령어

### 개발 중
```bash
# 개발 서버 실행 (핫 리로드)
npm run dev

# 빌드하지 않고 코드 확인
# src/ 폴더의 파일을 수정하면 자동 반영
```

### 배포 전 테스트
```bash
# 프로덕션 빌드 생성
npm run build
# → dist/ 폴더 생성

# 빌드 결과 테스트
npm run preview
# → http://localhost:4173/reading-books 에서 확인
```

### 배포
```bash
# 코드 변경 후 배포
git add .
git commit -m "Update: 변경 사항 설명"
git push
# → GitHub Actions가 자동으로 배포 (1-2분)
```

---

## 🐛 문제 해결

### "포트 5173이 이미 사용 중입니다"
```bash
# 포트 변경해서 실행
npm run dev -- --port 3000
# → http://localhost:3000/reading-books
```

### "npm install 실패"
```bash
# 캐시 삭제 후 재시도
npm cache clean --force
npm install
```

### "카메라가 작동하지 않음"
- HTTPS 연결 확인 (로컬호스트는 제외)
- 브라우저 카메라 권한 확인
- 다른 앱에서 카메라 사용 중인지 확인
- 브라우저 재시작

### "GitHub 배포가 안 됨"
1. GitHub Actions 상태 확인: 저장소 > Actions 탭
2. 빌드 로그 확인: 워크플로우 클릭 후 콘솔 출력 확인
3. GitHub Pages 설정 확인: Settings > Pages

---

## 📱 배포 후 사용하기

### 스마트폰에서 접속
1. 배포 URL을 브라우저에 입력
2. 카메라 권한 허용
3. 동화책을 카메라에 비춤
4. "텍스트 추출" 클릭
5. 자동으로 음성 재생됨

### 다양한 책 등록
- 각 책마다 첫 페이지를 카메라로 비춤
- 제목 입력 후 저장
- 다음 페이지는 이전 책 선택 후 카메라로 페이지 추가

---

## 📚 다음 단계

프로토타입을 성공적으로 배포했다면:

1. **기능 피드백 수집** - 실제 사용자의 의견
2. **버그 보고** - GitHub Issues에 보고
3. **개선 사항 리스트 작성**
4. **v0.2.0 계획** - 향상된 기능 추가

---

## 💡 팁

### 개발 속도 향상
- VS Code 확장 설치: ES7+ React/Redux/React-Native snippets
- Vite는 매우 빨라서 저장하면 즉시 반영됨

### 스마트폰 테스트
```bash
# 로컬 네트워크에서 접속 가능
npm run dev -- --host
# → http://YOUR_IP:5173/reading-books
# 같은 네트워크의 스마트폰에서 YOUR_IP:5173 접속
```

### 성능 모니터링
- Chrome DevTools (F12) > Lighthouse 탭
- Performance 탭에서 병목 지점 확인

---

## 🎓 학습 자료

프로토타입 코드에서 배울 수 있는 것:

1. **React Hooks**: useState, useEffect, useRef 활용
2. **Zustand**: 경량 상태 관리 라이브러리
3. **Tailwind CSS**: 유틸리티 기반 스타일링
4. **Web APIs**:
   - getUserMedia (카메라)
   - IndexedDB (로컬 저장)
   - Web Speech API (TTS)
   - Canvas API (이미지 처리)
5. **OCR**: Tesseract.js 사용법
6. **GitHub Actions**: CI/CD 자동화
7. **Vite**: 초고속 빌드 도구

---

## 📖 문서

더 자세한 정보는 다음 문서를 참고하세요:

- **README.md** - 전체 사용 가이드
- **PROJECT_COMPLETION_SUMMARY.md** - 프로젝트 완성 현황
- 각 src/ 폴더의 코드 주석

---

**성공! 🎉**

5분 안에 프로토타입을 로컬에서 실행하고 GitHub에 배포했습니다.

이제 실제 사용자로부터 피드백을 수집하고 개선해나가세요!
