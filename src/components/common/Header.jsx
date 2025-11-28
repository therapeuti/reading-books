import { useNavigate } from 'react-router-dom';

/**
 * 공통 헤더 컴포넌트
 */
export function Header({ title, showBack = false }) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="text-2xl hover:bg-gray-100 p-2 rounded-lg transition"
            aria-label="뒤로가기"
          >
            ◀
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-800 flex-1">
          {title}
        </h1>
      </div>
    </header>
  );
}
