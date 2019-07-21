> plug.dj clone project using socket.io, vue, express

2019-02 인트아이 해커톤 결과물

### Screentshot
![Imgur](https://i.imgur.com/5j0oTYJ.jpg)


## Install

### Install @vue/cli 3.0 
```bash
$ npm i -g @vue/cli
```
### Before you build..
make config.json in root directory
```json
{
  "secret" : "your_secret",
  "ga_key": "google api key (Youtube Data V3)",
  "host": "host_ip_address",
  "port": 9090  
}
or you can set ENV (SECRET, GA_KEY, HOST, PORT)
```
### Build the /front
```bash
$ npm run build
```
### Run backend server
```bash
$ npm run serve
```

