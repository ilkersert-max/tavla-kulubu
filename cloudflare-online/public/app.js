/* Cloudflare DO authoritative state: client only sends roll/move intentions. */
const $=id=>document.getElementById(id);
const BLACK=-1,WHITE=1;
let ws=null,room='',seat=null,game=null,moves=[],selected=null,connected={black:false,white:false},botGame=false;
const name=s=>s===BLACK?'Siyah':'Beyaz';
const protocol=()=>location.protocol==='https:'?'wss:':'ws:';
const show=(id,on)=>$(id).hidden=!on;
const notice=message=>{$('notice').textContent=message};
function send(data){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data));else notice('Bağlantı yok, tekrar deneyin.')}
function enter(code,bot=false){room=code;botGame=bot;selected=null;const key='tavla-seat-'+code,token=localStorage.getItem(key);if(ws){ws.onclose=null;ws.close()}const url=protocol()+'//'+location.host+'/ws/'+encodeURIComponent(code)+(bot?'?bot=1'+(token?'&token='+encodeURIComponent(token):''):(token?'?token='+encodeURIComponent(token):''));ws=new WebSocket(url);$('connection').textContent='Bağlanıyor…';ws.onopen=()=>{$('connection').textContent='Bağlandı';history.replaceState(null,'','?oda='+encodeURIComponent(room)+(botGame?'&bot=1':''))};ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}if(m.type==='welcome'){seat=m.side;localStorage.setItem(key,m.token);$('identity').textContent='Sen: '+name(seat);show('lobby',false);show('game',true);if(!botGame){$('roomCode').textContent=room;$('inviteLink').textContent=location.origin+location.pathname+'?oda='+encodeURIComponent(room);show('inviteBox',true)}else show('inviteBox',false)}else if(m.type==='state'){game=m.gameState;moves=m.moves||[];connected=m.connected||{};if(!moves.some(x=>x.from===selected))selected=null;render();if(m.notice)notice(m.notice)}else if(m.type==='error'){notice(m.message);$('lobbyError').textContent=m.message}};ws.onclose=e=>{$('connection').textContent='Bağlantı kapandı';if(e.code===1006)notice('Sunucu bağlantısı kesildi. Sayfayı yenileyerek yeniden bağlan.')};ws.onerror=()=>{$('connection').textContent='Bağlantı hatası';$('lobbyError').textContent='Sunucuya erişilemiyor; Worker dağıtımını kontrol edin.'}}
function checker(side){const e=document.createElement('span');e.className='checker '+(side===WHITE?'white':'black');return e}
function point(n,top){const b=document.createElement('button');b.type='button';b.className='point '+(top?'top':'bottom');b.style.setProperty('--triangle',n%2?'#f0dfc4':'#cc5b4c');if(n<=6||n>=19)b.classList.add('home');if(selected===n)b.classList.add('selected');if(seat===game.turn&&moves.some(m=>m.from===selected&&m.to===n))b.classList.add('valid');const label=document.createElement('span');label.className='number';label.textContent=n;const st=document.createElement('span');st.className='stack';const count=game.points[n];for(let i=0;i<Math.min(6,Math.abs(count));i++)st.append(checker(Math.sign(count)));if(Math.abs(count)>6){const extra=document.createElement('span');extra.className='more';extra.textContent='×'+Math.abs(count);st.append(extra)}b.append(label,st);b.onclick=()=>clickPoint(n);return b}
function quad(id,nums,top){$(id).replaceChildren(...nums.map(n=>point(n,top)))}
function barStack(id,side){const el=$(id);el.replaceChildren();for(let i=0;i<Math.min(5,game.bar[side]);i++)el.append(checker(side));if(game.bar[side]>5)el.append('×'+game.bar[side])}
function render(){if(!game)return;const myTurn=seat===game.turn,ready=connected.black&&connected.white;const root=$('board');root.classList.toggle('flipped',seat===WHITE);
 // Unrotated DOM: 24..19 | BAR | 18..13, lower 1..6 | BAR | 7..12.
 quad('tl',[24,23,22,21,20,19],true);quad('tr',[18,17,16,15,14,13],true);
 quad('bl',[1,2,3,4,5,6],false);quad('br',[7,8,9,10,11,12],false);
 barStack('barWhite',WHITE);barStack('barBlack',BLACK);
 $('whiteOff').textContent=game.off[WHITE];$('blackOff').textContent=game.off[BLACK];
 for(const [side,id] of [[WHITE,'whiteTray'],[BLACK,'blackTray']])$(id).classList.toggle('valid',myTurn&&moves.some(m=>m.from===selected&&m.to==='off')&&game.turn===side);
 $('turn').textContent=game.winner?name(game.winner)+' kazandı'+(game.mars?' — MARS!':''):!ready?'Rakip bekleniyor':myTurn?'Sıra sende':'Sıra '+name(game.turn)+' oyuncusunda';
 $('roll').disabled=!myTurn||!ready||game.rolled||!!game.winner;
 $('dice').textContent=game.rolled?'🎲 '+game.dice.join(' · '):game.lastRoll?.length?'Son zar: '+game.lastRoll.join(' · '):'🎲 Zar bekleniyor';
 $('counters').textContent='Kırık: Siyah '+game.bar[BLACK]+' / Beyaz '+game.bar[WHITE]+' · Toplanan: Siyah '+game.off[BLACK]+' / Beyaz '+game.off[WHITE];
 if(!ready)notice('İkinci oyuncu bekleniyor. Masa kodu: '+room+' · Davet: '+location.origin+location.pathname+'?oda='+encodeURIComponent(room));
 else if(game.winner)notice(game.mars?'Mars! '+name(game.winner)+' kazandı.':name(game.winner)+' kazandı!');
 else if(myTurn&&game.rolled)notice(game.bar[seat]?'Önce bardaki pulunu oyuna sok.':'Bir pul seç, ardından yeşil hedefe dokun.');
}
function play(from,to){const move=moves.find(m=>m.from===from&&m.to===to);if(!move)return false;send({type:'move',from:move.from,to:move.to,die:move.die});selected=null;return true}
function clickPoint(n){if(!game||seat!==game.turn||!game.rolled||game.winner)return;if(game.bar[seat]>0){selected='bar';if(!play('bar',n))notice('Kırık pul için geçerli giriş seç.');render();return}if(selected!==null&&play(selected,n)){render();return}if(moves.some(m=>m.from===n)){selected=n;render()}else notice('Bu hane için geçerli hamle yok.')}
$('bar').onclick=()=>{if(game&&game.turn===seat&&game.bar[seat]>0){selected='bar';render()}};
for(const [side,id] of [[WHITE,'whiteTray'],[BLACK,'blackTray']])$(id).onclick=()=>{if(game&&seat===game.turn&&seat===side)if(!play(selected,'off'))notice('Önce toplanabilecek bir pul seç.')};
$('join').onsubmit=e=>{e.preventDefault();const code=$('code').value.trim().toUpperCase();if(!/^[A-Z0-9]{5,8}$/.test(code)){ $('lobbyError').textContent='5–8 harf veya rakam girin.';return}enter(code,false)};
$('roll').onclick=()=>send({type:'roll'});
$('leave').onclick=()=>{if(ws){ws.onclose=null;ws.close()}show('game',false);show('lobby',true);game=null;seat=null;history.replaceState(null,'',location.pathname)};
function newCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',v=new Uint8Array(8);crypto.getRandomValues(v);return Array.from(v,n=>chars[n%chars.length]).join('')}
$('createRoom').onclick=()=>{const code=newCode();$('code').value=code;$('roomCode').textContent=code;$('inviteLink').textContent=location.origin+location.pathname+'?oda='+encodeURIComponent(code);show('inviteBox',true);enter(code,false)};
$('botStart').onclick=()=>{show('inviteBox',false);enter('BOT'+newCode(),true)};
$('copyInvite').onclick=async()=>{const link=location.origin+location.pathname+'?oda='+encodeURIComponent(room);try{await navigator.clipboard.writeText(link);$('copyInvite').textContent='Kopyalandı ✓'}catch{$('lobbyError').textContent='Davet bağlantısı: '+link}};
const args=new URLSearchParams(location.search),incoming=args.get('oda');if(incoming&&/^[A-Z0-9]{5,12}$/i.test(incoming)){const code=incoming.toUpperCase();$('code').value=code;enter(code,args.get('bot')==='1')}
