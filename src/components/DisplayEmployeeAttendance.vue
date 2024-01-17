<template>
    <div>
      <h1>Employee Attendance</h1>
      <table class="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee Name</th>
            <th>Time In</th>
            <th>Time Out</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employeeData" :key="employee.id">
            <td>{{ employee.id }}</td>
            <td>{{ employee.Firstname }} {{ employee.Lastname }}</td>
            <td>{{ employee.Time_in }}</td>
            <td>{{ employee.Time_out }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
    
  
<script>
const { ipcRenderer } = require('electron');

export default {
    data() {
        return {
            employeeData: [],
        };
    },
    mounted() {
        this.fetchEmployeeData();
    },
    methods: {
        fetchEmployeeData() {
            ipcRenderer.once('get-employee-attendance', (event, data) => {
                console.log('Received employee attendance:', data);
                this.employeeData = JSON.parse(data);
            });
            ipcRenderer.send('get-employee-attendance');
        },
    },
};
</script>
  
<style scoped>
.employee-table {
    border-collapse: collapse;
    width: 100%;
}

.employee-table th,
.employee-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.employee-table th {
    background-color: #f2f2f2;
}
</style>