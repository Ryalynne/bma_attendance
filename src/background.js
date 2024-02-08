"use strict";

// import { app, protocol, BrowserWindow, ipcMain } from 'electron'
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
// const sqlite3 = require('sqlite3');
// const path = require('path');
// const fs = require('fs');
// const isDevelopment = process.env.NODE_ENV !== 'production'

import { app, protocol, BrowserWindow, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import axios from "axios";
const sqlite3 = require("sqlite3");
const isDevelopment = process.env.NODE_ENV !== "production";
//const fs = require("fs");
const path = require("path");
// Global  Variable
let win;
let db;
const dbPath = path.join(app.getAppPath(), "database.db");
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      secure: true,
      standard: true,
    },
  },
]);

async function createWindow() {
  // Create the browser window.
  // Check if the database file exists
  win = new BrowserWindow({
    width: 1080,
    height: 900,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}
// Create Database
function createDatabase() {
  const appPath = app.getAppPath();
  console.log(appPath);
  //dbPath = path.join(appPath, "database.db");

  // File exists, create the database connection
  db = new sqlite3.Database(dbPath); // Use the global db variable

  db.serialize(() => {
    // Create tables if they don't exist
    db.run(
      "CREATE TABLE IF NOT EXISTS employee_account (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, department_name TEXT, position TEXT, email TEXT, image TEXT NULL, is_actived INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS student_account (id INTEGER PRIMARY KEY, username TEXT,name TEXT, course TEXT, image TEXT NULL, is_actived INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, time_in TEXT, time_out TEXT NULL, response_id INTEGER NULL, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, time_in TEXT, time_out TEXT NULL, response_id INTEGER NULL, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    );

    // Pass the SQLite database instance to the renderer process
    win.webContents.on("did-finish-load", () => {
      win.webContents.send("db", db);
    });
  });
}
// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
  // Create Sqlite Database
  createDatabase();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
// Store Employee into Database
ipcMain.on("add-employee", (event, data, query) => {
  const database = new sqlite3.Database(dbPath);
  const success = database.run(query, data);
  event.reply("add-employee-response", success);
  database.close();
});
// Get Employee Details
ipcMain.on("get-employee", (event, data, query) => {
  db.get(query, data, (err, result) => {
    if (err) {
      console.log("Error in get-employee query:", err.message);
      event.reply("get-employee-response", {
        error: err.message,
      });
    } else {
      // Send the employee details (or null if not found)
      //console.log(result)
      event.reply("get-employee-response", result);
    }
  });
});
// Select Employee Details
ipcMain.on("select-employee", (event, data, query) => {
  database.get(query, data, (err, result) => {
    if (err) {
      console.log("Error in get-employee query:", err.message);
      event.reply("select-employee-response-error", {
        error: err.message,
      });
    } else {
      // Send the employee details (or null if not found)
      //console.log(result)
      event.reply("select-employee-response", result);
    }
  });
  database.close();
});
ipcMain.on("insert-employee", (event, data, selectQuery, insertQuery) => {
  // Execute the select Employee Query
  const database = new sqlite3.Database(dbPath);
  database.get(selectQuery, data.email, (err, result) => {
    if (err) {
      console.log("Error in get-employee query:", err.message);
      event.reply("insert-employee-response-error", {
        error: err.message,
      });
    } else {
      console.log(data.email + ": " + result);
      if (!result) {
        const value = [
          data.name,
          "staff",
          data.department,
          data.email,
          data.image,
          1,
        ];
        // Save Employee
        database.run(insertQuery, value, (error2, result2) => {
          if (error2) {
            console.log("Insert Employee Error: " + error2.message);
          } else {
            console.log("Save Employee");
          }
        });
      }
      event.reply("insert-employee-response", result);
    }
  });
});
// Select Table
ipcMain.on("select-table", (event, query) => {
  db.all(query, (error, response) => {
    if (error) {
      event.reply("select-table-response-error", {
        error: error.message,
      });
    }
    event.reply("select-table-response", response);
  });
});
// Select Table Where
ipcMain.on("select-table-where", (event, query, data) => {
  const database = new sqlite3.Database(dbPath);
  database.all(query, data, (error, response) => {
    if (error) {
      console.log(error);
    }
    event.reply("select-table-response", response);
  });
  database.close();
});

// Attendance Function
ipcMain.on("get-attendance", (event, query, data) => {
  db.get(query, data, (err, result) => {
    if (err) {
      console.log("Error in get-attendance query:", err.message);
      event.reply("get-attendance-error", {
        error: err.message,
      });
    } else {
      // Send the attendance details (or null if not found)
      //console.log(result)
      event.reply("get-attendance-response", result);
    }
  });
});
// Store Attendance into Database
ipcMain.on("STORE_ATTENDANCE", async (event, queries, data) => {
  try {
    const database = new sqlite3.Database(dbPath);
    const selectResponse = await getUserData(
      database,
      queries.selectUser,
      data.user
    );
    const selectDataAttendance = [
      selectResponse.id,
      "%" + data.currentDate + "%",
    ];

    const selectAttendanceResponse = await getAttendanceData(
      database,
      queries.selectAttendance,
      selectDataAttendance
    );

    const insertValue = [
      selectResponse.id,
      data.currentDateTime,
      null,
      0,
      data.currentDateTime,
      data.currentDateTime,
    ];

    let response;

    if (!selectAttendanceResponse) {
      response = await runQuery(database, queries.insert, insertValue);
    } else {
      if (selectAttendanceResponse.time_out === null) {
        const updateValue = [
          data.currentDateTime,
          data.currentDateTime,
          0,
          selectAttendanceResponse.id,
        ];
        response = await runQuery(database, queries.update, updateValue);
      } else {
        response = await runQuery(database, queries.insert, insertValue);
      }
    }
    const selectAttendanceProfile = await getAttendanceData(
      database,
      queries.selectProfile,
      selectDataAttendance
    );
    event.reply("RESPONSE_EVENT", {
      selectAttendanceResponse,
      selectAttendanceProfile,
    });
  } catch (error) {
    event.reply("SELECT_QUERY_ERROR_EVENT", { error: error.message });
  } finally {
    database.close();
  }
});

async function getUserData(database, query, userData) {
  return new Promise((resolve, reject) => {
    database.get(query, userData, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function getAttendanceData(database, query, attendanceData) {
  return new Promise((resolve, reject) => {
    database.get(query, attendanceData, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function runQuery(database, query, values) {
  return new Promise((resolve, reject) => {
    database.run(query, values, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
}
// STORE ATTENDANCE INTO API
/* ipcMain.on(
  "STORE_ATTENDANCE_API",
  async (event, queries, updateQuery, apiUrl) => {
    const database = new sqlite3.Database(dbPath);
    // GET ATTENDANCE LIST NOT SAVE TO THE SERVER
    try {
      database.all(queries, (error, response) => {
        if (error) {
          console.log(error);
        } else {
          response.forEach(async (element) => {
            // Make a POST request using Axios
            try {
              // Make a POST request using Axios
              const response = await axios.post(apiUrl, element);
              // Update the Status of the Data store on the SQLite Database
              const dataAttendance = [1, response.data.response_id, element.id];
              //console.log(data);
              const attendance = await runQuery(
                database,
                updateQuery,
                dataAttendance
              );
              console.log("Response:", response.data);
            } catch (error) {
              console.error("Error sending attendance data:", error);
            }
          });
        }
        //axios
      });
    } finally {
      database.close();
    }
  }
);
 */
ipcMain.on(
  "STORE_ATTENDANCE_API",
  async (event, queries, updateQuery, apiUrl) => {
    const database = new sqlite3.Database(dbPath);
    try {
      const attendanceList = await new Promise((resolve, reject) => {
        database.all(queries, (error, response) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            resolve(response);
          }
        });
      });

      const updatePromises = attendanceList.map(async (element) => {
        try {
          const response = await axios.post(apiUrl, element);
          console.log(element);
          const dataAttendance = [1, response.data.response_id, element.id];
          await runQuery(database, updateQuery, dataAttendance);
          console.log("Response:", response.data);
        } catch (error) {
          console.error("Error sending attendance data:", error);
        }
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error retrieving attendance data:", error);
    } finally {
      database.close();
    }
  }
);
