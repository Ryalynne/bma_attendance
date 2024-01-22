import EmployeeModel from './Employee'

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
        this.sync = "is_sync";
        this.created_date = "created_at"
        this.updated = "updated_at"
    }
    fetchEmployeeAttendanceList(date) {
        const employee = new EmployeeModel();
        //const selectQuery = `SELECT * FROM ${this.employeeTable} WHERE ${this.created_date} LIKE ? ORDER BY id DESC;`;
        const selectQuery = `SELECT * FROM ${this.employeeTable}
        INNER JOIN ${employee.tableName} ON ${employee.tableName}.id = ${this.employeeTable}.${this.empID}
        WHERE ${this.employeeTable}.${this.created_date} LIKE ?
        ORDER BY ${this.employeeTable}.id DESC;`
         //console.log(date)
        ipcRenderer.send("select-table-where", selectQuery, "%" + date + "%");
        ipcRenderer.on("select-table-response", (event, result) => {
            console.log(result)
            return result; // Return the Employee Details
        });
    }
    storeEmployeeAttendace(data, date, dateTime) {
        const employee = new EmployeeModel() // Get the Employee Model to use the some function needed
        // I use getEmployee function to check if the data is Exisiting
        employee.getEmployee(data, (response) => {
            console.log(response, date, dateTime)
            if (response) {
                // check the Employee Attendance
                let value = [response.id, "%" + date + "%"]
                const selectQuery = `SELECT * FROM ${this.employeeTable} WHERE ${this.empID} = ? AND ${this.created_date} LIKE ? ORDER BY id DESC`
                this.checkAttendance(selectQuery, value, (result) => {
                    console.log(result)
                    if (!result) {
                        // Set the Query for Insert Data
                        const insertQuery = `INSERT INTO ${this.employeeTable} (${this.empID}, ${this.timeIn}, ${this.timeOut}, ${this.sync}) VALUES (?, ?, ?, ?);`
                        value = [response.id, dateTime, null, 0] // Set Employee Attendance Details
                        this.insertAttendance(insertQuery, value) // Call the Insert Attendance Function
                        console.log("Save Attendance")
                    } else {
                        if (result.time_out === null) {
                            // UPDATE QUERY
                            console.log(result.id)
                            const updateQuery = `UPDATE ${this.employeeTable} SET ${this.timeOut} = ? AND ${this.updated} = ? WHERE id = ?`
                            const updateData = [dateTime, dateTime, result.id]
                            this.insertAttendance(updateQuery, updateData)
                            console.log("For Update")
                        } else {
                            const insertQuery = `INSERT INTO ${this.employeeTable} (${this.empID}, ${this.timeIn}, ${this.timeOut}, ${this.sync}) VALUES (?, ?, ?, ?);`
                            value = [response.id, dateTime, null, 0] // Set Employee Attendance Details
                            this.insertAttendance(insertQuery, value) // Call the Insert Attendance Function
                            console.log("Insert Again")
                        }
                    }
                });
            }
        });
    }
    insertAttendance(query, value) {
        // Generic function to insert attendance for both user type
        ipcRenderer.send('store-attendance', query, value);
    }
    checkAttendance(query, value, callback) {
        // Generic function to get data in both table
        ipcRenderer.send("get-attendance", query, value);
        ipcRenderer.on("get-attendance-response", (event, value) => {
            callback(value);
        });

        ipcRenderer.on("get-employee-error", (event, error) => {
            console.error(error);
            // Handle the error
        });
    }
}

export default AttendanceModel;