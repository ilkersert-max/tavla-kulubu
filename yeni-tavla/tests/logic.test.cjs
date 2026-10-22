const {test}=require('node:test');const assert=require('node:assert/strict');const {initial,legal,move,roll}=require('../game-logic.cjs');
test('initial sets 15 checkers on each side',()=>{const g=initial();assert.equal(g.board.filter(x=>x>0).reduce((a,b)=>a+b,0),15);assert.equal(g.board.filter(x=>x<0).reduce((a,b)=>a-b,0),15)});
test('illegal move cannot change board',()=>{const g=initial();g.dice=[1,2];assert.throws(()=>move(g,23,1,1));assert.equal(g.board[23],2)});
test('bar moves are mandatory',()=>{const g=initial();g.board[23]=1;g.bar.w=1;g.dice=[1,2];assert.ok(legal(g).every(m=>m.from==='bar'))});
test('roll is bounded',()=>{const g=initial();const [a,b]=roll(g);assert.ok(a>=1&&a<=6&&b>=1&&b<=6)});
test('bearing off requires all checkers in home',()=>{const g=initial();g.dice=[6];assert.equal(legal(g).some(m=>m.to==='off'),false)});
