<template>
  <div id="app">

    <h1>Data from SQLite</h1>

    <div>
      <input v-model="qrInput" placeholder="Enter QRCODE" />
      <button @click="insertData()">Insert Data</button>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
  data() {
    return {
      qrInput: ''
    }
  },
  mounted() {
   this.insertData();
  },
  methods: {
    insertData() {
      if (this.qrInput) {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const inputTime = currentDate;
        const data = {
          QRCODE: this.qrInput,
          TIME: inputTime,
        };
        ipcRenderer.send('insert-attendance', data);
      } else {
        alert('Please provide QR Code and Time');
      }
    },
  },
};
</script>
