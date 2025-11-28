/**
 * 카메라 접근 및 프레임 캡처 모듈
 */
class CameraModule {
  constructor() {
    this.mediaStream = null;
    this.videoElement = null;
  }

  /**
   * 카메라 초기화
   * @param {string} videoElementId - video 태그의 ID
   * @returns {Promise<boolean>}
   */
  async init(videoElementId) {
    try {
      this.videoElement = document.getElementById(videoElementId);

      if (!this.videoElement) {
        throw new Error(`Element with id "${videoElementId}" not found`);
      }

      // 카메라 접근 권한 요청
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // 스트림을 video 요소에 연결
      this.videoElement.srcObject = this.mediaStream;

      console.log('✅ 카메라 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ 카메라 접근 실패:', error);

      if (error.name === 'NotAllowedError') {
        throw new Error('카메라 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('카메라 장치를 찾을 수 없습니다.');
      } else {
        throw error;
      }
    }
  }

  /**
   * 현재 프레임을 Canvas로 캡처
   * @returns {HTMLCanvasElement}
   */
  captureFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0);

    return canvas;
  }

  /**
   * 현재 프레임을 Blob으로 캡처
   * @param {number} quality - 이미지 품질 (0-1)
   * @returns {Promise<Blob>}
   */
  async captureFrameAsBlob(quality = 0.8) {
    const canvas = this.captureFrame();
    return new Promise(resolve => {
      canvas.toBlob(
        blob => resolve(blob),
        'image/jpeg',
        quality
      );
    });
  }

  /**
   * 카메라 중지
   */
  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
      console.log('✅ 카메라 중지됨');
    }
  }

  /**
   * 카메라 활성 상태 확인
   * @returns {boolean}
   */
  isActive() {
    return this.mediaStream !== null;
  }
}

export default CameraModule;
