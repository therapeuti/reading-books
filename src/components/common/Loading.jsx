/**
 * 로딩 스피너 컴포넌트
 */
export function Loading({ message = '로딩 중...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
      </div>
      <p className="mt-4 text-gray-600 text-center">{message}</p>
    </div>
  );
}
