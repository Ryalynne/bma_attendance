<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App" />
  <TestComponent />
</template>


<script>
import HelloWorld from './components/HelloWorld.vue';
import TestComponent from './components/TestComponent.vue';
const { ipcRenderer } = require('electron');

export default {
  name: 'App',
  components: {
    HelloWorld,
    TestComponent
  },
  methods: {
    sendIpcMessage() {
      ipcRenderer.send('some-message', 'Hello from renderer process!');
    },
  },
};
</script>



<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
