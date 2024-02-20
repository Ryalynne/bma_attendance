<template>
    <div class="row">
        <div class="col-md-4">
            <real-time-clock />
            <div class="scanner mt-2">
                <input type="password" class="form-control border border-success" placeholder="Scan your ID"
                    ref="barcodeInput" @keydown="handleKeyDown" autofocus>
            </div>
        </div>
        <div class="col-md-8">
            <card-profile :profileData="profileDetails" />
            <attendance-list :attendanceList="attendanceList" />
        </div>
    </div>
</template>
<script>
import RealTimeClock from '@/components/RealTimeClock.vue'
import CardProfile from '@/components/CardProfile.vue'
import AttendanceList from '@/components/AttendanceList.vue'
import EmployeeModel from '@/database/Employee'
import AttendanceModel from "@/database/Attendance"
import StudentsModel from '@/database/Students'
export default {
    name: 'App',
    components: {
        RealTimeClock,
        CardProfile,
        AttendanceList
    },
    data() {
        return {
            profileDetails: null,
            attendanceList: { 'employee': [], 'students': [] },
            attendanceModel: new AttendanceModel(),
            employeeModel: new EmployeeModel(),
            studentModel: new StudentsModel()
        }
    },
    mounted() {
        this.refreshTable()
    },
    methods: {
        handleKeyDown(event) {
            if (event.key === "Enter") {
                event.preventDefault(); // Prevent form submission if needed
                const barcodeValue = event.target.value.trim();
                if (barcodeValue.length > 0) {
                    this.processScannedBarcode(barcodeValue);
                    // Clear the input field after processing the scan
                    this.$refs.barcodeInput.value = "";
                }
            }
        },
        async processScannedBarcode(barcode) {
            // Here you can process the scanned barcode value
            let user = []
            const data = {
                user: barcode,
                currentDate: this.currentDate(),
                currentDateTime: this.getDateTime()
            }
            var username = barcode.includes('employee')
            if (username) {
                // Employee Attendance
                console.log(username)
                var employee = barcode.replace('employee:', '')
                employee = employee.replace('employee', '')
                this.attendanceList.employee = []
                data['user'] = employee
                user = await this.employeeModel.storeAttendance(data)
                console.log("Employee: " + employee)
            } else {
                // Student Attendance
                console.log("Student " + barcode)
                user = await this.studentModel.storeAttendance(data)
            }
            this.profileDetails = user.selectAttendanceProfile
            this.refreshTable()
        },
        getDateTime() {
            const currentDateTime = new Date();
            // Format the date and time as "YYYY-MM-DD HH:mm:ss"
            const formattedDateTime = `${currentDateTime.getFullYear()}-${(currentDateTime.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${currentDateTime.getDate().toString().padStart(2, '0')} ${currentDateTime
                    .getHours()
                    .toString()
                    .padStart(2, '0')}:${currentDateTime.getMinutes().toString().padStart(2, '0')}:${currentDateTime
                        .getSeconds()
                        .toString()
                        .padStart(2, '0')}`;
            return formattedDateTime.toString()
        },
        currentDate() {
            const currentDateTime = new Date();
            // Format the date and time as "YYYY-MM-DD HH:mm:ss"
            const formattedDateTime = `${currentDateTime.getFullYear()}-${(currentDateTime.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${currentDateTime.getDate().toString().padStart(2, '0')}`;
            return formattedDateTime.toString()
        },
        async refreshTable() {
            const employyeeAttendance = await this.attendanceModel.fetchUserAttendance("%" + this.currentDate() + "%", "employees")
            this.attendanceList.employee = employyeeAttendance
            const studentAttendance = this.attendanceModel.fetchUserAttendance("%" + this.currentDate() + "%", "students")
            this.attendanceList.student = studentAttendance
        }
    },
}
</script>
