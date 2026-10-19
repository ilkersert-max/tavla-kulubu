export { TavlaRoom } from './TavlaRoom.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/ws/')) {
      const code = decodeURIComponent(url.pathname.slice(4)).toUpperCase();
      if (!/^[A-Z0-9]{5,8}$/.test(code)) return new Response('Geçersiz oda kodu', { status: 400 });
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return new Response('WebSocket gerekli', { status: 426 });
      }
      const id = env.ROOMS.idFromName(code);
      return env.ROOMS.get(id).fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
