/** Measure a server-supplied duration on the browser's own clock, and expire once. */
export function createExpiryCheck(remainingMs:number,onExpire:()=>void,now:()=>number=Date.now){
 const startedAt=now();
 let expired=false;
 return()=>{
  if(expired||now()-startedAt<remainingMs)return;
  expired=true;
  onExpire();
 };
}
