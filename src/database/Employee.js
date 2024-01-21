//import sqlite3 from "sqlite3";

const {
  ipcRenderer
} = require("electron");
class EmployeeModel {
  constructor() {
    //this.db = new sqlite3.Database("src/database/data.db");
    this.tableName = "employee_account";
    this.name = "name";
    this.position = "position";
    this.department = "department_name";
    this.email = "email";
  }

  searchEmployee(data){
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    ipcRenderer.send("select-table-where", selectQuery, data);
    ipcRenderer.on("select-table-response", (event, result) => {
      console.log(result)
      return result; // Return the Employee Details
    });
  }
  fetchAllEmployee() {
    const selectQuery = `SELECT * FROM ${this.tableName} ;`;
    ipcRenderer.send("select-table", selectQuery, null);
    ipcRenderer.on("select-table-response", (event, result) => {
      //console.log(result)
      return result; // Return the Employee Details
    });
  }
  addEmployee(data) {
    this.getEmployee(data.email, (response) => {
      if (!response) {
        console.log("Save Employee")
        this.insertEmployee(data)
      }
      // Continue with your logic based on the response
    });
  }

  getEmployee(data, callback) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    ipcRenderer.send("get-employee", data, selectQuery);
    ipcRenderer.on("get-employee-response", (event, employeeDetails) => {
      callback(employeeDetails);
    });

    ipcRenderer.on("get-employee-error", (event, error) => {
      console.error(error);
      // Handle the error
    });
  }
  insertEmployee(data){
    const value = [data.name, data.department, 'staff', data.email, 1]
    const query = `INSERT INTO ${this.tableName} (${this.name}, ${this.position}, ${this.department}, ${this.email}, is_actived)
    VALUES (?, ?, ?, ?, ?);`;
    ipcRenderer.send("add-employee", value, query); // Send to the IPC function

  }
}

export default EmployeeModel;