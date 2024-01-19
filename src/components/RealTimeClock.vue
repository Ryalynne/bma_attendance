<template>
    <div class="card bg-success text-center shadow border border-success">
        <div class="card-body">
            <h3 class="text-white fw-bolder display-6">{{ formattedDateTime }}</h3>
            <h1 class="text-white fw-bolder display-4">{{ currentTime }}</h1>
        </div>
    </div>
</template>
  
<script>
export default {
    data() {
        return {
            formattedDateTime: this.formatDateTime(new Date()),
            currentTime: new Date().toLocaleTimeString(),
        };
    },
    mounted() {
        this.updateDateTime();
        this.updateTime();
    },
    methods: {
        formatDateTime(date) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        },
        updateDateTime() {
            setInterval(() => {
                this.formattedDateTime = this.formatDateTime(new Date());
            }, 1000); // Update every second
        },
        updateTime() {
            setInterval(() => {
                this.currentTime = new Date().toLocaleTimeString();
            }, 1000); // Update every second
        },
    },
};
</script>