<template>
  <div class="content">
    <div v-if="users.length > 0">
      <h4 class="title">Users</h4>
      <h4 class="sub-title">{{users.length}} people</h4>
      <span v-for="(u, i) in users" :key="i">
        <template v-if="u.level>=4"><strong>{{u.name}}</strong></template>
        <template v-else>{{u.name}}</template>
        <span v-if="i != users.length-1">, </span>
      </span>
    </div>
    <div v-else>
      <p class="help">nobody here</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'user-list-viewer',
  props: ['user'],
  data(){
    return {
      users: []
    }
  },
  sockets: {
    users (users){
      this.users = users
    },
    disconnect: function(){
      this.users = []
    },
  }
}
</script>
