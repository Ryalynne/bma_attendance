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
      "CREATE TABLE IF NOT EXISTS employee_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL, time_in TEXT, time_out TEXT, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS student_attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id INTEGER NOT NULL, time_in TEXT, time_out TEXT, is_sync INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)"
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
  console.log("Save Employee");
  event.reply("add-employee-response", success);
  database.close();
  /*  console.log(data);
  db.run(query, data, (err) => {
    if (err) {
      console.log("Error adding employee:", err);
    } else {
      console.log("Employee added successfully.");
    }
  }); */
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

// Select Table
ipcMain.on("select-table", (event, query) => {
  db.all(query, (error, response) => {
    if (error) {
      console.log(error);
    }
    event.reply("select-table-response", JSON.stringify(response));
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
/*
ipcMain.on("insert-attendance", (event, data) => {
  const { QRCODE, TIME } = data.body;
  const handleError = (errorMessage) => {
    event.sender.send("insert-attendance-error", errorMessage);
  };

  const currentDate = new Date().toISOString().slice(0, 10);

  const insertOrUpdateAttendance = (
    tableName,
    idColumn,
    entityId,
    timeColumn
  ) => {
    const selectQuery = `SELECT * FROM ${tableName} WHERE ${idColumn} = ? AND Time_in LIKE ?`;
    const updateQuery = `UPDATE ${tableName} SET Time_out = ? WHERE id = ? AND Time_in LIKE ?`;
    const insertQuery = `INSERT INTO ${tableName} (${idColumn}, Time_in) VALUES (?, ?)`;

    db.get(selectQuery, [entityId, currentDate + "%"], (err, attendance) => {
      if (err) {
        return handleError(err.message);
      }

      if (attendance) {
        const attendanceId = attendance.id;
        db.run(updateQuery, [TIME, attendanceId, currentDate + "%"], (err) => {
          if (err) {
            return handleError(err.message);
          }
          event.sender.send(
            "insert-attendance-success",
            "Data updated successfully"
          );
        });
      } else {
        db.run(insertQuery, [entityId, TIME], (err) => {
          if (err) {
            return handleError(err.message);
          }
          event.sender.send(
            "insert-attendance-success",
            "Data inserted successfully"
          );
        });
      }
    });
  };

  db.get(
    "SELECT * FROM Employee_account WHERE email = ?",
    [QRCODE],
    (err, employeeRow) => {
      if (err) {
        return handleError(err.message);
      }

      if (employeeRow) {
        insertOrUpdateAttendance(
          "Employee_attendance",
          "Employee_id",
          employeeRow.id,
          "Time_out"
        );
      } else {
        db.get(
          "SELECT * FROM Student_attendance WHERE Student_id = ? AND Time_in LIKE ? ",
          [QRCODE, currentDate + "%"],
          (err, studentAttendance) => {
            if (err) {
              return handleError(err.message);
            }

            if (studentAttendance) {
              const attendanceId = studentAttendance.id;
              db.run(
                "UPDATE Student_attendance SET Time_out = ? WHERE id = ? AND Time_in LIKE ?",
                [TIME, attendanceId, currentDate + "%"],
                (err) => {
                  if (err) {
                    return handleError(err.message);
                  }
                  event.sender.send(
                    "insert-attendance-success",
                    "Data updated successfully"
                  );
                }
              );
            } else {
              db.run(
                "INSERT INTO Student_attendance (Student_id, Time_in) VALUES (?, ?)",
                [QRCODE, TIME],
                (err) => {
                  if (err) {
                    return handleError(err.message);
                  }
                  event.sender.send(
                    "insert-attendance-success",
                    "Data inserted successfully"
                  );
                }
              );
            }
          }
        );
      }
    }
  );
});

ipcMain.on("get-employee-attendance", (event) => {
  db.all(
    'SELECT Employee_attendance.id,Employee_account.Firstname, Employee_account.Lastname,Employee_attendance.Time_in,Employee_attendance.Time_out FROM Employee_attendance JOIN Employee_Account ON Employee_attendance.Employee_id = Employee_Account.id where Employee_attendance.time_in != "" ',
    (err, rows) => {
      if (err) {
        console.error("Error fetching employee data", err.message);
        event.reply("get-employee-attendance", "Error fetching employee data");
      } else {
        event.reply("get-employee-attendance", JSON.stringify(rows));
      }
    }
  );
});

ipcMain.on("get-employee-account", (event) => {
  db.all("SELECT * FROM Employee_account", (err, rows) => {
    if (err) {
      event.reply("get-employee-account", "Error fetching employee data");
    } else {
      event.reply("get-employee-account", JSON.stringify(rows));
    }
  });
});
 */
