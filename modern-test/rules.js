/* Tavla rules: pure state transitions; no Canvas/DOM, no external dependencies. */
(function(root){
'use strict';
const TRACK={white:Array.from({length:24},(_,i)=>23-i),black:[...Array.from({length:12},(_,i)=>11-i),...Array.from({length:12},(_,i)=>23-i)]};
const sign=side=>side==='white'?1:-1;
function copy(x){return {...x,points:[...x.points],dice:[...x.dice],bar:{...x.bar},off:{...x.off}}}
function basicMoves(state,die){
 const side=state.turn,sgn=sign(side),track=TRACK[side],out=[];
 const froms=state.bar[side]>0?['bar']:track.filter(i=>state.points[i]*sgn>0);
 const allHome=state.bar[side]===0&&state.points.every((n,i)=>n*sgn<=0||track.indexOf(i)>=18);
 for(const from of froms){
  const index=from==='bar'?-1:track.indexOf(from),dest=index+die;
  if(dest<24){const to=track[dest];if(state.points[to]*sgn>=-1)out.push({from,to,die});continue}
  if(from==='bar'||!allHome)continue;
  if(dest===24||!track.slice(0,index).some(i=>state.points[i]*sgn>0))out.push({from,to:'off',die});
 }
 return out;
}
function apply(x,m){
 const sgn=sign(x.turn),other=x.turn==='white'?'black':'white',di=x.dice.indexOf(m.die);
 if(di<0)throw Error('Zar mevcut değil');
 if(m.from==='bar')x.bar[x.turn]--;else x.points[m.from]-=sgn;
 if(m.to==='off')x.off[x.turn]++;
 else {if(x.points[m.to]===-sgn){x.points[m.to]=0;x.bar[other]++}x.points[m.to]+=sgn}
 x.dice.splice(di,1);
 if(x.off[x.turn]===15)x.winner=x.turn;
 return x;
}
function legalMoves(x){
 if(x.winner||!x.rolled||!x.dice.length)return[];
 const raw=[...new Set(x.dice)].flatMap(d=>basicMoves(x,d));
 if(!raw.length)return[];
 const longest=(state,depth)=>{if(depth>=4||!state.dice.length)return 0;let max=0;for(const d of new Set(state.dice)){for(const m of basicMoves(state,d)){const next=copy(state);apply(next,m);max=Math.max(max,1+longest(next,depth+1))}}return max};
 let best=0,result=[];
 for(const m of raw){const next=copy(x);apply(next,m);const count=1+longest(next,1);if(count>best){best=count;result=[m]}else if(count===best)result.push(m)}
 if(best===1&&x.dice.length===2&&x.dice[0]!==x.dice[1]){
  const high=Math.max(...x.dice);if(result.some(m=>m.die===high))result=result.filter(m=>m.die===high);
 }
 return result;
}
function isValidMove(x,m){return legalMoves(x).some(a=>a.from===m.from&&a.to===m.to&&a.die===m.die)}
function move(x,m){if(!isValidMove(x,m))throw Error('Geçersiz hamle');return apply(copy(x),m)}
function canFinish(x){return !!x.rolled&&!x.winner&&legalMoves(x).length===0}
function initial(){const x={points:Array(24).fill(0),turn:'white',dice:[],bar:{white:0,black:0},off:{white:0,black:0},rolled:false,winner:null};for(const [i,n] of [[23,2],[12,5],[7,3],[5,5],[11,-2],[0,-5],[19,-3],[17,-5]])x.points[i]=n;return x}
root.TavlaRules=Object.freeze({TRACK,copy,basicMoves,legalMoves,move,canFinish,initial});
})(typeof globalThis!=='undefined'?globalThis:this);
