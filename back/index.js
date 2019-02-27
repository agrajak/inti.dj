const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser')
const cors = require('cors')
const {Queue, Users, Item} = require('./utils')
const axios = require('axios')
const moment = require('moment')
const path = require('path')
const queue = new Queue()
const serveStatic = require('serve-static')

const apiKey = require('../config.json')["ga_key"] || process.env.GA_KEY
const port = require('../config.json')["port"] || process.env.PORT || 9090
const host = require('../config.json')["host"] || process.env.HOST || 'http://127.0.0.1'
const secret = require('../config.json')["secret"] || '비밀'
const users = new Users()
app.use(cors())
app.use(serveStatic(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
const sessions = {}

io.on('connection', socket=>{
  const id = socket.id
  console.log(id+'  connected!')
  socket.on('login', (username)=> {
    try{
      console.log(id + 'logged as '+username)
      users.add(username)
      sessions[id] = username
      socket.emit('login_success', users.find(username))
    }
    catch(e){
      socket.emit('login_failed')
    }
  })
  socket.on('help', ({key, user})=>{
    console.log(' * help!')
    console.log(key, secret)
    if(key == secret){
      console.log('get power')
      users.find(user.name).level = 4
      socket.emit('msg', '당신은 힘을 얻었습니다!')
      console.log(users.find(user))
    }
    else socket.emit('msg', '잘못된 열쇠를 들고 오셨습니다.')
  })
  socket.on('disconnect', (reason) => { 
    if(id in sessions){
      console.log('his name was '+sessions[id]+ 'and disconnected + reason')
      users.remove(sessions[id])
      delete sessions[id]
    }
    console.log('one user disconnected '+reason)
  })
})
const checkQueue = () => {
  if(queue.isPlaying && !queue.isEmpty()){
    const item = queue.now()
    if(moment(item.startedAt).add(item.duration).isBefore(moment())){
      console.log(moment(item.startedAt).add(item.duration))
      console.log(moment())
      console.log('다음 곡으로 넘깁니다!')
      queue.skip(io)
    }
  }
}
const broadcast = () => {
  try {
    io.emit('is_playing', queue.isPlaying)
    io.emit('queue', queue.q)
    io.emit('users', users.list)  
  }
  catch(e){
    console.log(e)
  }
}
io.set('origins', '*:*')

app.get('/search', async (req, res) => {
  console.log('search request!')
  const q = req.query.q || ''
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoEmbeddable=true&key=${apiKey}`
  console.log('targetURL', url)
  try {
    let {data} = await axios.get(url)
    if(data){
      if(data.items){
        const videoList = data.items.map(x=>x.id.videoId).join(',')
        console.log(data.items.length)
        const _ = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoList}&key=${apiKey}&part=snippet,contentDetails`)  
        console.log(_.data.items.length)
        res.send(_.data.items)  
      }
      else res.send([])
    }  
  }
  catch(e){
    console.log(e)
    res.send([])
  }
})
app.get('/play', (req, res) => {
  console.log('hi from play')
  const {token} = req.query
  if(users.auth(token)){
    console.log('권한 충족!')
    queue.play(io)
  }
  res.send('ok')
})
app.get('/skip', (req, res) => {
  console.log('hi from play')
  const {token} = req.query
  if(users.auth(token)){
    console.log('권한 충족!')
    queue.skip(io)
    io.emit('msg', )
  }
  res.send('ok')
})
app.get('/pause', (req, res) => {
  console.log('hi from pause')
  const {token} = req.query
  if(users.auth(token)){
    queue.pause(io)
  }
  res.send('ok')
})
app.post('/queue', async (req, res)=>{
  console.log('on queue!')
  const {username, token, id} = req.body

  const {data} = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${apiKey}&part=snippet,contentDetails`)
  console.log(data)
  if(data.items && data.items.length> 0){
    const info = data.items[0]
    const title = info.snippet.title
    const duration = info.contentDetails.duration
    try{
      if(users.validate(username, token)){
        queue.add(new Item(id, title, duration, username), io)
        console.log('큐에 추가!')
        console.log(queue.size() +' :큐 사이즈 ')
        if(queue.size() == 1 && !queue.isPlaying){
          queue.play(io)
        }
      }    
      res.send('ok')
    }
    catch(e){
      console.log(e)
    }
  }
  else throw new Error('잉 이상한 비디오를 클릭했구만')
})

if(apiKey){
  server.listen(port, '0.0.0.0', () => {
    console.log(host+':'+port)
    console.log('서버켜짐 ㅋ')
  })  
}
else {
  console.log('apiKey가 존재하지 않음!')
  process.exit(0)
}
setInterval(checkQueue, 3000)
setInterval(broadcast, 1000)
