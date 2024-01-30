import EmployeeModel from "./Employee";

const { ipcRenderer } = require("electron");
class AttendanceModel {
  constructor() {
    this.employeeTable = "employee_attendance";
    this.empID = "employee_id";
    this.studentTable = "student_attendance";
    this.studentID = "student_id";
    this.timeIn = "time_in";
    this.timeOut = "time_out";
    this.sync = "is_sync";
    this.created = "created_at";
    this.updated = "updated_at";
  }
  fetchEmployeeAttendanceList(date, callback) {
    const employee = new EmployeeModel();
    const selectQuery = `SELECT * FROM ${this.employeeTable}
       INNER JOIN ${employee.tableName} ON ${employee.tableName}.id = ${this.employeeTable}.${this.empID}
       WHERE ${this.employeeTable}.${this.created} LIKE ?
       ORDER BY ${this.employeeTable}.${this.updated} DESC;`;

    ipcRenderer.send("select-table-where", selectQuery, "%" + date + "%");
    ipcRenderer.on("select-table-response", (event, result) => {
      callback(result);
    });

    ipcRenderer.on("select-table-response-error", (event, error) => {
      console.error(error);
      // Handle the error
    });
  }
  async storeAttendance(dataArray) {
    const employee = new EmployeeModel();
    const selectEmployeeQuery = `SELECT * FROM ${employee.tableName} WHERE ${employee.email} = ?;`;
    const selectQuery = `SELECT * FROM ${this.employeeTable} WHERE ${this.empID} = ? AND ${this.created} LIKE ? ORDER BY id DESC`;
    const insertQuery = `INSERT INTO ${this.employeeTable} (${this.empID}, ${this.timeIn}, ${this.timeOut}, ${this.sync},${this.created},${this.updated}) VALUES (?, ?, ?, ?,?,?);`;
    const updateQuery = `UPDATE ${this.employeeTable} SET ${this.timeOut} = ? ,${this.updated} = ? WHERE id = ?`;
    const selectAttendanceProfile = `SELECT * FROM ${this.employeeTable}
       INNER JOIN ${employee.tableName} ON ${employee.tableName}.id = ${this.employeeTable}.${this.empID}
       WHERE ${this.employeeTable}.${this.empID} = ? AND ${this.employeeTable}.${this.created} LIKE ? 
       ORDER BY ${this.employeeTable}.${this.updated} DESC;`;
    const queries = {
      selectUser: selectEmployeeQuery,
      selectAttendance: selectQuery,
      selectProfile: selectAttendanceProfile,
      insert: insertQuery,
      update: updateQuery,
    };

    try {
      const response = await this.sendStoreAttendanceRequest(
        queries,
        dataArray
      );
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      // Handle the error
    }
  }

  sendStoreAttendanceRequest(queries, dataArray) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("STORE_ATTENDANCE", queries, dataArray);

      ipcRenderer.once("RESPONSE_EVENT", (event, response) => {
        resolve(response);
      });

      ipcRenderer.once("SELECT_QUERY_ERROR_EVENT", (event, error) => {
        reject(error);
      });
    });
  }
}

export default AttendanceModel;
