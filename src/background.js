"use strict";

// import { app, protocol, BrowserWindow, ipcMain } from 'electron'
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
// const sqlite3 = require('sqlite3');
// const path = require('path');
// const fs = require('fs');
// const isDevelopment = process.env.NODE_ENV !== 'production'

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain
} from "electron";
import {
  createProtocol
} from "vue-cli-plugin-electron-builder/lib";
import installExtension, {
  VUEJS3_DEVTOOLS
} from "electron-devtools-installer";
import axios from "axios";
const sqlite3 = require("sqlite3");
const isDevelopment = process.env.NODE_ENV !== "production";
//const fs = require("fs");
const path = require("path");
// Global  Variable
let win;
let db;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: "app",
  privileges: {
    secure: true,
    standard: true,
  },
}, ]);

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
      "CREATE TABLE IF NOT EXISTS student_account (id INTEGER PRIMARY KEY, username TEXT,name TEXT, course TEXT, image TEXT NULL, year_level TEXT NULL, is_actived INTEGER)"
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
// Create Database v2
function createDatabaseV1() {
    /* const dbPath = path.resolve(__dirname, 'database.db');
    // Connect to SQLite database
    let db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database: ', err.message);
      } else {
        console.info('Connected to the database.');
      }
    });
 */
    /*  const dbPath = path.resolve(__dirname, "database.db");
    const database = new sqlite3.Database(dbPath);
    database.serialize(() => {
      database.run(
        "CREATE TABLE IF NOT EXISTS employee_account (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, department_name TEXT, position TEXT, email TEXT, image TEXT NULL, is_actived INTEGER)"
      );
      database.run(
        "CREATE TABLE IF NOT EXISTS student_account (id INTEGER PRIMARY KEY, username TEXT,name TEXT, course TEXT, image TEXT NULL, year_level TEXT NULL, is_actived INTEGER)"
      );
      database.run(
        "CREATE TABLE IF NOT EXISTS employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, time_in TEXT, time_out TEXT NULL, response_id INTEGER NULL, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
      );
      database.run(
        "CREATE TABLE IF NOT EXISTS student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, time_in TEXT, time_out TEXT NULL, response_id INTEGER NULL, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
      );
    })
  } catch (error) {
    console.log(error)
  } */
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
// TESTING OPEN DATABASE
ipcMain.on("OPEN_DATABASE", async (event) => {
  const selectResponse = await openDatabase()
  console.log(selectResponse)
})
// GET USER'S INFORMATION
ipcMain.on("FETCH_USER_INFO", async (event, query) => {
  try {
    const database = new sqlite3.Database(dbPath);
    const fetchAttendance = await new Promise((resolve, reject) => {
      database.all(query, (error, response) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    event.reply("FETCH_USER_INFO_RESPONSE", fetchAttendance);
  } catch (error) {
    event.reply("FETCH_USER_INFO_ERROR", {
      error: error.message
    });
  } finally {
    //database.close();
  };

})
// GET ATTENDANCE
ipcMain.on("FETCH_ATTENDANCE", async (event, query, data) => {
  try {
    const database = new sqlite3.Database(dbPath);
    //const fetchAttendance = await fetchQuery(database, query, data);
    const fetchAttendance = await new Promise((resolve, reject) => {
      database.all(query, data, (error, response) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    event.reply("FETCH_ATTENDANCE_RESPONSE", fetchAttendance);
  } catch (error) {
    event.reply("FETCH_ATTENDANCE_ERROR", {
      error: error.message
    });
  } finally {
    //database.close();
  };

})
// STORE STUDENT INFORMATION
ipcMain.on("STORE_USER_INFORMATION", (event, dataList, insertQuery, selectQuery) => {
  const database = new sqlite3.Database(dbPath);
  dataList.forEach(element => {
    //console.log(element)
    // CHECK IF THE USER IS EXISITING TO THE DATABASE
    database.get(selectQuery, element.username, (selectError, selectResult) => {
      if (selectError) {
        console.log("Error in get-employee query:", selectError.message);
      } else {
        if (!selectResult) {
          const year_level = element.course ? element.course.year_level : 'n.a'
          const course = element.course ? element.course.course.course_name : 'n.a'
          const value = [
            element.username,
            element.name,
            course,
            element.image,
            year_level,
            1,
          ];
          //console.log(value)
          // Save Employee
          database.run(insertQuery, value, (error2, result2) => {
            if (error2) {
              console.log("Insert Employee Error: " + error2.message);
            } else {
              console.log("Save Employee");
            }
          });
        }
      }
    })
  });
});
// STORE EMPLOYEE INFORMATION
ipcMain.on("STORE_EMPLOYEE_INFORMATION", (event, dataList, insertQuery, selectQuery) => {
  const database = new sqlite3.Database(dbPath);
  dataList.forEach(element => {
    //console.log(element)
    // CHECK IF THE USER IS EXISITING TO THE DATABASE
    database.get(selectQuery, element.username, (selectError, selectResult) => {
      if (selectError) {
        console.log("Error in get-employee query:", selectError.message);
      } else {
        if (!selectResult) {
          const value = [
            element.name,
            'staff',
            element.department,
            element.email,
            element.image,
            1,
          ];
          //console.log(value)
          // Save Employee
          database.run(insertQuery, value, (error2, result2) => {
            if (error2) {
              console.log("Insert Employee Error: " + error2.message);
            } else {
              console.log("Save Employee");
            }
          });
        }
      }
    })
  });
});
// Store Attendance into Database
ipcMain.on("STORE_ATTENDANCE", async (event, queries, data) => {
  try {
    const database = new sqlite3.Database(dbPath);
    // Get the User Information
    const selectResponse = await getUserData(database, queries.selectUser, data.user);
    // Set the user Attendance Params
    const selectDataAttendance = [selectResponse.id, "%" + data.currentDate + "%"];
    // Get the User Attendance using the query and attendance Params
    const selectAttendanceResponse = await getAttendanceData(database, queries.selectAttendance, selectDataAttendance);
    // Set the Attendance Details for the User's
    const insertValue = [selectResponse.id, data.currentDateTime, null, 0, data.currentDateTime, data.currentDateTime];
    let response;
    // First Check the User Attendance if Exisiting
    if (!selectAttendanceResponse) {
      // If the Attendance is not Exisiting the User's Attendance will Save base on the insertValue
      response = await runQuery(database, queries.insert, insertValue);
      console.log("Store Attendance")
    } else {
      // If the Attemdamce os Exisiting
      // Check the Attendance Response if the time out is Null
      if (selectAttendanceResponse.time_out === null) {
        const updateValue = [data.currentDateTime, data.currentDateTime, 0, selectAttendanceResponse.id];
        // Update the Attendance of User's
        response = await runQuery(database, queries.update, updateValue);
        console.log("Update Attendance")
      } else {
        response = await runQuery(database, queries.insert, insertValue);
        console.log("Store Attendance Again")
      }
    }
    const selectAttendanceProfile = await getAttendanceData(database, queries.selectProfile, selectDataAttendance);
    event.reply("RESPONSE_EVENT", {
      selectAttendanceResponse,
      selectAttendanceProfile,
    });
  } catch (error) {
    event.reply("SELECT_QUERY_ERROR_EVENT", {
      error: error.message
    });
  } finally {
    //database.close();
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
        resolve({
          id: this.lastID
        });
      }
    });
  });
}

async function fetchQuery(database, queries, data) {
  return await new Promise((resolve, reject) => {
    database.all(queries, data, (error, response) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });

}
// STORE ATTENDANCE INTO API
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