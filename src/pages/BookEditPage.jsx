import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import useAppStore from '../store/appStore';
import StorageModule from '../modules/storage';

/**
 * 페이지 텍스트 편집 페이지
 * 추출된 텍스트를 수정하고 저장할 수 있습니다
 */
export function BookEditPage() {
  const navigate = useNavigate();
  const { bookId, pageId } = useParams();
  const { currentBook } = useAppStore();

  const [pageData, setPageData] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 페이지 데이터 로드
  useEffect(() => {
    const loadPageData = async () => {
      try {
        const storage = new StorageModule();
        await storage.init();
        const page = await storage.getPage(pageId);

        if (page) {
          setPageData(page);
          setEditedText(page.editedText || page.originalText || '');
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load page data:', error);
        setLoading(false);
      }
    };

    loadPageData();
  }, [pageId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const storage = new StorageModule();
      await storage.init();

      await storage.updatePageText(pageId, editedText);

      // 성공 토스트 표시 (실제로는 useAppStore의 toastMessage 사용)
      navigate(`/books/${bookId}`);
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('페이지 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/books/${bookId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="페이지 편집" showBack={true} />
        <Loading message="페이지 로드 중..." />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header title="페이지 편집" showBack={true} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">페이지를 찾을 수 없습니다.</p>
            <Button
              variant="primary"
              onClick={() => navigate(`/books/${bookId}`)}
            >
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header title="페이지 편집" showBack={true} />

      <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full gap-4">

        {/* 페이지 정보 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              페이지 {pageData.pageNumber || 'N/A'}
            </h2>
            {pageData.confidence && (
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                pageData.confidence >= 60
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                신뢰도: {Math.round(pageData.confidence)}%
              </span>
            )}
          </div>
        </div>

        {/* 페이지 미리보기 이미지 */}
        {pageData.imageBlob && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">페이지 이미지</p>
            <img
              src={URL.createObjectURL(pageData.imageBlob)}
              alt={`Page ${pageData.pageNumber}`}
              className="w-full max-h-64 object-cover rounded"
            />
          </div>
        )}

        {/* 원본 텍스트 (읽기 전용) */}
        {pageData.originalText && (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">원본 추출 텍스트</p>
            <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm leading-relaxed max-h-32 overflow-y-auto">
              {pageData.originalText}
            </div>
          </div>
        )}

        {/* 텍스트 편집 영역 */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">편집된 텍스트</p>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="여기에 텍스트를 입력하거나 수정하세요..."
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800"
          />
          <p className="text-xs text-gray-500 mt-2">
            글자 수: {editedText.length}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !editedText.trim()}
            className="flex-1"
          >
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
