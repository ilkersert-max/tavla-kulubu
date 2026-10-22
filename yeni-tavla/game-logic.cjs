'use strict';
const crypto=require('node:crypto');
const other=p=>p==='w'?'b':'w';
function initial(){const board=Array(24).fill(0);board[23]=2;board[12]=5;board[7]=3;board[5]=5;board[0]=-2;board[11]=-5;board[16]=-3;board[18]=-5;return {board,bar:{w:0,b:0},off:{w:0,b:0},turn:'w',dice:[],lastRoll:[],winner:null,revision:0};}
const mine=(n,p)=>p==='w'?n>0:n<0;
const canLand=(g,i,p)=>p==='w'?g.board[i]>=-1:g.board[i]<=1;
function allHome(g,p){return !g.bar[p]&&g.board.every((n,i)=>!mine(n,p)||(p==='w'?i<=5:i>=18));}
function movesForDie(g,d){let p=g.turn,m=[];if(g.bar[p]){const i=p==='w'?24-d:d-1;if(canLand(g,i,p))m.push({from:'bar',to:i,die:d});return m;}
 const home=allHome(g,p);for(let i=0;i<24;i++){if(!mine(g.board[i],p))continue;const dest=i+(p==='w'?-d:d);if(dest>=0&&dest<24){if(canLand(g,dest,p))m.push({from:i,to:dest,die:d});continue;}if(!home)continue;const dist=p==='w'?i+1:24-i;const farther=g.board.some((n,j)=>mine(n,p)&&(p==='w'?j>i:j<i));if(d===dist||(d>dist&&!farther))m.push({from:i,to:'off',die:d});}return m;}
function apply(g,m){const p=g.turn,sgn=p==='w'?1:-1;if(m.from==='bar')g.bar[p]--;else g.board[m.from]-=sgn;if(m.to==='off')g.off[p]++;else{if(g.board[m.to]===-sgn){g.board[m.to]=0;g.bar[other(p)]++;}g.board[m.to]+=sgn;}const k=g.dice.indexOf(m.die);if(k<0)throw Error('Die absent');g.dice.splice(k,1);}
function seq(g){if(!g.dice.length)return [[]];let candidates=[];for(const d of new Set(g.dice)){for(const m of movesForDie(g,d)){const copy=structuredClone(g);apply(copy,m);for(const rem of seq(copy))candidates.push([m,...rem]);}}if(!candidates.length)return [[]];const max=Math.max(...candidates.map(c=>c.length));candidates=candidates.filter(c=>c.length===max);if(max===1&&g.dice.length===2&&g.dice[0]!==g.dice[1]){const highest=Math.max(...candidates.map(c=>c[0].die));candidates=candidates.filter(c=>c[0].die===highest);}return candidates;}
function legal(g){const a=seq(g).filter(a=>a.length).map(a=>a[0]);return a.filter((m,i)=>a.findIndex(n=>n.from===m.from&&n.to===m.to&&n.die===m.die)===i);}
function roll(g){if(g.winner||g.dice.length)throw Error('Not ready');const random=()=>crypto.randomInt(1,7);const a=random(),b=random();g.dice=a===b?[a,a,a,a]:[a,b];g.lastRoll=[a,b];g.revision++;if(!legal(g).length){g.dice=[];g.turn=other(g.turn);}return [a,b];}
function move(g,from,to,die){if(g.winner||!g.dice.length)throw Error('Not playable');const m=legal(g).find(m=>m.from===from&&m.to===to&&m.die===die);if(!m)throw Error('Illegal move');apply(g,m);if(g.off[g.turn]===15){g.winner=g.turn;}else if(!legal(g).length){g.dice=[];g.turn=other(g.turn);}g.revision++;return m;}
module.exports={initial,legal,roll,move,other};
