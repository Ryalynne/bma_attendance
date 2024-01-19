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

  addEmployee(data) {
    const response = this.getEmployee(data);
    if (!response) {
      const query = `INSERT INTO ${this.tableName} (${this.name}, ${this.position}, ${this.department}, ${this.email}, is_actived)
      VALUES (?, ?, ?, ?, ?);`;
      ipcRenderer.send("add-employee", data, query); // Send to the IPC function
    }

    /* ipcRenderer.on("get-employee-response", (event, existingEmployee) => {
      console.log("Event:", event);
      console.log("Existing Employee:", existingEmployee);
      //console.log(existingEmployee);
      if (existingEmployee && !existingEmployee.error) {
        // Employee already exists, handle accordingly (e.g., show an error message)
        console.log("Employee already exists");
      } else if (existingEmployee && existingEmployee.error) {
        // Handle the error response from the main process
        console.log("Error in get-employee query:", existingEmployee.error);
      } else {
       
      }
    }); */
    /* ipcRenderer.on("get-employee-reply", (event, existingEmployee) => {
      if (existingEmployee) {
        // Employee already exists, handle accordingly (e.g., show an error message)
        console.log("Employee already exists");
      } else {
        // Employee does not exist, proceed with the insertion
        const query = `INSERT INTO ${this.tableName}
            (${this.name}, ${this.position}, ${this.department}, ${this.email}, is_actived)
            VALUES (?, ?, ?, ?, 1);
          `;
        // Send a request to add the employee
        ipcRenderer.send("add-employee", data, query);
        // Optionally, listen for the response from the main process
        ipcRenderer.on("add-employee-reply", (event, success) => {
          if (success) {
            console.log("Employee added successfully");
          } else {
            console.log("Error adding employee");
          }
        });
      }
    }); */
  }
  getEmployee(data) {
    const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.email} = ?;`;
    ipcRenderer.send("get-employee", data[3], selectQuery); // Execute th
    ipcRenderer.on("get-employee-response", (event, employeeDetails) => {
      console.log("Employee Details:", employeeDetails);
      if (employeeDetails) {
        // Employee details found, handle accordingly
        console.log("Employee details found:", employeeDetails);
        return employeeDetails;
      } else {
        // Employee not found, handle accordingly
        console.log("Employee not found");
        return false;
      }
    });
  }
}

export default EmployeeModel;
