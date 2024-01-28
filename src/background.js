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
const sqlite3 = require("sqlite3");
const isDevelopment = process.env.NODE_ENV !== "production";
//const fs = require("fs");
const path = require("path");
// Global  Variable
let win;
let db;
/* // Path to the SQLite database file
const dbPath = path.join(app.getAppPath(), "database.db");
//const dbPath = './database.db'; // Replace with the actual path to your database file

const db = new sqlite3.Database(dbPath);

if (!fs.existsSync(dbPath)) {
  db.exec(
    `CREATE TABLE IF NOT EXISTS employee_account (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, department_name TEXT, position TEXT, email TEXT, is_actived INTEGER);
    "CREATE TABLE IF NOT EXISTS student_account (id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, last_name TEXT, course TEXT, is_actived INTEGER);
    CREATE TABLE IF NOT EXISTS employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, time_in TEXT, time_out TEXT, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, time_in TEXT, time_out TEXT, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `,
    function (err) {
      if (err) {
        console.error("Error creating tables and inserting data:", err.message);
      } else {
        console.log("Tables created and data inserted successfully.");
      }
      // Close the database connection after completing operations
      db.close();
      const db = new sqlite3.Database(dbPath);
    }
  );
} */

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
  const dbPath = path.join(appPath, "database.db");

  // File exists, create the database connection
  db = new sqlite3.Database(dbPath); // Use the global db variable

  db.serialize(() => {
    // Create tables if they don't exist
    db.run(
      "CREATE TABLE IF NOT EXISTS employee_account (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, department_name TEXT, position TEXT, email TEXT, is_actived INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS student_account (id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, last_name TEXT, course TEXT, is_actived INTEGER)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, time_in TEXT, time_out TEXT NULL, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, time_in TEXT, time_out TEXT NULL, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
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
  const dbPath = path.join(app.getAppPath(), "database.db");
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
  const dbPath = path.join(app.getAppPath(), "database.db");
  const database = new sqlite3.Database(dbPath);
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
  database.close()
});
ipcMain.on("insert-employee", (event, data, selectQuery, insertQuery) => {
  const dbPath = path.join(app.getAppPath(), "database.db");
  const database = new sqlite3.Database(dbPath);
  // Execute the select Employee Query
  database.get(selectQuery, data.email, (err, result) => {
    if (err) {
      console.log("Error in get-employee query:", err.message);
      event.reply("insert-employee-response-error", {
        error: err.message,
      });
    } else {
      console.log(data.email + ": " + result)
      if (!result) {
        const value = [data.name, 'staff', data.department, data.email, 1]
        // Save Employee
        database.run(insertQuery, value, (error2, result2) => {
          if (error2) {
            console.log('Insert Employee Error: ' + error2.message)
          } else {
            console.log("Save Employee")
          }
        });
      }
      event.reply("insert-employee-response", result);
    }
  });
})
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
  const dbPath = path.join(app.getAppPath(), "database.db");
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
ipcMain.on("store-attendance-v2", (event, queries, data) => {
  const dbPath = path.join(app.getAppPath(), "database.db");
  const database = new sqlite3.Database(dbPath); // Use the global db variable
  //event.reply("store-attendance-v2-response", queries.selectEmployee);
  //Select first the User
  database.get(queries.selectUser, data.user, (error, selectResponse) => {
    if (error) {
      event.reply("select-query-error", {
        error: error.message,
      });
    } else {
      const selectDataAttendance = [selectResponse.id, "%" + data.currentDate + "%"]; // Set the User Id and Current Data
      // Get the Exiting Attendance of the User's
      database.get(queries.selectAttendance, selectDataAttendance, (error2, selectAttendanceResponse) => {
        if (error2) {
          console.log(error2)
          event.reply("select-query-error", {
            error: error2.message,
          });
        } else {
          // If the Response is Empty you need to insert the data
          const insertValue = [selectResponse.id, data.currentDateTime, null, 0, data.currentDateTime, data.currentDateTime]; // Set Attendance Details
          if (!selectAttendanceResponse) {
            // Insert Attendance
            database.run(queries.insert, insertValue, (error3, responseInsert) => {
              console.log(selectResponse.name + ": Saved Attendance")
              if (error3) {
                console.log(error3)
              }
              console.log(responseInsert);
            });

          } else {
            if (selectAttendanceResponse.time_out === null) {
              const updateValue = [data.currentDateTime, data.currentDateTime, selectAttendanceResponse.id]
              database.run(queries.update, updateValue, (error3, responseInsert) => {
                console.log(selectResponse.name + ": Update Attendance")
                if (error3) {
                  console.log(error3)
                }
                console.log(responseInsert);
              });

            } else {
              database.run(queries.insert, insertValue, (error3, responseInsert) => {
                console.log(selectResponse.name + ": Insert Attendance")
                if (error3) {
                  console.log(error3)
                }
                console.log(responseInsert);
              });


            }
          }
          // then if Exisiting, update the time out index if the index is null
          // then if Exisiting again and the time out index is not null try to insert again an attendance of the User's
          event.reply("store-attendance-v2-response", selectAttendanceResponse);
        }
      });
      event.reply("store-attendance-v2-response", selectDataAttendance);

    }
  });
  database.close();
});
// Store Attendance into Database
ipcMain.on("store-attendance", (event, query, data) => {
  const dbPath = path.join(app.getAppPath(), "database.db");
  const database = new sqlite3.Database(dbPath); // Use the global db variable
  database.run(query, data, (err) => {
    if (err) {
      console.log("Error adding employee:", err);
    } else {
      console.log("Employee Attendance added successfully.");
    }
  });
  /* const success = database.run(query, data);
  event.reply("store-attendance-response", success);
  database.close() */
});