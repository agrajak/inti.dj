import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueSocket from 'vue-socket.io'
import VueYouTube from 'vue-youtube-embed'
import config from '../../config.json'
import moment from 'moment-timezone'
Vue.config.productionTip = false
Vue.prototype.$axios = axios
moment.tz('Asia/Seoul')
moment.locale('ko')
Vue.prototype.$moment = moment
const url = config.host + ':' + config.port
// TODO: SERVER URL VALIDATION CHECK
Vue.prototype.$url = url
Vue.use(VueYouTube)
Vue.use(new VueSocket({
  debug: false,
  connection: url
}))
new Vue({
  render: h => h(App),
}).$mount('#app')
