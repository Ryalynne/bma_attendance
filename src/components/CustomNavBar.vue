<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                <li class="nav-item active">
                    <router-link to="/" class="nav-link">Home</router-link>
                </li>
                <li class="nav-item">
                    <router-link to="/setting" class="nav-link">Setting</router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>
<script>
export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: "CustomNavBar"
};
</script>