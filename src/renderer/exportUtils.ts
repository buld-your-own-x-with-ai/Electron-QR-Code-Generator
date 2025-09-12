// Utility functions for exporting QR codes

export class ExportUtils {
  /**
   * Convert a canvas to a data URL
   */
  static canvasToDataUrl(canvas: HTMLCanvasElement, format: 'png' | 'jpg' | 'svg' = 'png'): string {
    switch (format) {
      case 'png':
        return canvas.toDataURL('image/png');
      case 'jpg':
        return canvas.toDataURL('image/jpeg');
      case 'svg':
        // For SVG, we would need to get the SVG element directly
        // This is a placeholder implementation
        return canvas.toDataURL('image/png');
      default:
        return canvas.toDataURL('image/png');
    }
  }

  /**
   * Draw logo on canvas
   */
  static async drawLogoOnCanvas(canvas: HTMLCanvasElement, logo: string | null, logoSize: number): Promise<void> {
    // If no logo, resolve immediately
    if (!logo) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      console.log('Drawing logo on canvas:', { logo: logo.substring(0, 50) + '...', logoSize });
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          console.log('Logo image loaded successfully:', { 
            width: img.width, 
            height: img.height,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
          });
          
          const logoWidth = Math.min(canvas.width * logoSize, canvas.width * 0.5);
          const logoHeight = (img.height / img.width) * logoWidth;
          const logoX = (canvas.width - logoWidth) / 2;
          const logoY = (canvas.height - logoHeight) / 2;
          
          console.log('Drawing logo with dimensions:', { logoX, logoY, logoWidth, logoHeight });
          
          ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
          console.log('Logo drawn successfully');
          resolve();
        } catch (error) {
          console.error('Error drawing logo on canvas:', error);
          resolve();
        }
      };
      
      img.onerror = (error) => {
        console.error('Failed to load logo image:', logo.substring(0, 100) + '...', error);
        resolve();
      };
      
      // Set crossOrigin to anonymous to handle CORS issues
      img.crossOrigin = 'anonymous';
      img.src = logo;
    });
  }

  /**
   * Convert QR code canvas to data URL with logo
   */
  static async canvasToDataUrlWithLogo(canvas: HTMLCanvasElement, logo: string | null, logoSize: number, format: 'png' | 'jpg' | 'svg' = 'png'): Promise<string> {
    console.log('Converting canvas to data URL with logo:', { logo: !!logo, logoSize, format });
    
    // Create a copy of the canvas to avoid modifying the original
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Copy the original canvas
      tempCtx.drawImage(canvas, 0, 0);
      console.log('Original canvas copied to temporary canvas');
      
      // Draw logo if available
      if (logo) {
        console.log('Drawing logo on temporary canvas');
        await this.drawLogoOnCanvas(tempCanvas, logo, logoSize);
      }
    } else {
      console.error('Failed to get temporary canvas context');
    }
    
    // Convert to data URL
    let dataUrl: string;
    switch (format) {
      case 'png':
        dataUrl = tempCanvas.toDataURL('image/png');
        break;
      case 'jpg':
        dataUrl = tempCanvas.toDataURL('image/jpeg');
        break;
      case 'svg':
        // For SVG, we would need to get the SVG element directly
        // This is a placeholder implementation
        dataUrl = tempCanvas.toDataURL('image/png');
        break;
      default:
        dataUrl = tempCanvas.toDataURL('image/png');
    }
    
    console.log('Canvas converted to data URL:', dataUrl.substring(0, 100) + '...');
    return dataUrl;
  }

  /**
   * Trigger a file download
   */
  static downloadFile(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Save file through Electron IPC
   */
  static async saveFileThroughIPC(dataUrl: string, defaultPath?: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // @ts-ignore
      const result = await window.electronAPI.invoke('save-file', dataUrl, defaultPath);
      return result;
    } catch (error: any) {
      console.error('Error saving file through IPC:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export batch through Electron IPC
   */
  static async exportBatchThroughIPC(batchData: any[]): Promise<{ success: boolean; results?: any[]; error?: string }> {
    try {
      // @ts-ignore
      const result = await window.electronAPI.invoke('export-batch', batchData);
      return result;
    } catch (error: any) {
      console.error('Error exporting batch through IPC:', error);
      return { success: false, error: error.message };
    }
  }
}