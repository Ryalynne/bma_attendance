<template>
  <nav class="navbar bg-white" style="margin-top: 0px;">
    <div class="container-fluid">
      <h5 class="navbar-brand my-0 mr-md-auto font-weight-normal" href="#">
        <img src="@/assets/logo.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top">
        BALIWAG MARITIME ACADEMY, INC.
      </h5>
      <div class="api-status">
        <api-status :isApiOnline="isApiOnline" />
      </div>
    </div>
  </nav>
  <div class="editors position-relative mt-5 m-5">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-4">
          <real-time-clock />
          <div class="scanner mt-2">
            <input type="password" class="form-control border border-success" placeholder="Scan your ID"
              ref="barcodeInput" @keydown="handleKeyDown" autofocus>
          </div>
        </div>
        <div class="col-md-8">
          <card-profile :profileData="profileDetails" :isOnline="isApiOnline" />
          <attendance-list :attendanceList="attendanceList" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ApiStatus from '@/components/ApiStatus.vue'
import RealTimeClock from '@/components/RealTimeClock.vue'
import CardProfile from '@/components/CardProfile.vue'
import AttendanceList from '@/components/AttendanceList.vue'
import EmployeeModel from '@/database/employee_model'
import axios from 'axios'
export default {
  name: 'App',
  components: {
    ApiStatus,
    RealTimeClock,
    CardProfile,
    AttendanceList
  },
  data() {
    return {
      isApiOnline: false,
      pollInterval: 5000, // Poll every 5 seconds,
      profileDetails: null,
      attendanceList: { 'employee': [], 'student': [] },
      employeeModel: new EmployeeModel()
    }
  },
  mounted() {
    this.startPolling();
    this.applicationSetUp()
  },
  beforeUnmount() {
    this.stopPolling();
  },
  methods: {
    startPolling() {
      this.pollingTimer = setInterval(this.checkApiStatus, this.pollInterval);
    },
    stopPolling() {
      clearInterval(this.pollingTimer);
    },
    async checkApiStatus() {
      try {
        // Make an API request to check the status
        const response = await axios.get('attendance');
        if (response) {
          this.isApiOnline = true
          this.attendanceList = response.data.data
          /*  this.saveOfflineAttendance(response.data.data) */
        } else {
          this.isApiOnline = false
          // this.offlineFetchAttendance()
        }
      } catch (error) {
        this.isApiOnline = false;
        // this.offlineFetchAttendance()
      }
    },
    async applicationSetUp() {
      // This method Save the basi information of The Employee and Student

      try {
        const response = await axios.get('data-sync');
        if (response.status == 200) {
          if (response.data.employees) {
            // Get Employee Details
            response.data.employees.forEach(async element => {
              // Save Image
              const data = [element.name, element.department, 'staff', element.email, 1]
              this.employeeModel.addEmployee(data)
            });
          }
        }
      } catch (error) {
        //return false;
      }
    }
  },
}
</script>
