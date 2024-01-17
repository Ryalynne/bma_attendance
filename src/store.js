const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

ipcMain.handle('saveJsonData', (event, data) => {
  const savePath = path.join(app.getPath('userData'), 'data.json');
  try {
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving JSON file:', error);
    return false;
  }
});