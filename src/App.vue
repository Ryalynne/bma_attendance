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
    <CustomNavBar />
    <div class="editors position-relative mt-5 m-5">
        <div class="container-fluid">
            <router-view></router-view>
        </div>
    </div>
</template>
<script>
import ApiStatus from '@/components/ApiStatus.vue'
import CustomNavBar from "@/components/CustomNavBar.vue"
import AttendanceModel from "@/database/Attendance"
import axios from 'axios'
export default {
    name: 'App',
    components: {
        ApiStatus,
        CustomNavBar
    },
    data() {
        return {
            isApiOnline: false,
            pollInterval: 5000, // Poll every 5 seconds,
            attendanceModel: new AttendanceModel(),
        }
    },
    mounted() {
        this.startPolling();
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
                    //this.attendanceModel.apiStoreAttendance()
                } else {
                    this.isApiOnline = false
                }
            } catch (error) {
                this.isApiOnline = false;
            }
        },
    },
}
</script>
