/* One source of truth for the discord join link and the way a forum post reads as a chat message (community page + home what's-new panel). */
export const DISCORD_URL='https://www.deepspot.io/community'; // TODO: replace with the real Discord invite when Charlie supplies it
export const replies=n=>`${n} ${n===1?'reply':'replies'}`;
export const msgText=f=>f.body.split(/\n\s*\n/)[0].replace(/^\s*[-*•]\s+/gm,'').replace(/\s+/g,' ').trim();
export const clip=(t,n)=>t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+'…':t;
