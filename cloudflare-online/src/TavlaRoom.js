/* Tek otorite: Durable Object. İstemci yalnızca niyet (roll/move) gönderir. */
const BLACK=-1,WHITE=1,other=x=>-x;
const firstState=()=>{const points=Array(25).fill(0);for(const [i,n] of [[24,2],[13,5],[8,3],[6,5],[1,-2],[12,-5],[17,-3],[19,-5]])points[i]=n;return {points,turn:BLACK,dice:[],lastRoll:[],rolled:false,bar:{'-1':0,'1':0},off:{'-1':0,'1':0},winner:null,mars:false,version:0}};
const copy=s=>({...s,points:[...s.points],dice:[...s.dice],lastRoll:[...s.lastRoll],bar:{...s.bar},off:{...s.off}});
const die=()=>{const a=new Uint32Array(1),bound=Math.floor(2**32/6)*6;do{crypto.getRandomValues(a)}while(a[0]>=bound);return a[0]%6+1};
const entry=(side,d)=>side===BLACK?7-d:18+d;
const canEnter=(s,side,p)=>s.points[p]*side>=-1;
function fullDoor(s,side){return s.bar[side]>0&&Array.from({length:6},(_,i)=>i+1).every(d=>!canEnter(s,side,entry(side,d)))}
function home(s,side){if(s.bar[side])return false;for(let i=1;i<=24;i++)if(s.points[i]*side>0&&(side===BLACK?i>6:i<19))return false;return true}
function candidates(s,d){const side=s.turn,out=[];if(s.bar[side]>0){const to=entry(side,d);if(canEnter(s,side,to))out.push({from:'bar',to,die:d});return out}
for(let from=1;from<=24;from++){if(s.points[from]*side<=0)continue;const to=from+side*d;if(to>=1&&to<=24){if(canEnter(s,side,to))out.push({from,to,die:d});continue}if(!home(s,side))continue;const distance=side===BLACK?from:25-from;if(d===distance)out.push({from,to:'off',die:d});else if(d>distance){const farther=side===BLACK?s.points.slice(from+1,7).some(n=>n<0):s.points.slice(19,from).some(n=>n>0);if(!farther)out.push({from,to:'off',die:d})}}return out}
function apply(s,m){const t=copy(s),side=s.turn,i=t.dice.indexOf(m.die);if(i<0)throw Error('Zar mevcut değil');if(m.from==='bar')t.bar[side]--;else t.points[m.from]-=side;if(m.to==='off')t.off[side]++;else{if(t.points[m.to]===-side){t.points[m.to]=0;t.bar[other(side)]++}t.points[m.to]+=side}t.dice.splice(i,1);if(t.off[side]===15){t.winner=side;t.mars=t.off[other(side)]===0}return t}
function legal(s){if(!s.rolled||s.winner||!s.dice.length)return[];const opts=[...new Set(s.dice)].flatMap(d=>candidates(s,d));if(!opts.length)return[];const memo=new Map();function longest(t){if(!t.dice.length||t.winner)return 0;const key=t.points.join(',')+'|'+t.bar[-1]+':'+t.bar[1]+'|'+[...t.dice].sort().join(',');if(memo.has(key))return memo.get(key);let best=0;for(const d of new Set(t.dice))for(const m of candidates(t,d))best=Math.max(best,1+longest(apply(t,m)));memo.set(key,best);return best}
let best=0,accepted=[];for(const m of opts){const len=1+longest(apply(s,m));if(len>best){best=len;accepted=[m]}else if(len===best)accepted.push(m)}
if(best===1&&s.dice.length===2&&s.dice[0]!==s.dice[1]){const higher=Math.max(...s.dice);if(accepted.some(m=>m.die===higher))accepted=accepted.filter(m=>m.die===higher)}return accepted}
const turnOver=s=>({...s,turn:other(s.turn),rolled:false,dice:[],lastRoll:[],version:s.version+1});
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(24)),n=>n.toString(16).padStart(2,'0')).join('');
export class TavlaRoom{
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.ready=ctx.blockConcurrencyWhile(async()=>{this.game=await ctx.storage.get('game')||firstState();this.seats=await ctx.storage.get('seats')||{'-1':null,'1':null};this.connections=new Map()})}
 async fetch(request){await this.ready;if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Upgrade required',{status:426});const url=new URL(request.url),provided=url.searchParams.get('token');let side=null,issued=null;
 for(const s of [BLACK,WHITE])if(this.seats[s]&&this.seats[s]===provided){side=s;issued=provided;break}
 if(side===null)for(const s of [BLACK,WHITE])if(!this.seats[s]){side=s;issued=token();this.seats[s]=issued;break}
 if(side===null)return new Response('Oda dolu',{status:403});
 const [client,server]=Object.values(new WebSocketPair());server.accept();
 for(const [socket,seat] of this.connections)if(seat===side){try{socket.close(4001,'Yeni bağlantı')}catch{}this.connections.delete(socket)}
 this.connections.set(server,side);await this.ctx.storage.put('seats',this.seats);this.send(server,{type:'welcome',side,token:issued});this.broadcast();
 server.addEventListener('message',event=>this.receive(server,event.data).catch(()=>this.send(server,{type:'error',message:'İşlem tamamlanamadı'})));
 server.addEventListener('close',()=>{this.connections.delete(server);this.broadcast()});server.addEventListener('error',()=>{this.connections.delete(server);this.broadcast()});
 return new Response(null,{status:101,webSocket:client})}
 send(ws,data){try{if(ws.readyState===1)ws.send(JSON.stringify(data))}catch{}}
 broadcast(extra={}){const players=[...this.connections.values()],payload={type:'state',gameState:this.game,connected:{black:players.includes(BLACK),white:players.includes(WHITE)},...extra};for(const ws of this.connections.keys())this.send(ws,payload)}
 async receive(ws,raw){if(!this.connections.has(ws))return;let message;try{message=JSON.parse(raw)}catch{return this.send(ws,{type:'error',message:'Geçersiz mesaj'})}
 if(!message||!['roll','move'].includes(message.type))return;const side=this.connections.get(ws);
 if(this.game.winner)return this.send(ws,{type:'error',message:'Oyun bitti'});
 if(this.game.turn!==side)return this.send(ws,{type:'error',message:'Sıra sende değil'});
 if(new Set(this.connections.values()).size!==2)return this.send(ws,{type:'error',message:'Rakip bekleniyor'});
 let s=this.game,notice='';
 if(message.type==='roll'){if(s.rolled)return this.send(ws,{type:'error',message:'Zar zaten atıldı'});if(fullDoor(s,side)){s=turnOver(s);notice='Kapı kapalı — zar atmadan sıra geçti'}else{const a=die(),b=die();s=copy(s);s.dice=a===b?[a,a,a,a]:[a,b];s.lastRoll=[a,b];s.rolled=true;s.version++;if(legal(s).length===0){s=turnOver(s);notice='Oynanabilir hamle yok — sıra geçti'}}}
 else{if(!s.rolled)return this.send(ws,{type:'error',message:'Önce zar at'});const m=legal(s).find(x=>x.from===message.from&&x.to===message.to&&x.die===message.die);if(!m)return this.send(ws,{type:'error',message:'Geçersiz hamle'});s=apply(s,m);s.version++;if(!s.winner&&legal(s).length===0){s=turnOver(s);notice='Sıra rakibe geçti'}}
 this.game=s;await this.ctx.storage.put('game',s);this.broadcast({notice})}
}