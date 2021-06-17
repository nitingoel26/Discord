const express = require('express');
const { port } = require('./config.json');
const axios = require('axios');
const app = express();
const WebSocket = require('ws');

require('dotenv').config();

// app.get('/', (request, response) => {
// 	return response.sendFile('index.html', { root: '.' });
// });

app.get('/discord/redirect',  (request, response) => {
    console.log("hello");
    // get guild id
    const {guild_id} = request.query;
    
    // to get all text channels
    axios.get(`https://discord.com/api/guilds/${guild_id}/channels`,{
        headers: {
          'Authorization': `Bot ${process.env.BOT_TOKEN}`,
        }
      })
    .then(res=> res.data.filter(r =>r.type ==0)) // type of all text channels is zero
    .then(res=> res.map(r=>console.log(r.name)));

    // to get gateway url 
    // to get messages real time from bot
    axios.get(`https://discord.com/api/gateway/bot`,{
        headers: {
          'Authorization': `Bot ${process.env.BOT_TOKEN}`,
        }
      })
      .then(res=> {
        console.log(res.data.url);
        const ws = new WebSocket(`${res.data.url}/?v=9&encoding=json`);
        const payload = {
          "op": 2,
          "d": {
            "token":process.env.BOT_TOKEN ,
            "intents": 513,
            "properties": {
              "$os": "linux",
              "$browser": "chrome",
              "$device": "chrome"
            }
          }
        }

ws.on('open', function open() {
  ws.send(JSON.stringify(payload))
});

ws.on('message', function incoming(data) {
    let payload = JSON.parse(data);
    const {t ,event, op, d} = payload;
    console.log(t);
    switch (op)
    {
      case 10:
        const {heartbeat_interval} = d;
        interval = heartbeat(heartbeat_interval);
        break;

    }
    switch(t)
    {
      case "MESSAGE_CREATE":
        let author = d.author.username;
        let content = d.content;
        let user = d.mentions.map((user=>user.username));
        console.log(`${author}: ${content}`);
        console.log(user);
    }

})

const heartbeat = (ms)=> {
  return setInterval(()=>{
    ws.send(JSON.stringify({op: 1 , d:null}))
  }, ms);
}



      });
   

})



app.listen(port, () => console.log(`App listening at http://localhost:${port}`));