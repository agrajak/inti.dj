<template>
  <div class="section">
    <div class="columns is-gapless">
      <div class="column is-3"></div>
      <div class="column is-4">
        <input class="input is-4" v-model="name" @keypress.enter="logIn" placeholder="Any nickname">
      </div>
      <div class="column is-1">
        <button class="button" @click="logIn">Enter</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'login-section',
  data(){
    return {
      name: ''
    }
  },
  methods: {
    async logIn(){
      this.$socket.emit('login', this.name)
    },

  }
}
</script>

