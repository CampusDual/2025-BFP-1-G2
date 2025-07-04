import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCompressionService {

  constructor() { }

  /**
   * Comprime una imagen y la convierte a base64
   * @param file - Archivo de imagen
   * @param maxWidth - Ancho máximo (default: 800)
   * @param maxHeight - Alto máximo (default: 600)
   * @param quality - Calidad de compresión (0.1 - 1.0, default: 0.8)
   * @returns Promise con la imagen comprimida en base64
   */
  async compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo el aspect ratio
        const { width, height } = this.calculateNewDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Dibujar la imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con compresión
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } else {
          reject(new Error('No se pudo obtener el contexto del canvas'));
        }
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      // Leer el archivo como data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convierte un archivo PDF a base64
   * @param file - Archivo PDF
   * @returns Promise con el PDF en base64
   */
  async convertPDFToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo PDF'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprime específicamente un logo
   * @param file - Archivo de imagen del logo
   * @returns Promise con la imagen comprimida en base64
   */
  async compressLogo(file: File): Promise<string> {
    // Para logos usamos dimensiones más pequeñas
    return this.compressImage(file, 400, 400, 0.9);
  }

  /**
   * Calcula las nuevas dimensiones manteniendo el aspect ratio
   */
  private calculateNewDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Si la imagen es más grande que los límites, redimensionar
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;

      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        height = maxHeight;
        width = height * aspectRatio;
      }

      // Asegurarse de que ninguna dimensión exceda los límites
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Valida que el archivo sea una imagen válida
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPEG, JPG, PNG, WEBP'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 10MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Valida que el archivo sea un PDF válido
   */
  validatePDFFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['application/pdf'];
    const maxSize = 15 * 1024 * 1024; // 15MB para PDFs

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no válido. Solo se permiten archivos PDF'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Máximo 15MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Obtiene información del archivo
   */
  getFileInfo(file: File): { name: string; size: string; type: string } {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      name: file.name,
      size: `${sizeInMB} MB`,
      type: file.type
    };
  }
}
