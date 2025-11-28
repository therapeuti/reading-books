/**
 * TTS (Text-to-Speech) 음성 합성 모듈
 */
class TTSModule {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * 텍스트를 음성으로 재생
   * @param {string} text - 재생할 텍스트
   * @param {Object} options - 옵션
   * @param {number} options.speed - 재생 속도 (0.5 ~ 2.0)
   * @param {number} options.volume - 음량 (0 ~ 100)
   * @returns {Promise<void>}
   */
  async speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // 기존 음성 중지
        this.stop();

        if (!text || text.trim() === '') {
          reject(new Error('재생할 텍스트가 없습니다.'));
          return;
        }

        // SpeechSynthesisUtterance 생성
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.lang = 'ko-KR';
        this.utterance.rate = Math.max(0.5, Math.min(2.0, options.speed || 1.0));
        this.utterance.volume = Math.max(0, Math.min(1, (options.volume || 80) / 100));
        this.utterance.pitch = 1.0;

        // 이벤트 핸들러
        this.utterance.onstart = () => {
          this.isPlaying = true;
          this.isPaused = false;
          console.log('🔊 음성 재생 시작');
        };

        this.utterance.onend = () => {
          this.isPlaying = false;
          this.isPaused = false;
          console.log('🔊 음성 재생 완료');
          resolve();
        };

        this.utterance.onerror = (event) => {
          this.isPlaying = false;
          this.isPaused = false;
          console.error('❌ 음성 재생 실패:', event.error);
          reject(new Error(`음성 재생 실패: ${event.error}`));
        };

        // 재생 시작
        this.synth.speak(this.utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 음성 재생 일시정지
   */
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPaused = true;
      console.log('⏸️ 음성 일시정지');
    }
  }

  /**
   * 음성 재생 재개
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
      console.log('▶️ 음성 재개');
    }
  }

  /**
   * 음성 재생 중지
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      console.log('⏹️ 음성 중지');
    }
  }

  /**
   * 재생 속도 설정
   * @param {number} speed - 속도 (0.5 ~ 2.0)
   */
  setSpeed(speed) {
    const validSpeed = Math.max(0.5, Math.min(2.0, speed));
    if (this.utterance) {
      this.utterance.rate = validSpeed;
    }
  }

  /**
   * 음량 설정
   * @param {number} volume - 음량 (0 ~ 100)
   */
  setVolume(volume) {
    const validVolume = Math.max(0, Math.min(1, volume / 100));
    if (this.utterance) {
      this.utterance.volume = validVolume;
    }
  }

  /**
   * 사용 가능한 한국어 음성 목록
   * @returns {SpeechSynthesisVoice[]}
   */
  getAvailableVoices() {
    return this.synth.getVoices()
      .filter(voice => voice.lang.startsWith('ko'));
  }

  /**
   * 음성 선택
   * @param {SpeechSynthesisVoice} voice - 선택할 음성
   */
  setVoice(voice) {
    if (this.utterance) {
      this.utterance.voice = voice;
    }
  }

  /**
   * 재생 중인지 확인
   * @returns {boolean}
   */
  isPlayingNow() {
    return this.isPlaying;
  }

  /**
   * 일시정지 중인지 확인
   * @returns {boolean}
   */
  isPausedNow() {
    return this.isPaused;
  }

  /**
   * 현재 설정 조회
   * @returns {Object}
   */
  getCurrentSettings() {
    return {
      speed: this.utterance?.rate || 1.0,
      volume: (this.utterance?.volume || 0.8) * 100,
      pitch: this.utterance?.pitch || 1.0,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused
    };
  }
}

export default TTSModule;
