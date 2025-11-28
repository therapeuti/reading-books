/**
 * OCR (광학 문자 인식) 모듈
 */
import Tesseract from 'tesseract.js';

class OCRModule {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  /**
   * OCR 초기화 (Worker 생성)
   * @returns {Promise<void>}
   */
  async init() {
    try {
      if (this.isInitialized) return;

      console.log('🔄 OCR 초기화 중...');
      this.worker = await Tesseract.createWorker('kor');
      this.isInitialized = true;
      console.log('✅ OCR 초기화 완료');
    } catch (error) {
      console.error('❌ OCR 초기화 실패:', error);
      throw new Error('OCR 초기화에 실패했습니다.');
    }
  }

  /**
   * 이미지에서 텍스트 추출
   * @param {Blob|HTMLCanvasElement} image - 입력 이미지
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async extractText(image) {
    if (!this.isInitialized) {
      throw new Error('OCR이 초기화되지 않았습니다. init()을 호출하세요.');
    }

    try {
      console.log('🔄 텍스트 추출 중...');
      const result = await this.worker.recognize(image);

      // 신뢰도 계산
      let confidence = 0;
      if (result.data.confidence) {
        confidence = Math.round(result.data.confidence);
      } else if (result.data.words && result.data.words.length > 0) {
        confidence = Math.round(
          result.data.words.reduce((sum, word) => sum + (word.confidence || 0), 0) /
          result.data.words.length
        );
      }

      const text = result.data.text.trim();

      console.log(`✅ 텍스트 추출 완료 (신뢰도: ${confidence}%)`);

      return {
        text: text,
        confidence: Math.min(Math.max(confidence, 0), 100)
      };
    } catch (error) {
      console.error('❌ 텍스트 추출 실패:', error);
      throw new Error('텍스트 인식에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * Worker 종료
   * @returns {Promise<void>}
   */
  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        this.worker = null;
        this.isInitialized = false;
        console.log('✅ OCR Worker 종료됨');
      } catch (error) {
        console.error('❌ OCR Worker 종료 실패:', error);
      }
    }
  }
}

export default OCRModule;
