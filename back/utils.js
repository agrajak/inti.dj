const sha1 = require('sha1')
const moment = require('moment-timezone')
const salt = require('../config.json')["secret"] || '비밀'

class Queue {
  constructor(){
    this.q = []
    this.isPlaying = false
  }
  size(){
    return this.q.length
  }
  emit(socket){
    socket.emit('is_playing', this.isPlaying)
  }
  add(item, socket){
    console.log(' * add()')
    this.q.push(item)
    // if(this.isPlaying) this.play(socket)
    socket.emit('msg', `${item.uploadedBy}님이 노래 ${item.title}를 큐에 추가했습니다.`)
  }
  isEmpty(){
    return this.q.length==0
  }
  play(socket){
    console.log(' * play()')
    if(!this.isEmpty()){
      socket.emit('msg', `노래 ${this.now().title}이 시작됩니다.`)
      if(this.now().done != 0){
        this.now().startedAt = moment().diff(this.now().done)
      }
      else this.now().startedAt = moment()
      this.isPlaying = true
      this.emit(socket)
    }
    else {
      this.isPlaying = false
      this.emit(socket)
    }
  }
  pause(socket){
    console.log(' * pause()')
    this.isPlaying = false
    if(this.now()){
      this.now().done = moment().diff(this.now().startedAt)
    }
    this.emit(socket)
  }
  now(){
    if(this.isEmpty()) return null
    return this.q[0]
  }
  skip(socket){
    console.log(' * pop()')

    if(!this.isEmpty()){
      socket.emit('msg', `노래 ${this.now().title}이 작업큐에서 빠졌습니다.`)
      this.q.splice(0,1)
      console.log('q : '+this.q)
      if(this.isPlaying){
        if(!this.isEmpty()){
          this.play(socket)
        }
        else {
          this.pause(socket)
          socket.emit('msg','큐에 노래가 없어서 노래를 중단합니다')
        }
      }
    }
  }
}

class Item {
  constructor(id, title, duration, username){
    this.id = id
    this.title = title
    this.duration = moment.duration(duration)
    this.startedAt = 0
    this.done= 0
    this.uploadedBy = username
  }
}
class Users {
  constructor(){
    this.list = []
  }
  length() {
    return this.list.length
  }
  validate (userName, token){
    if(this.list.find(x=>x.name == userName)){
      return this.list.find(x=>x.name == userName).token == token
    }
    return false
  }
  find(userName){
    if(this.list.map(x=>x.name).includes(userName)){
      return this.list.find(x=>x.name == userName)
    }
    return null
  }
  auth(token){
    console.log('* on auth!')
    console.log(this.list)
    return this.list.find(x=>x.token == token)
  }
  add(userName){
    // Make a Token
    const token = sha1(userName+salt)
    if(this.list.map(x=>x.name).includes(userName)){
      throw new Error('이미 그 아이디를 사용하는 사람이 있습니다!')
    }
    const obj = {
      name: userName,
      token,
      level: 1
      // level: userName == 'agrajak'?4:4
    }
    this.list.push(obj)
    return obj
  }
  remove(userName){
    let index = this.list.find(x=>x.name == userName)
    if(index != -1){
      this.list.splice(index, 1)
    }
  }
}
module.exports = {Queue, Users, Item}