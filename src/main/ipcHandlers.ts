import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

export class IpcHandlers {
  static registerHandlers() {
    // Handle save file dialog
    ipcMain.handle('save-file', async (_event, dataUrl: string, defaultPath?: string) => {
      try {
        const result = await dialog.showSaveDialog({
          defaultPath,
          filters: [
            { name: 'PNG Images', extensions: ['png'] },
            { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
            { name: 'SVG Images', extensions: ['svg'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (result.canceled || !result.filePath) {
          return { success: false, canceled: true };
        }

        // Convert data URL to buffer
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Write file
        fs.writeFileSync(result.filePath, buffer);
        
        return { success: true, filePath: result.filePath };
      } catch (error: any) {
        console.error('Error saving file:', error);
        return { success: false, error: error.message };
      }
    });

    // Handle load preferences
    ipcMain.handle('load-preferences', async () => {
      try {
        const userDataPath = app.getPath('userData');
        const preferencesPath = path.join(userDataPath, 'preferences.json');
        
        if (fs.existsSync(preferencesPath)) {
          const data = fs.readFileSync(preferencesPath, 'utf8');
          return JSON.parse(data);
        }
        
        return {};
      } catch (error: any) {
        console.error('Error loading preferences:', error);
        return {};
      }
    });

    // Handle save preferences
    ipcMain.handle('save-preferences', async (_event, preferences: any) => {
      try {
        const userDataPath = app.getPath('userData');
        const preferencesPath = path.join(userDataPath, 'preferences.json');
        
        fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));
        return { success: true };
      } catch (error: any) {
        console.error('Error saving preferences:', error);
        return { success: false, error: error.message };
      }
    });

    // Handle export batch
    ipcMain.handle('export-batch', async (_event, batchData: any[]) => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory']
        });

        if (result.canceled || !result.filePaths.length) {
          return { success: false, canceled: true };
        }

        const exportDir = result.filePaths[0];
        const results = [];

        for (let i = 0; i < batchData.length; i++) {
          const item = batchData[i];
          const fileName = `qr-code-${i + 1}.png`;
          const filePath = path.join(exportDir, fileName);

          try {
            // Convert data URL to buffer
            const base64Data = item.dataUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Write file
            fs.writeFileSync(filePath, buffer);
            results.push({ success: true, filePath, name: item.name });
          } catch (error: any) {
            results.push({ success: false, error: error.message, name: item.name });
          }
        }

        return { success: true, results };
      } catch (error: any) {
        console.error('Error exporting batch:', error);
        return { success: false, error: error.message };
      }
    });
  }
}