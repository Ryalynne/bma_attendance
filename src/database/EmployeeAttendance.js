const {
    ipcRenderer
} = require("electron");
class EmployeeAttendanceModel {
    constructor() {
        //this.db = new sqlite3.Database("src/database/data.db");
        this.tableName = "employee_attendance";
        this.empID = "employee_id";
        this.timeIn = "time_in";
        this.timeOut = "time_out";
        this.sync = "is_sync";
        this.created_date = "created_at"
    }
    fetchEmployeeAttendanceList(date) {
        const selectQuery = `SELECT * FROM ${this.tableName} WHERE ${this.created_date} LIKE ? ORDER BY id DESC;`;
        ipcRenderer.send("select-table-where", selectQuery, "%" + date + "%");
        ipcRenderer.on("select-table-response", (event, result) => {
            console.log(result)
            return result; // Return the Employee Details
        });
    }
    /* storeEmployeeAttendace(data, date) {
        const employee = new EmployeeModel()
        const value = employee.addEmployee(data)
        console.log(value,date)
        const value = [data.name, data.department, 'staff', data.email, 1]
        const query = `INSERT INTO ${this.tableName} (${this.name}, ${this.position}, ${this.department}, ${this.email}, is_actived)
    VALUES (?, ?, ?, ?, ?);`;
        ipcRenderer.send("add-employee", value, query); // Send to the IPC function

    } */
}
export default EmployeeAttendanceModel;