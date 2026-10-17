'use strict';
// Node.js regression checks for Tavla Kulubu Display Manager (no browser required).
// Run: node tests/display-regression.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const from=source.indexOf('const Display=(()=>{');
const to=source.indexOf('Display.applyLayout();',from);
assert(from>=0&&to>from,'Display module found');
const code=source.slice(from,to+'Display.applyLayout();'.length);
for(const id of ['roll','undo','end','lobbyBot','lobbyCreateMain','lobbyOnline','leaveFullscreen','rotateHint','fullscreenHelp']){
 assert(source.includes('id="'+id+'"'),id+' preserved');
}
assert(!code.includes('arrangeLandscapeControls'),'No duplicate landscape dock controller');
function element(id){
 const flags=new Set();
 return{id,hidden:id==='fullscreenHelp',textContent:'',title:'',
 classList:{toggle(name,yes){if(yes)flags.add(name);else flags.delete(name)},contains(name){return flags.has(name)}},
 style:{setProperty(){}}};
}
async function scenario(name,opts){
 const nodes={};
 for(const id of ['roll','undo','end','simpleLobby','fullScreen','landscapeStart','leaveFullscreen','rotateHint','rotateHintClose','fullscreenHelp','fullscreenHelpText','fullscreenHelpClose','fullscreenHelpCopy'])
  nodes[id]=element(id);
 nodes.simpleLobby.hidden=true;
 const orders=[],frames=[];
 const document={fullscreenElement:null,webkitFullscreenElement:null,
   body:element('body'),documentElement:element('html'),
   getElementById(id){return nodes[id]},
   addEventListener(){},
   exitFullscreen(){orders.push('exitFS');this.fullscreenElement=null;return Promise.resolve()},
   webkitExitFullscreen(){orders.push('exitWebkitFS');this.webkitFullscreenElement=null;return Promise.resolve()}
 };
 if(opts.api==='standard')document.documentElement.requestFullscreen=()=>{
  orders.push('requestFS');document.fullscreenElement=document.documentElement;return Promise.resolve();
 };
 if(opts.api==='webkit')document.documentElement.webkitRequestFullscreen=()=>{
  orders.push('requestWebkitFS');document.webkitFullscreenElement=document.documentElement;return Promise.resolve();
 };
 const window={visualViewport:{width:opts.w,height:opts.h,addEventListener(){}},
 addEventListener(){},matchMedia(){return{matches:!!opts.standalone}}};
 const navigator={userAgent:opts.ios?'iPhone Safari':'Chrome',maxTouchPoints:opts.mobile?5:0,
 platform:opts.ios?'iPhone':'Win32',standalone:!!opts.standalone};
 const screen={width:opts.mobile?390:1920,height:opts.mobile?844:1080,
 orientation:{type:opts.w>opts.h?'landscape-primary':'portrait-primary',
 lock(){orders.push('lock');return Promise.resolve()},unlock(){orders.push('unlock')}}};
 const dock=[];
 const fn=new Function('document','window','navigator','screen','innerWidth','innerHeight','requestAnimationFrame','alignCompactControls','$','setTimeout','clearTimeout',code+';return Display;');
 const manager=fn(document,window,navigator,screen,opts.w,opts.h,
 callback=>{frames.push(callback);return frames.length},
 compact=>dock.push(compact),id=>nodes[id],()=>1,()=>{});
 const paint=()=>{while(frames.length)frames.shift()()};
 paint();
 const ready={beforeExitVisible:!nodes.leaveFullscreen.hidden};
 const entered=await manager.enterPlayMode({preferLandscape:true});paint();
 ready.entered=entered;ready.afterExitVisible=!nodes.leaveFullscreen.hidden;
 ready.banner=!nodes.fullscreenHelp.hidden;
 ready.rotateHint=nodes.rotateHint.classList.contains('show');
 ready.dock=dock;
 await manager.exitPlayMode();paint();
 ready.exitedNative=manager.isNativeFullscreen();
 ready.exitedWide=manager.isFullscreen();
 ready.orders=orders;
 return ready;
}
(async()=>{
 const iphone=await scenario('iPhone Safari',{ios:true,mobile:true,w:844,h:390,api:'none'});
 assert.equal(iphone.beforeExitVisible,true,'Landscape fullscreen entry button is reachable even when API is missing');
 assert.equal(iphone.entered.fullscreen,false);
 assert.equal(iphone.entered.wideMode,true);
 assert.equal(iphone.afterExitVisible,true);
 assert.equal(iphone.banner,true);
 assert.equal(iphone.exitedWide,false);
 const portrait=await scenario('iPhone Safari portrait',{ios:true,mobile:true,w:390,h:844,api:'none'});
 assert.equal(portrait.rotateHint,true,'Portrait rotate hint shows after request');
 const android=await scenario('Android Chrome',{ios:false,mobile:true,w:844,h:390,api:'standard'});
 assert.deepEqual(android.orders.slice(0,2),['requestFS','lock'],'Request fullscreen BEFORE orientation lock');
 assert.equal(android.entered.fullscreen,true);
 assert.equal(android.exitedNative,false);
 const desktop=await scenario('Desktop Chrome',{ios:false,mobile:false,w:1920,h:1080,api:'standard'});
 assert.equal(desktop.entered.fullscreen,true);
 assert.equal(desktop.exitedNative,false);
 const prefixed=await scenario('Desktop WebKit',{ios:false,mobile:false,w:1440,h:900,api:'webkit'});
 assert.equal(prefixed.entered.fullscreen,true);
 assert.equal(prefixed.exitedNative,false);
 console.log('PASS: iPhone Safari fallback, rotate hint, Android orientation sequence, desktop/WebKit exit, core controls');
})().catch(error=>{console.error(error);process.exitCode=1});