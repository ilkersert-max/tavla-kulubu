import { DurableObject } from "cloudflare:workers";

const originAllowed = origin => !origin || origin === "https://ilkersert-max.github.io" || origin === "http://localhost:5500" || origin === "http://127.0.0.1:5500";
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"https://ilkersert-max.github.io","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type","cache-control":"no-store"}});
const randomString = size => Array.from(crypto.getRandomValues(new Uint8Array(size)),v=>v.toString(16).padStart(2,"0")).join("");
const send = (ws,message) => {try{ws.send(JSON.stringify(message));}catch(_){}};

export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{"access-control-allow-origin":"https://ilkersert-max.github.io","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"}});
    if(!originAllowed(request.headers.get("origin")))return json({error:"origin_not_allowed"},403);
    if(url.pathname==="/health")return json({ok:true,service:"tavla-kulubu-server"});
    if(url.pathname==="/create"&&request.method==="POST"){
      const room=randomString(5),hostSecret=randomString(24);
      const roomObject=env.ROOM.getByName(room);
      const init=await roomObject.fetch(new Request("https://room.internal/init",{method:"POST",body:JSON.stringify({hostSecret})}));
      if(!init.ok)return json({error:"room_creation_failed"},502);
      return json({room,hostSecret,wsPath:"/room/"+room},201);
    }
    const match=url.pathname.match(/^\/room\/([a-f0-9]{10})$/);
    if(match&&request.headers.get("upgrade")?.toLowerCase()==="websocket"){
      const stub=env.ROOM.getByName(match[1]);
      return stub.fetch(request);
    }
    return json({error:"not_found"},404);
  }
};

export class TavlaRoom extends DurableObject {
  async fetch(request) {
    const url=new URL(request.url);
    if(url.pathname==="/init"&&request.method==="POST"){
      if(await this.ctx.storage.get("hostSecret"))return new Response("already_initialized",{status:409});
      const data=await request.json();
      if(typeof data.hostSecret!=="string"||!/^([a-f0-9]{48})$/.test(data.hostSecret))return new Response("invalid",{status:400});
      await this.ctx.storage.put("hostSecret",data.hostSecret);
      return new Response("ok");
    }
    if(request.headers.get("upgrade")?.toLowerCase()!=="websocket")return new Response("upgrade_required",{status:426});
    const role=url.searchParams.get("role");
    if(role!=="host"&&role!=="guest")return new Response("role_required",{status:400});
    const secret=await this.ctx.storage.get("hostSecret");
    if(!secret)return new Response("room_not_found",{status:404});
    if(role==="host"&&url.searchParams.get("token")!==secret)return new Response("unauthorized",{status:401});
    if(role==="guest"&&this.ctx.getWebSockets("host").length===0)return new Response("host_offline",{status:409});
    const existing=this.ctx.getWebSockets(role);
    for(const ws of existing){try{ws.close(4001,"new_session");}catch(_){}}
    const pair=new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1],[role]);
    send(pair[1],{type:"connected",role,waiting:role==="host"});
    if(role==="guest"){
      const state=await this.ctx.storage.get("gameState");
      if(state)send(pair[1],{type:"state",game:state});
      for(const ws of this.ctx.getWebSockets("host"))send(ws,{type:"joined",role:"guest"});
    }else{
      for(const ws of this.ctx.getWebSockets("guest"))send(ws,{type:"joined",role:"host"});
    }
    return new Response(null,{status:101,webSocket:pair[0]});
  }
  async webSocketMessage(ws,message) {
    if(typeof message!=="string"||message.length>65536)return;
    let data;try{data=JSON.parse(message)}catch(_){return}
    const role=this.ctx.getTags(ws)[0];
    if(role==="host"&&data?.type==="state"&&data.game&&typeof data.game==="object"){
      await this.ctx.storage.put("gameState",data.game);
      for(const other of this.ctx.getWebSockets("guest"))send(other,{type:"state",game:data.game,canUndo:!!data.canUndo});
    }else if(role==="guest"&&["roll","move","undo","end"].includes(data?.type)){
      for(const other of this.ctx.getWebSockets("host"))send(other,data);
    }
  }
  async webSocketClose(ws) {
    const role=this.ctx.getTags(ws)[0];
    const opposite=role==="host"?"guest":"host";
    for(const other of this.ctx.getWebSockets(opposite))send(other,{type:"peer_left",role});
  }
  async webSocketError(ws) {try{ws.close(1011,"socket_error")}catch(_){}}
}
