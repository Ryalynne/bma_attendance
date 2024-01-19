<template>
    <div class="api-status">
        <p v-if="isApiOnline" class="online"> <small class="badge bg-primary">SERVER ONLINE</small></p>
        <p v-else class="offline"> <small class="badge bg-danger">SERVER OFFLINE</small></p>
    </div>
</template>
  
<script>
export default {
    props: {
        isApiOnline: Boolean, // Pass this prop to indicate if the API is online or not
    },
};
</script>