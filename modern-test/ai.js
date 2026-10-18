/* Independent zero-dependency bot policy. Black is the bot. */
(function(root){'use strict';
function score(state,m,level){
 const R=root.TavlaRules,sgn=state.turn==='white'?1:-1,op=state.turn==='white'?'black':'white';
 const hit=m.to!=='off'&&state.points[m.to]===-sgn;
 const after=R.move(state,m);
 if(level==='easy')return Math.random();
 let v=(m.to==='off'?25:0)+(hit?18:0);
 if(m.to!=='off'){const count=after.points[m.to]*sgn;if(count===2)v+=11;if(count===1)v-=level==='hard'?10:4}
 if(level==='hard'){
  v+=(after.off[state.turn]-state.off[state.turn])*18;
  v+=(after.bar[op]-state.bar[op])*9;
  // Keep single checkers safer and encourage forward travel.
  const track=R.TRACK[state.turn];
  if(m.to!=='off')v+=(track.indexOf(m.to)-track.indexOf(m.from==='bar'?track[0]:m.from))*.45;
  v+=after.points.reduce((sum,n,i)=>sum+(n*sgn===1?-Math.min(8,24-track.indexOf(i))*.17:0),0);
 }
 return v+Math.random()*(level==='hard'?1:8);
}
function choose(state,level){const moves=root.TavlaRules.legalMoves(state);if(!moves.length)return null;return moves.reduce((best,m)=>!best||score(state,m,level)>score(state,best,level)?m:best,null)}
root.TavlaAI=Object.freeze({choose});
})(typeof globalThis!=='undefined'?globalThis:this);
