import { useEffect } from 'react';
import useAppStore from '../../store/appStore';

/**
 * 토스트 알림 컴포넌트
 */
export function Toast() {
  const { toastMessage, clearToast } = useAppStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(clearToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const isError = toastMessage.includes('❌');
  const isSuccess = toastMessage.includes('✅');

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50">
      <div
        className={`p-4 rounded-lg shadow-lg text-white animate-bounce ${
          isError ? 'bg-red-500' : isSuccess ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}
