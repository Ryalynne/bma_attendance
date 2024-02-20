//import sqlite3 from "sqlite3";
import AttendanceModel from "./Attendance";
const {
  ipcRenderer
} = require("electron");
class EmployeeModel {
  constructor() {
    this.tableName = "employee_account";
    this.name = "name";
    this.position = "position";
    this.department = "department_name";
    this.email = "email";
  }
  fetchAllEmployeeV2(callback) {
    const selectQuery = `SELECT * FROM ${this.tableName} ;`;
    ipcRenderer.send("select-table", selectQuery, null);
    ipcRenderer.on("select-table-response", (event, result) => {
      callback(result);
    });

    ipcRenderer.on("select-table-response-error", (event, error) => {
      console.error(error);
      // Handle the error
    });
  }
  // Store Employee
  storeEmployeeDetails(dataList) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    const insertQuery = `INSERT INTO ${this.tableName} (${this.name}, ${this.position}, ${this.department}, ${this.email}, image,is_actived)
  VALUES (?, ?, ?, ?, ?, ?);`;
    ipcRenderer.send("STORE_EMPLOYEE_INFORMATION", dataList, insertQuery, selectQuery);
  }
  // Store Employee Attendance
  storeAttendance(dataArray) {
    const attendanceModel = new AttendanceModel();
    const selectUserQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    const selectQuery = `SELECT * FROM ${attendanceModel.employeeTable} WHERE ${attendanceModel.empID} = ? AND ${attendanceModel.created} LIKE ? ORDER BY id DESC`;
    const insertQuery = `INSERT INTO ${attendanceModel.employeeTable} (${attendanceModel.empID}, ${attendanceModel.timeIn}, ${attendanceModel.timeOut}, ${attendanceModel.empID},${attendanceModel.created},${attendanceModel.empID}) VALUES (?, ?, ?, ?,?,?);`;
    const updateQuery = `UPDATE ${attendanceModel.employeeTable} SET ${attendanceModel.timeOut} = ? ,${attendanceModel.updated} = ?, ${attendanceModel.sync} = ? WHERE id = ?`;
    const selectAttendanceProfile = `SELECT * FROM ${attendanceModel.employeeTable}  INNER JOIN ${this.tableName} ON ${this.tableName}.id = ${attendanceModel.employeeTable}.${attendanceModel.empID}
       WHERE ${attendanceModel.employeeTable}.${attendanceModel.empID} = ? AND ${attendanceModel.employeeTable}.${attendanceModel.created} LIKE ?
       ORDER BY ${attendanceModel.employeeTable}.${attendanceModel.updated} DESC;`;
    const queries = {
      selectUser: selectUserQuery,
      selectAttendance: selectQuery,
      selectProfile: selectAttendanceProfile,
      insert: insertQuery,
      update: updateQuery,
    };
    return attendanceModel.storeAttendancev2(dataArray, queries)
  }
  // View Employee Details
  async viewEmployees() {
    const selectQuery = `SELECT * FROM ${this.tableName} ;`;
    try {
      const response = await this.sendFetchUser(selectQuery)
      return response
    } catch (error) {
      console.log(error);
    }
  }
  sendFetchUser(query) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("FETCH_USER_INFO", query);

      ipcRenderer.once("FETCH_USER_INFO_RESPONSE", (event, response) => {
        resolve(response);
      });

      ipcRenderer.once("FETCH_USER_INFO_ERROR", (event, error) => {
        reject(error);
      });
    })
  }
}

export default EmployeeModel;