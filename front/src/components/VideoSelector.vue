<template>
  <div class="section container">
    <div class="columns is-gapless">
      <div class="column is-3"></div>
      <div class="column is-4">
        <input class="input is-4" v-model="url" @keypress.enter="parseURL(url)" :placeholder="egg">
      </div>
      <div class="column is-1">
      <button class="button" @click="parseURL(url)">add URL</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'video-selector',
  props: ['user'],
  data () {
    return {
      url: '',
      egg: 'https://www.youtube.com/watch?v=HxLy28CDoJ4'
    }
  },
  methods: {
    async parseURL (url){
      if(/SECRET=/.test(url)){
        const key = url.match(/SECRET=(.*)/)[1] || ''
        console.log('비밀은 '+key)
        this.$socket.emit('help', {key, user: this.user})
        this.url = ''
        return
      }
      else if(url == '') url = this.egg
      // https://gist.github.com/takien/4077195
      let ID = '';
      url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      if(url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
      }
      else {
        ID = url;
      }
      console.log(ID)
      if(typeof ID == 'string'){
        const json = {
          id: ID,
          username: this.user.name,
          token: this.user.token
        }
        await this.$axios.post(this.$url+'/queue', json)
      }
      else if(ID) alert('Invalid youtube URL link!.')      
      this.url = ''
    },
  }
}
</script>
