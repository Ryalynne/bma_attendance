<template>
    <div class="card mb-3 border border-white shadow">
        <div class="row g-0">
            <div class="col-md-3">
                <div class="" v-if="isOnline">
                    <img v-if="profileData" :src="profileData.image" class="img-fluid rounded" alt="image">
                    <img v-else src="@/assets/avatar.png" class="img-fluid rounded" alt="image">
                </div>
                <div v-else>
                    <img v-if="profileData" :src="profileData.image" class="img-fluid rounded" alt="image">
                    <img v-else src="@/assets/avatar.png" class="img-fluid rounded" alt="image">
                </div>
            </div>
            <div class="col-md-9">
                <div class="card-body">
                    <div class="display-6 fw-bolder text-success">{{ profileData ? profileData.name : name }}</div>
                    <span class="badge bg-secondary">{{ profileData ? profileData.department : department }}</span>
                    <div class="row">
                        <div class="col-md">
                            <label for="" class="fw-bolder text-muted h5">
                                TIME IN
                            </label> <br>
                            <label for="" class="fw-bolder text-primary h4">
                                <span v-if="isOnline">
                                    {{ profileData ? profileData.attendance.time_in : timeIn }}
                                </span>
                                <span v-else>
                                    {{ profileData ? profileData.time_in : timeIn }}
                                </span>

                            </label>
                        </div>
                        <div class="col-md">
                            <label for="" class="fw-bolder text-muted h5">
                                TIME OUT
                            </label>
                            <br>
                            <label for="" class="fw-bolder text-primary h4">
                                <span v-if="isOnline">
                                    {{ profileData ? profileData.attendance.time_out != null ?
                                        profileData.attendance.time_out :
                                        timeOut : timeOut }}
                                </span>
                                <span v-else>
                                    {{ profileData ? profileData.time_out != null ? profileData.time_out :
                                        timeOut : timeOut }}
                                </span>

                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            name: "NAME",
            department: "DEPARTMENT / COURSE",
            timeIn: '--:--',
            timeOut: '--:--',
        }
    },
    props: {
        profileData: Object, isOnline: Boolean, // Pass this prop to indicate if the API is online or not
    },
};
</script>