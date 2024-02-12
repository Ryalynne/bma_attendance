<template>
    <div class="row">
        <div class="col-md-4">
            <button class="btn btn-info text-white mt-2 w-100" @click="changeUser('employee')">Employee</button>
            <button class="btn btn-success text-white mt-2 w-100" @click="changeUser('student')">Students</button>

        </div>
        <div class="col-md-8">
            <UserList :tabActive="userType" />
        </div>
    </div>
</template>
<script>
import EmployeeModel from '@/database/Employee'
import AttendanceModel from "@/database/Attendance"
import UserList from '@/components/UserList.vue'
export default {
    name: 'App',
    components: {
        UserList
    },
    data() {
        return {
            profileDetails: null,
            userList: { 'employee': [], 'student': [] },
            attendanceModel: new AttendanceModel(),
            employeeModel: new EmployeeModel(),
            userType: 'employee'
        }
    },
    methods: {
        changeUser(user) {
            this.userType = user
        }
    }
}
</script>
