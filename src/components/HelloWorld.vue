<template>
  <h1>Data from SQLite</h1>
  <div>
    <input v-model="qrInput" placeholder="Enter QRCODE" />
    <button @click="insertData()">Insert Data</button>
  </div>
</template>

<script>
// const { ipcRenderer } = require('electron');

// export default {
//   data() {
//     return {
//       qrInput: ''
//     };
//   },
//   methods: {
//     insertData() {
//       if (this.qrInput) {
//         const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
//         const inputTime = currentDate;
//         const data = {
//           QRCODE: this.qrInput,
//           TIME: inputTime,
//         };
//         ipcRenderer.send('insert-attendance', data);
//       } else {
//         alert('Please provide QR Code and Time');
//       }
//     },
//   },
// };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
