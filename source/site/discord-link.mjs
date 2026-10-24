/* One source of truth for the discord join link and the way a forum post reads as a chat message (community page + home what's-new panel). */
export const DISCORD_URL='https://www.deepspot.io/community'; // TODO: replace with the real Discord invite when Charlie supplies it
export const replies=n=>`${n} ${n===1?'reply':'replies'}`;
export const msgText=f=>f.body.split(/\n\s*\n/)[0].replace(/^\s*[-*•]\s+/gm,'').replace(/\s+/g,' ').trim();
export const clip=(t,n)=>t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+'…':t;
/* 2026-10-23 (5.3): LIVE_SOURCE = true only when a server route reads the real Discord channel (Vercel backend, every 60 s). Until then the feed is a snapshot of real forum posts and its label says "latest", not "live". */
export const LIVE_SOURCE=false;
/* relative time from a REAL post date ("2 h ago"). The snapshot posts carry no date, so this returns '' and no time is shown. */
export const ago=f=>{const t=Date.parse(f.date||f.createdAt||f.postedAt||'');if(!t)return '';const m=Math.max(0,Math.round((Date.now()-t)/60000));
 if(m<2)return 'just now';if(m<60)return m+' min ago';const h=Math.round(m/60);if(h<48)return h+' h ago';return Math.round(h/24)+' d ago';};
