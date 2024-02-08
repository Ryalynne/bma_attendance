//import sqlite3 from "sqlite3";

const { ipcRenderer } = require("electron");
class EmployeeModel {
  constructor() {
    //this.db = new sqlite3.Database("src/database/data.db");
    this.tableName = "employee_account";
    this.name = "name";
    this.position = "position";
    this.department = "department_name";
    this.email = "email";
  }

  searchEmployee(data) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    ipcRenderer.send("select-table-where", selectQuery, data);
    ipcRenderer.on("select-table-response", (event, result) => {
      console.log(result);
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
  addEmployee(data) {
    this.getEmployee(data.email, (response) => {
      if (!response) {
        console.log("Save Employee");
        this.insertEmployee(data);
      }
      // Continue with your logic based on the response
    });
  }
  addEmployeeV2(data) {
    this.getEmployee(data.email, (response) => {
      console.log(response);
      if (!response) {
        //console.log("Save Employee: " + data.email)
        //this.insertEmployee(data)
      }
      // Continue with your logic based on the response
    });
  }
  getEmployee(data, callback) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    //console.log(selectQuery)
    ipcRenderer.send("select-employee", data, selectQuery);
    ipcRenderer.on("select-employee-response", (event, employeeDetails) => {
      callback(employeeDetails);
    });

    ipcRenderer.on("select-employee-error", (event, error) => {
      console.error(error);
      // Handle the error
    });
  }
  insertEmployee(data) {
    const value = [data.name, "staff", data.department, data.email, 1];
    const query = `INSERT INTO ${this.tableName} (${this.name}, ${this.position}, ${this.department}, ${this.email}, is_actived)
    VALUES (?, ?, ?, ?, ?);`;
    ipcRenderer.send("add-employee", value, query); // Send to the IPC function
  }

  // Store Employee
  storeEmployee(data) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    const insertQuery = `INSERT INTO ${this.tableName} (${this.name}, ${this.position}, ${this.department}, ${this.email}, image,is_actived)
  VALUES (?, ?, ?, ?, ?, ?);`;
    data.forEach((element) => {
      console.log(element.email);
      //console.log(selectQuery)
      ipcRenderer.send("insert-employee", element, selectQuery, insertQuery);
      ipcRenderer.on("insert-employee-response", (event, employeeDetails) => {
        console.log(employeeDetails);
      });

      ipcRenderer.on("insert-employee-error", (event, error) => {
        console.error(error);
        // Handle the error
      });
    });
  }
}

export default EmployeeModel;
