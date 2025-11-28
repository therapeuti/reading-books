import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import useAppStore from '../store/appStore';
import CameraModule from '../modules/camera';
import OCRModule from '../modules/ocr';
import TTSModule from '../modules/tts';
import StorageModule from '../modules/storage';
import { OCR_MIN_CONFIDENCE } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

/**
 * 카메라 페이지
 */
export function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [bookTitle, setBookTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { setToast, setError, setIsPlaying, ttsSpeed, ttsVolume, preferences } = useAppStore();

  const cameraModule = useRef(new CameraModule());
  const ocrModule = useRef(new OCRModule());
  const ttsModule = useRef(new TTSModule());
  const storageModule = useRef(new StorageModule());

  // 초기화
  useEffect(() => {
    const initModules = async () => {
      try {
        // 카메라 초기화
        await cameraModule.current.init('video');
        setCameraReady(true);

        // OCR 초기화
        await ocrModule.current.init();

        // 저장소 초기화
        await storageModule.current.init();

        setToast('✅ 모든 모듈 준비 완료');
      } catch (error) {
        console.error('초기화 실패:', error);
        setError('❌ ' + error.message);
      }
    };

    initModules();

    return () => {
      cameraModule.current.stop();
      ocrModule.current.terminate();
      ttsModule.current.stop();
    };
  }, [setToast, setError]);

  // 사진 캡처 및 OCR
  const handleCapture = async () => {
    if (!cameraReady) {
      setError('❌ 카메라가 준비되지 않았습니다');
      return;
    }

    setIsCapturing(true);

    try {
      // 사진 캡처
      const imageBlob = await cameraModule.current.captureFrameAsBlob();

      // OCR 실행
      const result = await ocrModule.current.extractText(imageBlob);

      setExtractedText(result.text);
      setConfidence(result.confidence);

      if (result.confidence < OCR_MIN_CONFIDENCE) {
        setToast(`⚠️ 신뢰도가 낮습니다 (${result.confidence}%)`);
      } else {
        // TTS 자동 재생
        if (preferences.ttsAutoPlay) {
          setIsPlaying(true);
          await ttsModule.current.speak(result.text, {
            speed: ttsSpeed,
            volume: ttsVolume
          });
          setIsPlaying(false);
        }

        setShowSaveDialog(true);
      }
    } catch (error) {
      console.error('캡처/OCR 실패:', error);
      setError('❌ ' + error.message);
    } finally {
      setIsCapturing(false);
    }
  };

  // 텍스트 재생
  const handlePlay = async () => {
    if (!extractedText) {
      setError('❌ 재생할 텍스트가 없습니다');
      return;
    }

    try {
      setIsPlaying(true);
      await ttsModule.current.speak(extractedText, {
        speed: ttsSpeed,
        volume: ttsVolume
      });
      setIsPlaying(false);
    } catch (error) {
      console.error('음성 재생 실패:', error);
      setError('❌ ' + error.message);
      setIsPlaying(false);
    }
  };

  // 책 저장
  const handleSaveBook = async () => {
    if (!bookTitle.trim()) {
      setError('❌ 책 제목을 입력해주세요');
      return;
    }

    try {
      const imageBlob = await cameraModule.current.captureFrameAsBlob();

      // 책 저장
      const bookId = await storageModule.current.saveBook({
        title: bookTitle,
        author: '미상',
        coverImage: imageBlob,
        totalPages: 1,
        pages: []
      });

      // 페이지 저장
      await storageModule.current.savePage({
        bookId: bookId,
        pageNumber: 1,
        originalImage: imageBlob,
        thumbnailImage: imageBlob,
        originalText: extractedText,
        ocrConfidence: confidence
      });

      setToast('✅ 책이 저장되었습니다');
      setShowSaveDialog(false);
      setExtractedText('');
      setBookTitle('');
      setConfidence(0);
    } catch (error) {
      console.error('책 저장 실패:', error);
      setError('❌ ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header title="📷 카메라로 책 읽기" showBack={true} />

      <main className="p-4">
        {!cameraReady ? (
          <Loading message="카메라 준비 중..." />
        ) : (
          <div className="space-y-4">
            {/* 비디오 요소 */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                id="video"
                className="w-full aspect-video object-cover"
              />
            </div>

            {/* 신뢰도 표시 */}
            {confidence > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">인식 신뢰도</span>
                  <span className={`font-bold ${confidence >= OCR_MIN_CONFIDENCE ? 'text-green-400' : 'text-orange-400'}`}>
                    {confidence}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${confidence >= OCR_MIN_CONFIDENCE ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            )}

            {/* 추출된 텍스트 */}
            {extractedText && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-gray-400 mb-2">추출된 텍스트</h3>
                <p className="text-gray-200 text-sm leading-relaxed max-h-40 overflow-y-auto">
                  {extractedText}
                </p>
              </div>
            )}

            {/* 제어 버튼 */}
            <div className="space-y-3">
              {!extractedText ? (
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCapturing ? '처리 중...' : '📸 사진 촬영 및 인식'}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    variant="secondary"
                  >
                    🔊 음성으로 읽어주기
                  </Button>

                  <Button
                    onClick={() => setShowSaveDialog(true)}
                    size="lg"
                    variant="primary"
                  >
                    💾 책으로 저장
                  </Button>

                  <Button
                    onClick={() => {
                      setExtractedText('');
                      setConfidence(0);
                    }}
                    size="lg"
                    variant="ghost"
                  >
                    ↺ 다시 촬영
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 책 저장 다이얼로그 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">책 저장</h2>

            <input
              type="text"
              placeholder="책 제목을 입력해주세요"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="space-y-3">
              <Button
                onClick={handleSaveBook}
                size="lg"
                variant="primary"
              >
                저장
              </Button>

              <Button
                onClick={() => setShowSaveDialog(false)}
                size="lg"
                variant="ghost"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
