import { Menu, MenuItemConstructorOptions, app, shell } from 'electron';

export class AppMenu {
  static createMenu(): Menu {
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New QR Code',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              // TODO: Implement new QR code functionality
            }
          },
          {
            label: 'Open...',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              // TODO: Implement open functionality
            }
          },
          {
            label: 'Save...',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              // TODO: Implement save functionality
            }
          },
          {
            label: 'Save As...',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              // TODO: Implement save as functionality
            }
          },
          {
            label: 'Export Batch...',
            click: () => {
              // TODO: Implement batch export functionality
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { role: 'resetZoom' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Tools',
        submenu: [
          {
            label: 'Customize QR Code',
            click: () => {
              // TODO: Implement customize QR code functionality
            }
          },
          {
            label: 'Add Logo',
            click: () => {
              // TODO: Implement add logo functionality
            }
          },
          {
            label: 'Batch Generation',
            click: () => {
              // TODO: Implement batch generation functionality
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            click: () => {
              // TODO: Implement preferences functionality
            }
          }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          { role: 'toggleDevTools' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: async () => {
              await shell.openExternal('https://github.com');
            }
          },
          {
            label: 'Report Issue',
            click: async () => {
              await shell.openExternal('https://github.com');
            }
          },
          { type: 'separator' },
          {
            label: 'About',
            click: () => {
              // TODO: Implement about dialog
            }
          }
        ]
      }
    ];

    return Menu.buildFromTemplate(template);
  }
}