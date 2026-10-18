/* Runs in browser or Node.js (without dependencies). */
(function(){
'use strict';
const R=globalThis.TavlaRules,tests=[],assert=(v,msg)=>{if(!v)throw Error(msg)};
function test(name,fn){try{fn();tests.push({name,ok:true})}catch(e){tests.push({name,ok:false,error:e.message})}}
function state(side='white',dice=[1]){return {points:Array(24).fill(0),turn:side,dice:[...dice],bar:{white:0,black:0},off:{white:0,black:0},rolled:true,winner:null}}
test('Initial 15 pieces per side',()=>{let x=R.initial();assert(x.points.filter(n=>n>0).reduce((a,b)=>a+b,0)===15,'white count');assert(x.points.filter(n=>n<0).reduce((a,b)=>a-b,0)===15,'black count')});
test('Each route visits 24 unique points and ends on right',()=>{for(const side of ['white','black']){const t=R.TRACK[side];assert(new Set(t).size===24,'duplicate');assert(t.length===24,'length');assert(side==='white'?t[23]===0:t[23]===12,'end')}})
test('White moves 23 to 22',()=>{let x=state();x.points[23]=1;assert(R.legalMoves(x).some(m=>m.from===23&&m.to===22),'direction')});
test('Black moves 11 to 10',()=>{let x=state('black');x.points[11]=-1;assert(R.legalMoves(x).some(m=>m.from===11&&m.to===10),'direction')});
test('Bar first, cannot move other checker',()=>{let x=state();x.bar.white=1;x.points[23]=1;const m=R.legalMoves(x);assert(m.length&&m.every(a=>a.from==='bar'),'bar priority')});
test('Blocked destination',()=>{let x=state();x.points[23]=1;x.points[22]=-2;assert(R.legalMoves(x).length===0,'blocked')});
test('Blot hit moves opponent to bar',()=>{let x=state();x.points[23]=1;x.points[22]=-1;let y=R.move(x,{from:23,to:22,die:1});assert(y.bar.black===1&&y.points[22]===1&&x.bar.black===0,'hit')});
test('Higher die when only one die can be used',()=>{let x=state('white',[2,5]);x.bar.white=1;x.points[17]=-2;const m=R.legalMoves(x);assert(m.length===1&&m[0].die===5,'must play higher die')});
test('Both bar entries blocked',()=>{let x=state('white',[2,5]);x.bar.white=1;x.points[22]=-2;x.points[19]=-2;assert(R.legalMoves(x).length===0,'both entries blocked')});
test('Doubles give four moves',()=>{let x=state('white',[1,1,1,1]);x.points[23]=1;for(let n=0;n<4;n++){let m=R.legalMoves(x)[0];assert(!!m,'step '+n);x=R.move(x,m)}assert(!x.dice.length,'not consumed')});
test('Bear off only when all in home',()=>{let x=state('white',[6]);x.points[5]=14;x.points[6]=1;assert(!R.legalMoves(x).some(m=>m.to==='off'),'early');x.points[6]=0;x.points[5]=15;assert(R.legalMoves(x).some(m=>m.to==='off'),'home')});
test('No bear off with piece on bar',()=>{let x=state();x.points[0]=14;x.bar.white=1;assert(R.legalMoves(x).every(m=>m.to!=='off'),'bar')});
test('Winning after fifteenth bear off',()=>{let x=state('white',[1]);x.points[0]=1;x.off.white=14;let y=R.move(x,{from:0,to:'off',die:1});assert(y.winner==='white','no win');assert(!R.canFinish(y),'winner must not finish')});
test('Turn can finish only after all valid moves',()=>{let x=state();x.points[23]=1;assert(!R.canFinish(x),'early');x=R.move(x,R.legalMoves(x)[0]);assert(R.canFinish(x),'done')});
const failed=tests.filter(x=>!x.ok);if(typeof document!=='undefined'){document.getElementById('results').innerHTML=tests.map(x=>'<li style="color:'+(x.ok?'#84e7aa':'#ff8888')+'">'+(x.ok?'✓ ':'✗ ')+x.name+(x.error?' — '+x.error:'')+'</li>').join('');document.getElementById('headline').textContent=tests.length-failed.length+'/'+tests.length+' test geçti'}if(typeof console!=='undefined')console.log('Tavla regression',tests);if(failed.length)throw Error(failed.length+' test failed: '+failed.map(x=>x.name).join(', '));
})();
