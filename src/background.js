'use strict'

// import { app, protocol, BrowserWindow, ipcMain } from 'electron'
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
// const sqlite3 = require('sqlite3');
// const path = require('path');
// const fs = require('fs');
// const isDevelopment = process.env.NODE_ENV !== 'production'

import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const sqlite3 = require('sqlite3');
const isDevelopment = process.env.NODE_ENV !== 'production';
const fs = require('fs');
const path = require('path');

// Path to the SQLite database file
const dbPath = path.join(__dirname, 'database.db')
//const dbPath = './database1.db'; // Replace with the actual path to your database file

const db = new sqlite3.Database(dbPath);

if (!fs.existsSync(dbPath)) {
  db.exec(`
      CREATE TABLE IF NOT EXISTS Employee_account (id INTEGER PRIMARY KEY AUTOINCREMENT, Firstname TEXT, Lastname TEXT, Department_name TEXT, Position TEXT, Email TEXT, is_Active INTEGER);
      CREATE TABLE IF NOT EXISTS Student_account (id INTEGER PRIMARY KEY, username TEXT, First_name TEXT, Last_name TEXT, Course TEXT, is_Active INTEGER);
      CREATE TABLE IF NOT EXISTS Employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, Employee_id INTEGER NOT NULL, Time_in TEXT, Time_out TEXT, is_Sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS Student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, Student_id INTEGER NOT NULL, Time_in TEXT, Time_out TEXT, is_Sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);

      INSERT INTO Employee_account (Firstname, Lastname, Department_name, Position, Email, is_Active) VALUES ('John', 'Doe', 'IT', 'Developer', 'john.doe@example.com', 1);
      INSERT INTO Student_account (username, First_name, Last_name, Course, is_Active) VALUES ('student1', 'Alice', 'Smith', 'Computer Science', 1);
    `, function (err) {
    if (err) {
      console.error('Error creating tables and inserting data:', err.message);
    } else {
      console.log('Tables created and data inserted successfully.');
    }
    // Close the database connection after completing operations
    db.close();
    const db = new sqlite3.Database(dbPath);
  });
}


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  // Check if the database file exists
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


ipcMain.on('insert-attendance', (event, data) => {
  const { QRCODE, TIME } = data.body;
  const handleError = (errorMessage) => {
    res.status(500).send(errorMessage);
  };

  db.get('SELECT * FROM Employee_account WHERE email = ?', [QRCODE], (err, employeeRow) => {

    if (err) {
      return handleError(err.message);
    }

    if (employeeRow) {
      const employeeId = employeeRow.id;
      const currentDate = new Date().toISOString().slice(0, 10); // This will get the date in YYYY-MM-DD format
      db.get('SELECT * FROM Employee_attendance WHERE Time_out is null AND Employee_id = ? AND Time_in LIKE ?  ', [employeeId, currentDate + '%'], (err, employeeAttendance) => {
        if (err) {
          return handleError(err.message);
        }

        if (employeeAttendance) {
          const attendanceId = employeeAttendance.id;
          // Update time_out for existing attendance
          db.run('UPDATE Employee_attendance SET Time_out = ? WHERE id = ? AND Time_in LIKE ?', [TIME, attendanceId, currentDate + '%'], function (err) {
            if (err) {
              return handleError(err.message);
            }
            res.send('Data updated successfully');
          });
        } else {
          // Insert new attendance record
          db.run('INSERT INTO Employee_attendance (Employee_id, Time_in) VALUES (?, ?)', [employeeId, TIME], function (err) {
            if (err) {
              return handleError(err.message);
            }
            res.send('Data inserted successfully');
          });
        }
      });
    } else {
      const currentDate = new Date().toISOString().slice(0, 10); // This will get the date in YYYY-MM-DD format
      db.get('SELECT * FROM Employee_attendance WHERE Time_out is null AND Employee_id = ? AND Time_in LIKE ? ', [QRCODE, currentDate + '%'], (err, studentAttendance) => {
        if (err) {
          return handleError(err.message);
        }

        if (studentAttendance) {
          const attendanceId = studentAttendance.id;
          // Update time_out for existing attendance
          db.run('UPDATE Student_attendance SET Time_out = ? WHERE id = ? AND Time_in LIKE ?', [TIME, attendanceId, currentDate + '%'], function (err) {
            if (err) {
              return handleError(err.message);
            }
            res.send('Data updated successfully');
          });
        } else {
          const attendanceId = studentAttendance.id;
          db.run('INSERT INTO Student_attendance (Student_id, Time_in) VALUES (?, ?)', [attendanceId, TIME], function (err) {
            if (err) {
              return handleError(err.message);
            }
            res.send('Data inserted successfully');
          });
        }
      });
    }
  });
});


ipcMain.on('get-employee-data', (event) => {
  db.all('SELECT * FROM Employee_account', (err, rows) => {
    if (err) {
      console.error('Error fetching employee data', err.message);
      event.reply('employee-data-reply', 'Error fetching employee data');
    } else {
      event.reply('employee-data-reply', JSON.stringify(rows));
    }
  });
});


// 'use strict';

// import { app, protocol, ipcMain, BrowserWindow } from 'electron';
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
// const sqlite3 = require('sqlite3');
// const isDevelopment = process.env.NODE_ENV !== 'production';
// const fs = require('fs');
// const path = require('path');

// // Path to the SQLite database file
// const dbPath = path.join(app.getPath('userData'), 'database.db');

// // Declare db variable at the top level
// let db;

// // Check if the database file exists, and initialize if not
// if (!fs.existsSync(dbPath)) {
//   initializeDatabase();
// }

// // Register schemes as privileged
// protocol.registerSchemesAsPrivileged([
//   { scheme: 'app', privileges: { secure: true, standard: true } },
// ]);

// // Create the main Electron window
// async function createWindow() {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
//       contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
//     },
//   });

//   if (process.env.WEBPACK_DEV_SERVER_URL) {
//     await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
//     if (!process.env.IS_TEST) win.webContents.openDevTools();
//   } else {
//     createProtocol('app');
//     win.loadURL('app://./index.html');
//   }
// }

// // Quit when all windows are closed (except on macOS)
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// // Create a new window when activating the app (on macOS)
// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow();
// });

// // App ready event handler
// app.on('ready', async () => {
//   // Install Vue Devtools in development mode
//   if (isDevelopment && !process.env.IS_TEST) {
//     try {
//       await installExtension(VUEJS3_DEVTOOLS);
//     } catch (e) {
//       console.error('Vue Devtools failed to install:', e.toString());
//     }
//   }

//   // Create the main window
//   createWindow();
// });

// // Handle graceful exit in development mode
// if (isDevelopment) {
//   if (process.platform === 'win32') {
//     process.on('message', (data) => {
//       if (data === 'graceful-exit') {
//         app.quit();
//       }
//     });
//   } else {
//     process.on('SIGTERM', () => {
//       app.quit();
//     });
//   }
// }

// // IPC event handler for inserting attendance
// ipcMain.on('insert-attendance', (event, data) => {
//   const { QRCODE, TIME } = data;
//   const handleError = (errorMessage) => {
//     event.reply('insert-attendance-reply', errorMessage);
//   };

//   db.get('SELECT * FROM Employee_account WHERE email = ?', [QRCODE], (err, employeeRow) => {
//     // Rest of your code...
//   });
// });

// ipcMain.on('get-employee-data', (event) => {
//   const db = new sqlite3.Database(dbPath);

//   // Query to select all rows from the Employee_account table
//   const query = 'SELECT * FROM Employee_account';

//   db.all(query, (err, rows) => {
//     db.close();

//     if (err) {
//       console.error(err.message);
//       event.reply('employee-data-reply', 'Error fetching employee data');
//     } else {
//       console.log('Employee data from database:', rows);
//       event.reply('employee-data-reply', JSON.stringify(rows));
//     }
//   });
// });

// // Function to initialize the SQLite database
// function initializeDatabase() {
//   db = new sqlite3.Database(dbPath);

//   db.serialize(() => {
//     // Create tables
//     db.run('CREATE TABLE IF NOT EXISTS Employee_account (id INTEGER PRIMARY KEY AUTOINCREMENT, Firstname TEXT, Lastname TEXT, Department_name TEXT, Position TEXT, Email TEXT, is_Active INTEGER)');
//     db.run('CREATE TABLE IF NOT EXISTS Student_account (id INTEGER PRIMARY KEY, username TEXT, First_name TEXT, Last_name TEXT, Course TEXT, is_Active INTEGER)');
//     db.run('CREATE TABLE IF NOT EXISTS Employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, Employee_id INTEGER NOT NULL, Time_in TEXT, Time_out TEXT, is_Sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
//     db.run('CREATE TABLE IF NOT EXISTS Student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, Student_id INTEGER NOT NULL, Time_in TEXT, Time_out TEXT, is_Sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');

//     // Insert data into Employee_account table
//     const employeeData = ['John', 'Doe', 'IT', 'Developer', 'john.doe@example.com', 1];
//     db.run('INSERT INTO Employee_account (Firstname, Lastname, Department_name, Position, Email, is_Active) VALUES (?, ?, ?, ?, ?, ?)', employeeData, function (err) {
//       if (err) {
//         console.error('Error inserting into Employee_account:', err.message);
//       } else {
//         console.log('Data inserted into Employee_account successfully. Row ID:', this.lastID);
//       }
//     });

//     // Insert data into Student_account table
//     const studentData = ['student1', 'Alice', 'Smith', 'Computer Science', 1];
//     db.run('INSERT INTO Student_account (username, First_name, Last_name, Course, is_Active) VALUES (?, ?, ?, ?, ?)', studentData, function (err) {
//       if (err) {
//         console.error('Error inserting into Student_account:', err.message);
//       } else {
//         console.log('Data inserted into Student_account successfully. Row ID:', this.lastID);
//       }
//     });
//   }); 

//    db.close(); // Close the database connection
// }
