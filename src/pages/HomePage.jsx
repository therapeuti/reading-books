import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import useAppStore from '../store/appStore';
import StorageModule from '../modules/storage';

/**
 * 메인 홈페이지
 */
export function HomePage() {
  const navigate = useNavigate();
  const { setBooks, isInitialized, setInitialized, setError } = useAppStore();

  useEffect(() => {
    // 앱 초기화
    const initApp = async () => {
      try {
        const storage = new StorageModule();
        await storage.init();

        const books = await storage.getAllBooks();
        setBooks(books);
        setInitialized(true);
      } catch (error) {
        console.error('앱 초기화 실패:', error);
        setError('❌ ' + error.message);
      }
    };

    if (!isInitialized) {
      initApp();
    }
  }, [isInitialized, setBooks, setInitialized, setError]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="📱 동화책 TTS 리더" />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {/* 카메라로 책 읽기 */}
          <button
            onClick={() => navigate('/camera')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 active:scale-95"
          >
            <div className="text-4xl mb-2">📷</div>
            <div className="text-xl font-bold">카메라로 책 읽기</div>
            <div className="text-sm mt-2 opacity-90">실시간으로 책 페이지를 인식하고 음성으로 읽어줍니다</div>
          </button>

          {/* 저장된 책 보기 */}
          <button
            onClick={() => navigate('/books')}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 active:scale-95"
          >
            <div className="text-4xl mb-2">📚</div>
            <div className="text-xl font-bold">저장된 책 보기</div>
            <div className="text-sm mt-2 opacity-90">저장된 책의 목록을 조회하고 재생합니다</div>
          </button>

          {/* 설정 */}
          <button
            onClick={() => navigate('/settings')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 active:scale-95"
          >
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-xl font-bold">설정</div>
            <div className="text-sm mt-2 opacity-90">음성 속도, 언어, 카메라 등을 설정합니다</div>
          </button>
        </div>

        {/* 정보 */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <div className="text-center text-gray-600 text-sm space-y-2">
            <p className="font-bold text-gray-800">동화책 자동 인식 TTS 리더</p>
            <p>v0.0.1</p>
            <p className="text-xs mt-4">
              폰 카메라로 책 페이지를 비추면 자동으로 텍스트를 인식하고<br />
              음성으로 읽어주는 어플리케이션입니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
