<template>
  <div id="app">
    <base-header></base-header>
    <login-section v-if="!isLogged"></login-section>
    <section>
      <video-selector v-if="isLogged" :user="user"></video-selector>
      <queue :user="user"></queue>
      <user-list-viewer></user-list-viewer>
    </section>
    <base-footer></base-footer>
  </div>
</template>

<script>
import Queue from './components/Queue.vue'
import UserListViewer from './components/UserListViewer.vue'
import VideoSelector from './components/VideoSelector.vue'
import LoginSection from './components/LoginSection'

import BaseHeader from './components/BaseHeader.vue'
import BaseFooter from './components/BaseFooter.vue'
export default {
  name: 'app',
  components: {
    VideoSelector, Queue, UserListViewer, LoginSection, BaseHeader, BaseFooter
  },
  data() {
    return {
      user: null,
    } 
  },
  computed: {
    isLogged () { return this.user }
  },
  sockets: {
    disconnect: function(){
      this.user = null
    },
    msg: function(msg){
      alert(msg)
    },
    login_success: function (user){
      this.user = user
      alert('로그인 성공!')
    },
    login_failed: function(){
      alert('로그인 실패! 다른 닉네임으로 시도해보세용')
    },
    users: function(users){
      if(this.user && !users.map(x=>x.name).includes(this.user.name)){
        console.log('로그아웃 되셨습니다.')
        this.user = null
      }
      // 바뀐 level 갱신 
      else if(this.user){
        if(users.map(x=>x.name).includes(this.user.name)){
          this.user = users.find(x=>x.name == this.user.name)
        }
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>