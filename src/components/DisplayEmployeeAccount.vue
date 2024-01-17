<template>
  <div>
    <h1>Employee Account</h1>
    <table class="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="employee in employeeData" :key="employee.id">
          <td>{{ employee.id }}</td>
          <td>{{ employee.Firstname }}</td>
          <td>{{ employee.Lastname }}</td>
          <td>{{ employee.Email }}</td>
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
      ipcRenderer.once('get-employee-account', (event, data) => {
        console.log('Received employee account:', data);
        this.employeeData = JSON.parse(data);
      });

      ipcRenderer.send('get-employee-account');
    },
  },
};
</script>

<style scoped>
  .employee-table {
    border-collapse: collapse;
    width: 100%;
  }

  .employee-table th, .employee-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .employee-table th {
    background-color: #f2f2f2;
  }
</style>
