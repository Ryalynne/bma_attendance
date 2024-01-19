<template>
    <ul class="nav nav-underline ps-4 bg-light bg-gradient border border-success rounded shadow">
        <li class="nav-item">
            <a :class="linkStyle('employee')" @click="changeStatus('employee')">EMPLOYEE</a>
        </li>
        <li class="nav-item">
            <a :class="linkStyle('student')" @click="changeStatus('student')">STUDENT</a>
        </li>
    </ul>
    <div v-if="tabActive == 'employee'">
        <div class="card shadow border border-white mt-3">
            <div class="card-header">
                <p class="h4 text-success"><b>EMPLOYEE'S ATTENDANCE LIST</b></p>
            </div>
            <div class="card  border border-white">
                <table class="table table-head-fixed text-nowrap display">
                    <thead class="text-center">
                        <tr>
                            <th class="text-secondary">EMPLOYEE</th>
                            <th class="text-secondary">DEPARTMENT</th>
                            <th class="text-secondary">TIME IN</th>
                            <th class="text-secondary">TIME OUT</th>
                        </tr>
                    </thead>
                    <tbody v-if="attendanceList.employee">
                        <tr v-for="item in attendanceList.employee" :key="item.id">
                            <td>{{ setName(item) }}</td>
                            <td>{{ item.department }}</td>
                            <td>{{ convertTime(item.time_in) }}</td>
                            <td>{{ item.time_out ? convertTime(item.time_out) : '' }}</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="4">No Data</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div v-if="tabActive == 'student'">
        <div class="card shadow border border-white mt-3">
            <div class="card-header">
                <p class="h4 text-success"><b>MIDSHIPMAN'S ATTENDANCE LIST</b></p>
            </div>
            <div class="card  border border-white">
                <table class="table table-head-fixed text-nowrap display">
                    <thead class="text-center">
                        <tr>
                            <th class="text-secondary">MIDSHIPMAN</th>
                            <th class="text-secondary">COURSE</th>
                            <th class="text-secondary">TIME IN</th>
                            <th class="text-secondary">TIME OUT</th>
                        </tr>
                    </thead>
                    <tbody v-if="attendanceList.student">
                        <tr v-for="item in attendanceList.student" :key="item.id">
                            <td>{{ setName(item) }}</td>
                            <td>{{ item.course_name }}</td>
                            <td>{{ convertTime(item.time_in) }}</td>
                            <td>{{ item.time_out ? convertTime(item.time_out) : '' }}</td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="4">No Data</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            tabActive: 'employee'
        }
    },
    methods: {
        linkStyle(data) {
            return this.tabActive == data ? 'nav-link fw-bolder text-success active' : 'nav-link text-muted'
        },
        changeStatus(data) {
            this.tabActive = data
            console.log(data)
        },
        setName(data) {
            let name = data.first_name + ' ' + data.last_name
            if (!data.first_name) {
                name = data.name
            } else {
                name = name.toUpperCase()
            }
            return name
        },
        convertTime(data) {
            const dateObject = new Date(data)
            return dateObject.toLocaleTimeString()
        }
    },
    props: {
        attendanceList: Object, // Pass this prop to indicate if the API is online or not
    },
};
</script>