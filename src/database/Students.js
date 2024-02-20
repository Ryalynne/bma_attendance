import AttendanceModel from "./Attendance";

const {
  ipcRenderer
} = require("electron");
class StudentsModel {
  constructor() {
    this.tableName = "student_account";
    this.username = "username"
    this.name = "name";
    this.course = "course";
    this.image = "image";
    this.yearLevel = "year_level"
  }
  storeStudentDetails(studentList) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.username} = ?`
    const insertQuery = `INSERT INTO ${this.tableName} (${this.username}, ${this.name}, ${this.course}, ${this.image}, ${this.yearLevel}, is_actived)
    VALUES (?, ?, ?, ?, ?, ?);`;
    console.log(studentList)
    ipcRenderer.send("STORE_USER_INFORMATION", studentList, insertQuery, selectQuery);
  }
  storeAttendance(dataArray) {
    const attendanceModel = new AttendanceModel();
    const selectUserQuery = `SELECT * FROM ${this.tableName} WHERE ${this.username} = ?;`;
    const selectQuery = `SELECT * FROM ${attendanceModel.studentTable} WHERE ${attendanceModel.studentID} = ? AND ${attendanceModel.created} LIKE ? ORDER BY id DESC`;
    const insertQuery = `INSERT INTO ${attendanceModel.studentTable} (${attendanceModel.studentID}, ${attendanceModel.timeIn}, ${attendanceModel.timeOut}, ${attendanceModel.sync},${attendanceModel.created},${attendanceModel.updated}) VALUES (?, ?, ?, ?,?,?);`;
    const updateQuery = `UPDATE ${attendanceModel.studentTable} SET ${attendanceModel.timeOut} = ? ,${attendanceModel.updated} = ?, ${attendanceModel.sync} = ? WHERE id = ?`;
    const selectAttendanceProfile = `SELECT * FROM ${attendanceModel.studentTable}  INNER JOIN ${this.tableName} ON ${this.tableName}.id = ${attendanceModel.studentTable}.${attendanceModel.studentID}
       WHERE ${attendanceModel.studentTable}.${attendanceModel.studentID} = ? AND ${attendanceModel.studentTable}.${attendanceModel.created} LIKE ?
       ORDER BY ${attendanceModel.studentTable}.${attendanceModel.updated} DESC;`;
    const queries = {
      selectUser: selectUserQuery,
      selectAttendance: selectQuery,
      selectProfile: selectAttendanceProfile,
      insert: insertQuery,
      update: updateQuery,
    };
    return attendanceModel.storeAttendancev2(dataArray, queries)
  }
  // Student View Details
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
export default StudentsModel;