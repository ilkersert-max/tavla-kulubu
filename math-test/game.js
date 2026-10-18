import {WHITE,initialState,clone,roll,legalMoves,doMove,canEndTurn,endTurn,homeReady} from './rules.js';
import {W,H,draw,pointX,pointY,pointer,pointHit} from './render.js';
const $=id=>document.getElementById(id);
const canvas=$('board'),ctx=canvas.getContext('2d');
let state=initialState(),view=WHITE,selected=null,history=[],moving=false,anim=null,raf=0;
let autoOff=false,autoPrompted={'1':false,'-1':false};
const dice=()=>1+Math.floor(Math.random()*6);
const label=side=>side===WHITE?'Beyaz':'Kırmızı';
const legal=()=>legalMoves(state);
function paint(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;draw(ctx,state,{view,selected,targets:selected===null?[]:legal().filter(m=>m.from===selected).map(m=>m.to).filter(Number.isInteger),animation:anim})})}
function refresh(){const options=legal();$('status').textContent=state.winner?label(state.winner)+' kazandı!':label(state.turn)+' oynuyor · '+(state.rolled?'Kalan zarlar: '+(state.dice.join(', ')||'yok'):'Zar bekleniyor')+' · Kırık: Beyaz '+state.bar['-1']+', Kırmızı '+state.bar['1'];$('roll').disabled=!!state.winner||state.rolled||moving;$('undo').disabled=!history.length||moving;$('end').disabled=moving||!canEndTurn(state);$('info').textContent=selected!==null?'Sarı işaretli hedefe dokunun.':options.length?'Oynanabilir pullardan birini seçin.':state.rolled?'Hamle yok, sırayı bitirebilirsiniz.':'Zar atın.';paint()}
function fit(){const r=$('stage').getBoundingClientRect();if(!r.width||!r.height)return;const k=Math.min(r.width/W,r.height/H);canvas.style.width=Math.max(1,Math.floor(W*k))+'px';canvas.style.height=Math.max(1,Math.floor(H*k))+'px';paint()}
function maybeOfferAuto(){if(state.winner||autoPrompted[state.turn]||!homeReady(state,state.turn))return;autoPrompted[state.turn]=true;if(confirm(label(state.turn)+' tüm pullarını evine getirdi. Otomatik Topla açılsın mı?')){$('auto').checked=true;autoOff=true}}
function afterMove(){refresh();maybeOfferAuto();if(autoOff)queueMicrotask(autoCollect)}
function play(move){if(moving||state.winner)return;const previous=state,result=doMove(state,move);history.push(clone(state));moving=true;const source=move.from==='bar'?{x:493,y:state.turn===WHITE?510:210}:{x:pointX(move.from),y:pointY(move.from)},dest=move.to==='off'?{x:954,y:state.turn===WHITE?545:200}:{x:pointX(move.to),y:pointY(move.to)},start=performance.now(),duration=165;state=result;selected=null;refresh();function frame(now){const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);anim={from:move.from,x:source.x+(dest.x-source.x)*ease,y:source.y+(dest.y-source.y)*ease,side:previous.turn};draw(ctx,previous,{view,animation:anim});if(t<1)requestAnimationFrame(frame);else{anim=null;moving=false;afterMove()}}requestAnimationFrame(frame)}
function autoCollect(){if(!autoOff||moving||state.winner||!state.rolled||!homeReady(state,state.turn))return;const m=legal().find(x=>x.to==='off');if(m)play(m)}
canvas.addEventListener('pointerup',e=>{if(moving||state.winner||!state.rolled)return;const p=pointer(e,canvas,view),raw=pointer(e,canvas,WHITE),pos=raw.x>=925&&raw.x<1000?'off':pointHit(p);if(pos===null)return;const options=legal(),m=selected!==null?options.find(x=>x.from===selected&&x.to===pos):null;if(m){play(m);return}selected=options.some(x=>x.from===pos)?pos:null;refresh()});
$('roll').onclick=()=>{if(moving||state.rolled||state.winner)return;const a=dice(),b=dice();state=roll(state,a,b);state.lastRoll=[a,b];history=[];selected=null;refresh();maybeOfferAuto();if(autoOff)autoCollect()};
$('undo').onclick=()=>{if(moving||!history.length)return;state=history.pop();selected=null;refresh()};
$('end').onclick=()=>{if(moving||!canEndTurn(state))return;state=endTurn(state);selected=null;history=[];refresh()};
$('reset').onclick=()=>{if(moving)return;state=initialState();selected=null;history=[];autoPrompted={'1':false,'-1':false};refresh()};
$('perspective').onclick=()=>{view=-view;$('perspective').textContent='Bakış: '+label(view);paint()};
$('auto').onchange=()=>{autoOff=$('auto').checked;if(autoOff)autoCollect()};
$('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else $('app').requestFullscreen?.().catch(()=>{$('info').textContent='Tarayıcı tam ekranı desteklemiyor.'})};
new ResizeObserver(fit).observe($('stage'));document.addEventListener('fullscreenchange',fit);fit();refresh();
