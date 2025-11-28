import { useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import useAppStore from '../store/appStore';
import StorageModule from '../modules/storage';

/**
 * 설정 페이지
 */
export function SettingsPage() {
  const { preferences, setPreferences, updatePreference, setToast } = useAppStore();
  const storage = new StorageModule();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        await storage.init();
        const prefs = await storage.getPreferences();
        if (prefs) {
          setPreferences(prefs);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    try {
      await storage.init();
      await storage.savePreferences(preferences);
      setToast('✅ 설정이 저장되었습니다');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setToast('❌ 설정 저장에 실패했습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="⚙️ 설정" showBack={true} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 언어 설정 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">언어 설정</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">UI 언어</label>
                <select
                  value={preferences.uiLanguage}
                  onChange={(e) => updatePreference('uiLanguage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">TTS 음성 언어</label>
                <select
                  value={preferences.ttsLanguage}
                  onChange={(e) => updatePreference('ttsLanguage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </section>

          {/* TTS 설정 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">음성 설정</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold">재생 속도</label>
                  <span className="text-sm font-bold">{preferences.ttsSpeed?.toFixed(1) || 1}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={preferences.ttsSpeed || 1}
                  onChange={(e) => updatePreference('ttsSpeed', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold">음량</label>
                  <span className="text-sm font-bold">{preferences.ttsVolume || 80}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={preferences.ttsVolume || 80}
                  onChange={(e) => updatePreference('ttsVolume', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPlay"
                  checked={preferences.ttsAutoPlay !== false}
                  onChange={(e) => updatePreference('ttsAutoPlay', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="autoPlay" className="ml-3 text-sm font-bold cursor-pointer">
                  텍스트 인식 후 자동 재생
                </label>
              </div>
            </div>
          </section>

          {/* 카메라 설정 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">카메라 설정</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">해상도</label>
                <select
                  value={preferences.cameraResolution || '1080p'}
                  onChange={(e) => updatePreference('cameraResolution', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold">페이지 감지 민감도</label>
                  <span className="text-sm font-bold">{preferences.pageSensitivity || 50}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={preferences.pageSensitivity || 50}
                  onChange={(e) => updatePreference('pageSensitivity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* 피드백 설정 */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">피드백</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vibration"
                  checked={preferences.vibrationEnabled !== false}
                  onChange={(e) => updatePreference('vibrationEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="vibration" className="ml-3 text-sm font-bold cursor-pointer">
                  진동 피드백
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sound"
                  checked={preferences.soundEnabled !== false}
                  onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="sound" className="ml-3 text-sm font-bold cursor-pointer">
                  음향 신호
                </label>
              </div>
            </div>
          </section>

          {/* 저장 버튼 */}
          <Button
            onClick={handleSave}
            size="lg"
            variant="primary"
          >
            💾 설정 저장
          </Button>
        </div>
      </main>
    </div>
  );
}
