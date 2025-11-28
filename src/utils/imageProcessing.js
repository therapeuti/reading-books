/**
 * 이미지 처리 유틸리티 함수
 */

/**
 * 이미지 압축
 * @param {Blob} imageBlob - 원본 이미지
 * @param {number} quality - 압축 품질 (0-1)
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @returns {Promise<Blob>}
 */
export async function compressImage(
  imageBlob,
  quality = 0.7,
  maxWidth = 1024,
  maxHeight = 1024
) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하면서 리사이징
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(imageBlob);
  });
}

/**
 * 썸네일 이미지 생성
 * @param {Blob} imageBlob - 원본 이미지
 * @param {number} size - 썸네일 크기
 * @returns {Promise<Blob>}
 */
export async function createThumbnail(imageBlob, size = 200) {
  return compressImage(imageBlob, 0.6, size, size);
}

/**
 * 이미지를 Canvas로 변환
 * @param {Blob} imageBlob - 이미지 Blob
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function blobToCanvas(imageBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        resolve(canvas);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Canvas를 Blob으로 변환
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} quality - 품질 (0-1)
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, quality = 0.8) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
}

/**
 * 이미지를 Data URL로 변환
 * @param {Blob} imageBlob - 이미지 Blob
 * @returns {Promise<string>}
 */
export function blobToDataURL(imageBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Data URL을 Blob으로 변환
 * @param {string} dataURL - Data URL
 * @returns {Blob}
 */
export function dataURLToBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = [];

  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }

  return new Blob([new Uint8Array(array)], { type: mime });
}

/**
 * 이미지 명암 조정
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} contrast - 명암도 (-100 ~ 100)
 * @returns {HTMLCanvasElement}
 */
export function adjustContrast(canvas, contrast = 0) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 이미지 밝기 조정
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} brightness - 밝기 (-100 ~ 100)
 * @returns {HTMLCanvasElement}
 */
export function adjustBrightness(canvas, brightness = 0) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const adjust = brightness * 2.55;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + adjust));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjust));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjust));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 이미지 그레이스케일 변환
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @returns {HTMLCanvasElement}
 */
export function toGrayscale(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
