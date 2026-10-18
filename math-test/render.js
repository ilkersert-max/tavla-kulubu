/* Canvas: 0-11 alt sağdan sola, 12-23 üst soldan sağa. */
export const W=1000,H=720;
const LEFT=38,RIGHT=908,BAR_LEFT=473,BAR_RIGHT=513,TOP=42,BOTTOM=678,PW=(RIGHT-LEFT-(BAR_RIGHT-BAR_LEFT))/12;
export function pointX(i){if(i<0||i>23)throw Error('Hane dışı');const col=i<12?11-i:i-12;return (col<6?LEFT:BAR_RIGHT)+(col<6?col:col-6)*PW+PW/2}
export function pointY(i){return i>=12?75:645}
export function toScreen(x,y,view){return view===1?{x:LEFT+RIGHT-x,y:H-y}:{x,y}}
export function fromScreen(x,y,view){return toScreen(x,y,view)}
export function pointer(e,cv,view){const r=cv.getBoundingClientRect();return fromScreen((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height,view)}
export function pointHit(p){if(p.x>=934&&p.x<=998)return'off';if(p.x>=BAR_LEFT&&p.x<=BAR_RIGHT)return'bar';if(p.y<TOP||p.y>BOTTOM)return null;const top=p.y<H/2;let best=null,d=PW*.5;for(let i=top?12:0;i<(top?24:12);i++){const dx=Math.abs(p.x-pointX(i));if(dx<d){best=i;d=dx}}return best}
function rounded(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
function checker(c,x,y,side,r=18){const g=c.createRadialGradient(x-6,y-7,2,x,y,r);if(side===-1){g.addColorStop(0,'#fff7dd');g.addColorStop(1,'#c9ad79')}else{g.addColorStop(0,'#db6c59');g.addColorStop(1,'#821b18')}c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.strokeStyle=side===-1?'#92734b':'#edaa93';c.lineWidth=2;c.stroke()}
export function draw(c,state,{view=-1,selected=null,targets=[],animation=null}={}){
 c.clearRect(0,0,W,H);c.fillStyle='#b8814b';c.fillRect(0,0,W,H);c.strokeStyle='#56311c';c.lineWidth=11;c.strokeRect(8,8,984,704);
 c.save();if(view===1){c.translate(LEFT+RIGHT,H);c.rotate(Math.PI)}
 c.fillStyle='#572820';c.fillRect(LEFT,TOP,RIGHT-LEFT,BOTTOM-TOP);c.fillStyle='#a65e2e';c.fillRect(BAR_LEFT,TOP,BAR_RIGHT-BAR_LEFT,BOTTOM-TOP);
 for(let i=0;i<24;i++){const x=pointX(i),top=i>=12,y=top?TOP:BOTTOM;c.beginPath();c.moveTo(x-PW*.48,y);c.lineTo(x+PW*.48,y);c.lineTo(x,top?310:410);c.closePath();c.fillStyle=i%2?'#d25c49':'#f4e5ce';c.fill();if(targets.includes(i)){c.strokeStyle='#f5dd62';c.lineWidth=5;c.stroke()}c.fillStyle='#e0bd88';c.font='12px system-ui';c.textAlign='center';c.fillText(String(i),x,top?27:701)}
 for(let i=0;i<24;i++){const n=state.points[i];for(let j=0;j<Math.abs(n);j++){if(animation&&animation.from===i&&j===Math.abs(n)-1)continue;checker(c,pointX(i),pointY(i)+(i>=12?j:-j)*36,Math.sign(n))}if(i===selected){c.strokeStyle='#82efad';c.lineWidth=3;c.strokeRect(pointX(i)-21,i>=12?48:540,42,135)}}
 for(const side of [-1,1])for(let j=0;j<Math.min(6,state.bar[String(side)]);j++)checker(c,493,side===-1?520-j*35:200+j*35,side);
 c.restore();
 if(animation){const a=toScreen(animation.x,animation.y,view);checker(c,a.x,a.y,animation.side)}
 // Toplama cebi oyuncunun sağında ve tahta perspektifinden bağımsız.
 for(const [side,y] of [[1,70],[-1,380]]){c.fillStyle='#422417';rounded(c,925,y,57,255,7);c.fill();for(let j=0;j<Math.min(state.off[String(side)],10);j++)checker(c,952,y+226-j*22,side,14);c.fillStyle='#f4d5a3';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(String(state.off[String(side)]),951,y+22)}
 const face=(x,y,n)=>{rounded(c,x-25,y-25,50,50,10);c.fillStyle='#e7d3aa';c.fill();c.strokeStyle='#7d5329';c.stroke();const pip=[[0,0],[-12,-12],[12,12],[-12,12],[12,-12],[-12,0],[12,0]],map={1:[0],2:[1,2],3:[0,1,2],4:[1,2,3,4],5:[0,1,2,3,4],6:[1,2,3,4,5,6]};c.fillStyle='#29312f';for(const idx of map[n]||[]){c.beginPath();c.arc(x+pip[idx][0],y+pip[idx][1],4,0,Math.PI*2);c.fill()}};
 const dice=state.lastRoll||state.dice;face(656,355,dice[0]);face(728,355,dice[1]);c.fillStyle='#f7ddae';c.font='bold 17px system-ui';c.textAlign='center';c.fillText(state.turn===-1?'BEYAZ OYNUYOR':'KIRMIZI OYNUYOR',688,306);
}
