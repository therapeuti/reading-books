import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import useAppStore from '../store/appStore';
import StorageModule from '../modules/storage';

/**
 * 저장된 책 목록 페이지
 */
export function BookListPage() {
  const navigate = useNavigate();
  const { books, setBooks, setToast, setError } = useAppStore();
  const storage = new StorageModule();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        await storage.init();
        const allBooks = await storage.getAllBooks();
        setBooks(allBooks);
      } catch (error) {
        console.error('책 목록 로드 실패:', error);
        setError('❌ ' + error.message);
      }
    };

    loadBooks();
  }, []);

  const handleDelete = async (bookId) => {
    if (!window.confirm('이 책을 삭제하시겠습니까?')) return;

    try {
      await storage.init();
      await storage.deleteBook(bookId);

      const allBooks = await storage.getAllBooks();
      setBooks(allBooks);

      setToast('✅ 책이 삭제되었습니다');
    } catch (error) {
      console.error('책 삭제 실패:', error);
      setError('❌ ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="📚 저장된 책" showBack={true} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-600 text-lg mb-6">저장된 책이 없습니다.</p>
            <Button
              onClick={() => navigate('/camera')}
              size="lg"
              variant="primary"
            >
              카메라로 책 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {books.map((book) => (
              <div
                key={book.bookId}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="flex gap-4">
                  {/* 표지 이미지 */}
                  {book.coverImage && (
                    <div className="w-24 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={typeof book.coverImage === 'string' ? book.coverImage : URL.createObjectURL(book.coverImage)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* 정보 */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      저자: {book.author || '미상'}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      📄 {book.pages?.length || 0}페이지
                    </p>

                    {/* 버튼 */}
                    <div className="space-x-2">
                      <Button
                        onClick={() => navigate(`/books/${book.bookId}`)}
                        size="sm"
                        variant="primary"
                      >
                        읽어주기
                      </Button>

                      <Button
                        onClick={() => handleDelete(book.bookId)}
                        size="sm"
                        variant="danger"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
