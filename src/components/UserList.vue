<template>
    <div v-if="tabActive == 'employee'">
        <div class="card shadow border border-white mt-3">
            <div class="card-header">
                <div class="float-end">
                    <button class="btn btn-sm btn-primary" @click="importEmployeeDetails('employees')">IMPORT
                        EMPLOYEE</button>
                </div>
                <p class="h4 text-success"><b>EMPLOYEE'S INFORMATION</b></p>
            </div>
            <div class="card  border border-white">
                <table class="table table-head-fixed text-nowrap display">
                    <thead class="text-center">
                        <tr>
                            <th class="text-secondary">EMPLOYEE'S NAME</th>
                            <th>EMAIL</th>
                            <th class="text-secondary">DEPARTMENT</th>
                        </tr>
                    </thead>
                    <tbody v-if="employeeList">
                        <tr v-for="item in employeeList" :key="item.id">
                            <td>{{ item.name }}</td>
                            <td>{{ item.email }}</td>
                            <td>{{ item.department_name }}</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="4" class="text-secondary">No Data</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div v-if="tabActive == 'student'">
        <div class="card shadow border border-white mt-3">
            <div class="card-header">
                <div class="float-end">
                    <button class="btn btn-sm btn-primary" @click="importEmployeeDetails('students')">IMPORT
                        STUDENT</button>
                </div>
                <p class="h4 text-success"><b>MIDSHIPMAN'S ATTENDANCE LIST</b></p>
            </div>
            <div class="card  border border-white">
                <table class="table table-head-fixed text-nowrap display">
                    <thead class="text-center">
                        <tr>
                            <th class="text-secondary">STUDENT'S NAME</th>
                            <th>UERNME</th>
                            <th class="text-secondary">DEPARTMENT</th>
                        </tr>
                    </thead>
                    <tbody v-if="studentList">
                        <tr v-for="item in studentList" :key="item.id">
                            <td>{{ item.name }}</td>
                            <td>{{ item.username }}</td>
                            <td>{{ item.course }}</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="4" class="text-secondary">No Data</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script>
import EmployeeModel from '@/database/Employee';
import StudentsModel from '@/database/Students';
import axios from 'axios';
export default {
    data() {
        return {
            employeeModel: new EmployeeModel(),
            studentModel: new StudentsModel(),
            userList: { 'employee': [], 'student': [] },
            employeeList: [],
            studentList: []
        }
    },
    mounted() {
        // this.userTables()
    },
    methods: {
        async importEmployeeDetails(userType) {
            try {
                const response = await axios.get('data-sync');
                if (response.status == 200) {
                    if (userType === 'employees') {
                        if (response.data.employees) {
                            // Get Employee Details
                            this.employeeModel.storeEmployeeDetails(response.data.employees)
                            // Refresh Table

                        }
                    } else {
                        if (response.data.students) {
                            this.studentModel.storeStudentDetails(response.data.students)
                        }
                    }

                }
                this.userTables()
                alert("Exporting User Complete!")
            } catch (error) {
                console.log("User List Error: " + error)
            }
        },
        async userTables() {
            const employee = await this.employeeModel.viewEmployees()
            this.employeeList = employee
            const student = await this.studentModel.viewEmployees()
            this.studentList = student
        },
    },
    props: {
        tabActive: String// Pass this prop to indicate if the API is online or not
    },
};
</script>