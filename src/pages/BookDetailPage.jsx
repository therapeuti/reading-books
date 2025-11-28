import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import useAppStore from '../store/appStore';
import StorageModule from '../modules/storage';
import TTSModule from '../modules/tts';

/**
 * 책 상세 조회 및 재생 페이지
 */
export function BookDetailPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const { setToast, setError, isPlaying, setIsPlaying, ttsSpeed, ttsVolume } = useAppStore();

  const ttsModule = useRef(new TTSModule());
  const storageModule = useRef(new StorageModule());

  // 책 및 페이지 로드
  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        await storageModule.current.init();

        const bookData = await storageModule.current.getBook(bookId);
        if (!bookData) {
          setError('❌ 책을 찾을 수 없습니다');
          navigate('/books');
          return;
        }

        const pagesList = await storageModule.current.getPagesByBook(bookId);

        setBook(bookData);
        setPages(pagesList);
        setToast('✅ 책이 로드되었습니다');
      } catch (error) {
        console.error('책 로드 실패:', error);
        setError('❌ ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId, navigate, setToast, setError]);

  // 현재 페이지 데이터
  const currentPage = pages[currentPageIdx];

  // 음성 재생
  const handlePlay = async () => {
    if (!currentPage) {
      setError('❌ 재생할 페이지가 없습니다');
      return;
    }

    try {
      const text = currentPage.editedText || currentPage.originalText;
      setIsPlaying(true);
      await ttsModule.current.speak(text, {
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

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (currentPageIdx < pages.length - 1) {
      setCurrentPageIdx(currentPageIdx + 1);
      ttsModule.current.stop();
    }
  };

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(currentPageIdx - 1);
      ttsModule.current.stop();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="책 상세" showBack={true} />
        <Loading message="책을 불러오는 중..." />
      </div>
    );
  }

  if (!book || pages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="책 상세" showBack={true} />
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">페이지가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={book.title} showBack={true} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 책 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            {book.coverImage && (
              <img
                src={typeof book.coverImage === 'string' ? book.coverImage : URL.createObjectURL(book.coverImage)}
                alt={book.title}
                className="w-32 h-48 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
              <p className="text-gray-600 mb-1">저자: {book.author}</p>
              <p className="text-gray-600 mb-1">출판사: {book.publisher || '미지정'}</p>
              <p className="text-gray-600">총 {pages.length}페이지</p>
            </div>
          </div>
        </div>

        {/* 페이지 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">페이지 {currentPageIdx + 1} / {pages.length}</h3>
            {currentPage.ocrConfidence > 0 && (
              <span className={`text-sm font-bold ${currentPage.ocrConfidence >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                신뢰도: {currentPage.ocrConfidence}%
              </span>
            )}
          </div>

          {/* 페이지 이미지 */}
          {currentPage.originalImage && (
            <div className="mb-6">
              <img
                src={typeof currentPage.originalImage === 'string' ? currentPage.originalImage : URL.createObjectURL(currentPage.originalImage)}
                alt={`Page ${currentPage.pageNumber}`}
                className="w-full rounded-lg max-h-96 object-cover"
              />
            </div>
          )}

          {/* 텍스트 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {currentPage.editedText || currentPage.originalText}
            </p>
          </div>

          {/* 제어 버튼 */}
          <div className="space-y-3">
            <Button
              onClick={handlePlay}
              disabled={isPlaying}
              size="lg"
              variant="secondary"
            >
              {isPlaying ? '음성 재생 중...' : '🔊 음성으로 읽어주기'}
            </Button>

            <Button
              onClick={() => navigate(`/books/${bookId}/pages/${currentPage.pageId}/edit`)}
              size="lg"
              variant="ghost"
            >
              ✏️ 텍스트 수정
            </Button>
          </div>

          {/* 페이지 네비게이션 */}
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handlePrevPage}
              disabled={currentPageIdx === 0}
              variant="ghost"
            >
              ◀ 이전
            </Button>

            <div className="flex-1 flex items-center justify-center">
              <input
                type="range"
                min="0"
                max={pages.length - 1}
                value={currentPageIdx}
                onChange={(e) => {
                  setCurrentPageIdx(parseInt(e.target.value));
                  ttsModule.current.stop();
                }}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleNextPage}
              disabled={currentPageIdx === pages.length - 1}
              variant="ghost"
            >
              다음 ▶
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
