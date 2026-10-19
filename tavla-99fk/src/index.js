// Original 99fk HTML game is served without changes by Cloudflare static assets.
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
