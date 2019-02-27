<template>
  <div class="section content">
    <div v-if="now">
      <div id="player" class="container">
        <h4 class="title">{{isPlaying?'🎵 N o w  P l a y i n g 🎵':'😴'}}</h4>
        <h3>
          {{now.title}} by <small>{{now.uploadedBy}}</small>
        </h3>
        <youtube :video-id="now.id" @ready="mount" @paused="sync" @playing="sync" :player-vars="{origin:this.$url}"></youtube>
          
        <div id="control" v-if="user">
          <div v-if="user.level >= 4">
            <button class="button is-small is-success is-rounded" @click="togglePlay">{{isPlaying?'pause':'resume'}}</button>
            <button class="button is-small is-info is-rounded" @click="skip">{{'🗑️'}}</button>
          </div>
          <p v-else>
            <small>
              you need key to control the music queue.
            </small>
          </p>
        </div>

        <!-- </div> -->
        <!-- {{now}} <br> -->
        <div v-if="now">
          [ {{done}} / {{duration}} ]  <small> {{$moment.duration(duration).subtract(done).asSeconds()}} seconds left till next video </small>
          <br>
          <button class="button is-small" @click="sync(true)">sync</button>
        </div>
      </div>
      <div id="queue-list" v-if="list.length > 0 " class="container">
        <br>
        <h4 class="title">Playlist</h4>
        <div class="columns is-multiline">
          <div v-for="(item, i) in list" class="column is-3" :key="i">
            <div class="card">
              <div class="card-content">
                <div class="content">
                  {{item.title}} <span v-if="i==0">🎸</span>
                  <p class="help">by {{item.uploadedBy}}, 
                    {{$moment.duration(item.duration).humanize()}}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      please add a url
    </div>
  </div>
</template>
<script>
import moment from 'moment-timezone'
export default {
  name: 'queue',
  props: ['user'],
  sockets: {
    queue: function(list){
      this.list = list
    },
    is_playing: function(flag){
      this.isPlaying = flag
      this.sync()
    }
  },
  data() {
    return {
      list: [],
      isPlaying: false
    }
  },
  methods: {
    dFor (duration){
      const m = moment.duration(duration)
      return m.hours()+':'+m.minutes()+':'+m.seconds()
    },
    mount (e){
      this.player = e.target
    },
    sync(flag){
      //https://developers.google.com/youtube/iframe_api_reference?hl=ko#Playback_status
      if(this.now){
        if(this.isPlaying){
          const d = moment.duration(moment().diff(moment(this.now.startedAt).add(this.now.duration)))
          // console.log(d)
          this.sync_time(d.hours()*3600+d.minutes()*60 + d.seconds(), flag)
          if(this.player && this.player.getPlayerState() == 2){ // 멈추면 다시 일어나라
          console.log('일어나라 핫싼')
            this.player.playVideo()
          }
          else if(this.player && this.player.getPlayerState() == 3){ // 버퍼링
            this.player.setPlaybackQuality('default')
          }
        }
        else {
          if(this.player && this.player.getPlayerState() == 1){
            this.player.stopVideo()
          }
        }
      }
    },
    sync_time(s, flag){
      if(this.player){
        if(flag===true || Math.abs(this.player.getCurrentTime()-s) > 10){
          console.log('seek')
          this.player.seekTo(s)
        }
      }
    },
    async togglePlay(){
      console.log('토글!')
      if(this.user && this.user.level == 4){
        console.log('조건 만족!')
        console.log(this.user, this.user.level)
        if(this.isPlaying) await this.$axios.get(this.$url+'/pause?token='+this.user.token)
        else await this.$axios.get(this.$url+'/play?token='+this.user.token)
      }
    },
    async skip(){
      await this.$axios.get(this.$url+'/skip?token='+this.user.token)
    },

  },
  computed: {
    now (){
      if(this.list.length > 0){
        return this.list[0]
      }
      return null
    },
    duration (){
      if(!this.now) return null
      return this.dFor(this.now.duration)
    },
    done(){
      if(!this.now) return null
      if(this.isPlaying){
        return this.dFor(moment().diff(moment(this.now.startedAt).add(this.now.duration)))
      }
      else {
        return this.dFor(this.now.done)
      }
    },

  }
}
</script>
