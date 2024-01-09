<template>
  <div id="app">

    <h1>Data from SQLite</h1>

    <div>
      <input v-model="qrInput" placeholder="Enter QRCODE" />
      <!-- <button @click="fetchEmployeeAttendance()">Display Full Name</button> -->
      <!-- <p>Full Name: {{ fullName }}</p>
      <p>Time: {{ inputTime }}</p> -->
      <button @click="insertData()">Insert Data</button>
    </div>

    <!-- <h2>Employee Attendance</h2>
    <table>
      <thead>
        <tr>
          <th>QRCODE</th>
          <th>TIME</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in employee - attendance" :key="item.id">
          <td>{{ item.firstname.item.lastname }}</td>
          <td>{{ item.department_name }}</td>
          <td>{{ item.position }}</td>
          <td>{{ item.time_in }}</td>
          <td>{{ item.time_out }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Student Attendance</h2>
    <table>
      <thead>
        <tr>
          <th>QRCODE</th>
          <th>FULL NAME</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in student - attendace" :key="item.id">
          <td>{{ item.firstname.item.lastname }}</td>
          <td>{{ item.time_in }}</td>
          <td>{{ item.time_out }}</td>
        </tr>
      </tbody>
    </table> -->


  </div>
</template>

<script>
export default {
  // data() {
  //   return {
  //     attendanceData: [],
  //     fullName: '',
  //     inputTime: '',
  //   };
  // },
  mounted() {
    // this.fetchEmployeeAttendance();
    // this.fetchStudentAttendance();
    this.insertData();
  },
  methods: {

    // fetchEmployeeAttendance() {
    //   fetch('http://localhost:3000/api/employee-account')
    //     .then(response => response.json())
    //     .then(data => {
    //       this.attendanceData = data;
    //     })
    //     .catch(error => { 
    //       console.error(error);
    //     });
    // },
    // fetchStudentAttendance() {
    //   fetch('http://localhost:3000/api/student-account')
    //     .then(response => response.json())
    //     .then(data => {
    //       this.attendanceData = data;
    //     })
    //     .catch(error => {
    //       console.error(error);
    //     });
    // },

    insertData() {
      if (this.qrInput) {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.inputTime = currentDate;
        const data = {
          QRCODE: this.qrInput,
          TIME: this.inputTime,
        };

        fetch('http://localhost:3000/api/insert-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(response => {
            if (response.ok) {
              alert('Data inserted successfully');
            } else {
              throw new Error('Failed to insert data');
            }
          })
      } else {
        alert('Please provide QR Code and Time');
      }
    },

    // displayFullName() {
    //   const currentDate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //   this.inputTime = currentDate;

    //   const foundItem = this.regularData.find(
    //     item => item.QRCODE === this.qrInput
    //   );
    //   this.fullName = foundItem ? foundItem.FULLNAME : 'Not found';
    // },
    // insertData() {
    //   if (this.qrInput && this.inputTime) {
    //     const data = {
    //       QRCODE: this.qrInput,
    //       TIME: this.inputTime,
    //     };

    //     fetch('http://localhost:3000/api/insert-attendance', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify(data),
    //     })
    //       .then(response => {
    //         if (response.ok) {
    //           alert('Data inserted successfully');
    //           this.fetchAttendanceData();
    //         } else {
    //           throw new Error('Failed to insert data');
    //         }
    //       })
    //       .catch(error => {
    //         console.error('Error:', error);
    //         alert('Failed to insert data');
    //       });
    //   } else {
    //     alert('Please provide QR Code and Time');
    //   }
    // },
  },
};
</script>
