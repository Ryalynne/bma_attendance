import EmployeeModel from "./Employee";
import StudentsModel from "./Students";

const {
  ipcRenderer
} = require("electron");
class AttendanceModel {
  constructor() {
    this.employeeTable = "employee_attendance";
    this.empID = "employee_id";
    this.studentTable = "student_attendance";
    this.studentID = "student_id";
    this.timeIn = "time_in";
    this.timeOut = "time_out";
    this.responseId = "response_id";
    this.sync = "is_sync";
    this.created = "created_at";
    this.updated = "updated_at";
  }
  async fetchUserAttendance(currentData, userType) {
    const studentModel = new StudentsModel()
    const employeeModel = new EmployeeModel()
    const mainTable = userType === 'employees' ? this.employeeTable : this.studentTable
    const secondTable = userType === 'employees' ? employeeModel.tableName : studentModel.tableName
    const column = userType === 'employees' ? this.empID : this.studentID
    // Query for Get All Attendance
    const selectQuery = `SELECT * FROM ${mainTable}
       INNER JOIN ${secondTable} ON ${secondTable}.id = ${mainTable}.${column}
       WHERE ${mainTable}.${this.created} LIKE ?
       ORDER BY ${mainTable}.${this.updated} DESC;`;
    try {
      const response = await this.sendFetchAttendance(selectQuery, currentData)
      return response
    } catch (error) {
      console.log(error);
    }
  }
  async storeAttendancev2(dataArray, queries) {
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
  sendFetchAttendance(query, value) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("FETCH_ATTENDANCE", query, value);

      ipcRenderer.once("FETCH_ATTENDANCE_RESPONSE", (event, response) => {
        resolve(response);
      });

      ipcRenderer.once("FETCH_ATTENDANCE_ERROR", (event, error) => {
        reject(error);
      });
    })
  }
  studentDataToSync() {
    const model = new StudentsModel();
    const selectQuery = `SELECT ${this.studentTable}.id,${model.tableName}.${model.username},${this.studentTable}.${this.responseId},
    ${this.studentTable}.${this.timeIn}, ${this.studentTable}.${this.timeOut} FROM ${this.studentTable}
    INNER JOIN ${model.tableName} ON ${model.tableName}.id = ${this.studentTable}.${this.studentID}
    WHERE ${this.sync} = 0;`;
    const updateQuery = `UPDATE ${this.studentTable} SET ${this.sync} = ?, ${this.responseId} = ? WHERE id = ?`;
    ipcRenderer.send(
      "STORE_ATTENDANCE_API",
      selectQuery,
      updateQuery,
      "student-attendance"
    );
  }
  apiStoreAttendance() {
    const employee = new EmployeeModel();
    const selectQuery = `SELECT ${this.employeeTable}.id,${employee.tableName}.${employee.email},${this.employeeTable}.${this.responseId},
    ${this.employeeTable}.${this.timeIn}, ${this.employeeTable}.${this.timeOut} FROM ${this.employeeTable}
    INNER JOIN ${employee.tableName} ON ${employee.tableName}.id = ${this.employeeTable}.${this.empID}
    WHERE ${this.sync} = 0;`;
    const updateQuery = `UPDATE ${this.employeeTable} SET ${this.sync} = ?, ${this.responseId} = ? WHERE id = ?`;

    ipcRenderer.send(
      "STORE_ATTENDANCE_API",
      selectQuery,
      updateQuery,
      "employee-attendance"
    );
    this.studentDataToSync()
  }
}

export default AttendanceModel;