'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {WebSocketServer}=require('ws');
const {initial,legal,roll,move}=require('./game-logic.cjs');
const PORT=Number(process.env.PORT||3000),rooms=new Map(),MAX_ROOMS=500;
const html=fs.readFileSync(path.join(__dirname,'index.html'));
const server=http.createServer((req,res)=>{
 if(req.method!=='GET'){res.writeHead(405);return res.end();}
 const u=new URL(req.url,'http://localhost');
 if(u.pathname==='/'||u.pathname==='/index.html'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(html);}
 if(u.pathname==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true}));}
 res.writeHead(404);res.end();
});
const wss=new WebSocketServer({server,path:'/ws',maxPayload:4096});
const reply=(ws,data)=>{if(ws?.readyState===1)ws.send(JSON.stringify(data));};
function broadcast(room){
 const players=Object.fromEntries(['w','b'].map(p=>[p,{name:room.players[p]?.name||'Oyuncu',connected:room.players[p]?.socket?.readyState===1}]));
 for(const role of ['w','b']){const s=room.players[role]?.socket;if(s)reply(s,{type:'state',game:room.game,players,role,ready:!!(players.w.connected&&players.b.connected),room:room.code,legal:room.game.turn===role?legal(room.game):[]});}
}
function roomCode(){let c;do{c=String(crypto.randomInt(100000,1000000));}while(rooms.has(c));return c;}
wss.on('connection',socket=>{
 let membership=null;
 socket.on('message',raw=>{
  let data;try{data=JSON.parse(raw.toString());}catch{return reply(socket,{type:'error',message:'Geçersiz veri'});}
  try{
   if(data.type==='create'){
    if(membership)throw Error('Zaten bir masadasın');
    if(rooms.size>=MAX_ROOMS)throw Error('Sunucu kapasitesi dolu');
    const code=roomCode(),room={code,game:initial(),players:{},created:Date.now()};
    rooms.set(code,room);
    const token=crypto.randomBytes(24).toString('hex');
    room.players.w={token,name:String(data.name||'Beyaz').trim().slice(0,24)||'Beyaz',socket};
    membership={code,role:'w'};
    reply(socket,{type:'joined',code,role:'w',token});broadcast(room);return;
   }
   if(data.type==='join'){
    if(membership)throw Error('Zaten bir masadasın');
    const code=String(data.code||''),room=rooms.get(code);if(!room)throw Error('Masa bulunamadı');
    let role='b';
    if(data.token){const found=['w','b'].find(p=>room.players[p]?.token===data.token);if(found)role=found;else throw Error('Oturum anahtarı geçersiz');}
    else if(room.players.b)throw Error('Masa dolu');
    if(!room.players[role])room.players[role]={token:crypto.randomBytes(24).toString('hex'),name:String(data.name||'Siyah').trim().slice(0,24)||'Siyah'};
    const p=room.players[role];if(p.socket&&p.socket!==socket)try{p.socket.close(4001,'reconnected');}catch(_){}
    p.socket=socket;membership={code,role};
    reply(socket,{type:'joined',code,role,token:p.token});broadcast(room);return;
   }
   if(!membership)throw Error('Önce masaya katıl');
   const room=rooms.get(membership.code);if(!room)throw Error('Masa kapandı');
   const role=membership.role;
   if(room.players[role]?.socket!==socket)throw Error('Oturum geçersiz');
   if(!room.players.w?.socket||!room.players.b?.socket||room.players.w.socket.readyState!==1||room.players.b.socket.readyState!==1)throw Error('Rakip bekleniyor');
   if(room.game.turn!==role)throw Error('Sıra rakipte');
   if(data.type==='roll'){roll(room.game);broadcast(room);return;}
   if(data.type==='move'){
    if(!Number.isInteger(data.die)||data.die<1||data.die>6)throw Error('Zar geçersiz');
    if(!(data.from==='bar'||Number.isInteger(data.from)&&data.from>=0&&data.from<24))throw Error('Kaynak geçersiz');
    if(!(data.to==='off'||Number.isInteger(data.to)&&data.to>=0&&data.to<24))throw Error('Hedef geçersiz');
    move(room.game,data.from,data.to,data.die);broadcast(room);return;
   }
   throw Error('Bilinmeyen komut');
  }catch(e){reply(socket,{type:'error',message:e.message});}
 });
 socket.on('close',()=>{if(!membership)return;const r=rooms.get(membership.code);if(!r)return;const player=r.players[membership.role];if(player?.socket===socket){player.socket=null;broadcast(r);}});
});
setInterval(()=>{const now=Date.now();for(const [code,r]of rooms)if(now-r.created>12*60*60*1000&&!['w','b'].some(p=>r.players[p]?.socket?.readyState===1))rooms.delete(code);},60*60*1000).unref();
server.listen(PORT,'0.0.0.0',()=>console.log('Tavla server http://localhost:'+PORT));
