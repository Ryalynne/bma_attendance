<template>


    <div v-if="isLoading" class="card mt-4">
        <div class="card-body">
            <div class="modal-dialog modal-sm">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <div class="loading-spinner mb-2"></div>
                        <div>Loading</div>
                        <label for="" class="fw-bolder text-primary">Donwloading Contents...</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
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
                                <th>USERNAME</th>
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
    </div>

</template>
<style scoped>
.loading-spinner {
    width: 30px;
    height: 30px;
    border: 2px solid indigo;
    border-radius: 50%;
    border-top-color: #0001;
    display: inline-block;
    animation: loadingspinner .7s linear infinite;
}

@keyframes loadingspinner {
    0% {
        transform: rotate(0deg)
    }

    100% {
        transform: rotate(360deg)
    }
}
</style>
<script>
import EmployeeModel from '@/database/Employee';
import StudentsModel from '@/database/Students';
/* import axios from 'axios'; */
export default {
    data() {
        return {
            employeeModel: new EmployeeModel(),
            studentModel: new StudentsModel(),
            employeeList: [],
            studentList: [],
            isLoading: false
        }
    },
    mounted() {
        this.userTables()
    },
    methods: {
        async importEmployeeDetails(userType) {
            try {
                console.log(userType)
                this.isLoading = true
                if (userType == 'employees') {
                    const data = await this.employeeModel.storeEmployeeDetailsV2()
                    console.log(data)
                    this.isLoading = false
                } if (userType == 'students') {
                    const data = await this.studentModel.storeStudentDetails()
                    console.log(data)
                    this.isLoading = false
                }
                this.userTables()
            } catch (error) {
                console.log("User List Error: " + error)
            }
        },
        async userTables() {
            const employee = await this.employeeModel.viewEmployees()
            this.employeeList = employee
            const student = await this.studentModel.viewStudentLists()
            this.studentList = student
        },
    },
    props: {
        tabActive: String// Pass this prop to indicate if the API is online or not
    },
};
</script>