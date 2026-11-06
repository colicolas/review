import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';

export const AUTH_COOKIE='review_session';
export const SESSION_SECONDS=60*60*48;
export const PSYCHOLOGY_HOME='/subjects/psychology/2026-11-06-learning/';
export const HANNAH_EXPIRES_AT=Date.parse('2026-11-06T12:00:00-08:00');
const temporaryCodeHash='fc881aa34d44660e1012dec26ccda0b469d6c8359e91dc674dab4c095b9fe832';
export type AuthConfig={password:string;secret:string};
export type Session={issuedAt:number;expiresAt:number;nonce:string;scope?:'owner'|'psychology'};

export function getAuthConfig():AuthConfig{
 const password=process.env.REVIEW_PASSWORD;
 const secret=process.env.REVIEW_SESSION_SECRET;
 if(!password||!secret||secret.length<32)throw new Error('Password protection is not configured.');
 return {password,secret};
}
export function passwordMatches(input:string,expected:string){
 return timingSafeEqual(createHash('sha256').update(input).digest(),createHash('sha256').update(expected).digest());
}
function signature(payload:string,config:AuthConfig){
 // A password change also invalidates previously issued sessions.
 const key=createHmac('sha256',config.secret).update(config.password).digest();
 return createHmac('sha256',key).update(payload).digest();
}
export function temporaryPsychCodeMatches(input:string,now=Date.now()){
 const digest=createHash('sha256').update(input.trim().toLowerCase()).digest();
 return now<HANNAH_EXPIRES_AT&&timingSafeEqual(digest,Buffer.from(temporaryCodeHash,'hex'));
}
export function guestPathAllowed(pathname:string){
 let path;
 try{path=decodeURIComponent(pathname).replace(/\/$/,'')||'/';}catch{return false;}
 if(path.includes('\\')||path.split('/').includes('..'))return false;
 return path==='/subjects/psychology'||path===PSYCHOLOGY_HOME.slice(0,-1)||path==='/psychology-learning-notes.pdf'||path.startsWith('/_next/static/');
}
export function createSession(config:AuthConfig,now=Date.now(),scope:'owner'|'psychology'='owner'){
 const expiresAt=scope==='psychology'?Math.min(now+SESSION_SECONDS*1000,HANNAH_EXPIRES_AT):now+SESSION_SECONDS*1000;
 if(expiresAt<=now)throw new Error('Temporary access has expired.');
 const session:Session={issuedAt:now,expiresAt,nonce:randomBytes(16).toString('base64url'),scope};
 const payload=Buffer.from(JSON.stringify(session)).toString('base64url');
 return {token:`${payload}.${signature(payload,config).toString('base64url')}`,session};
}
export function verifySession(token:string|undefined,config:AuthConfig,now=Date.now()):Session|null{
 if(!token||token.length>512)return null;
 const parts=token.split('.');
 if(parts.length!==2||parts.some(p=>!p||!/^[A-Za-z0-9_-]+$/.test(p)))return null;
 try{
  const [payload,encodedSignature]=parts;
  const actual=Buffer.from(encodedSignature,'base64url');
  const expected=signature(payload,config);
  if(actual.toString('base64url')!==encodedSignature||actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
  const session=JSON.parse(Buffer.from(payload,'base64url').toString('utf8')) as Session;
  if(!Number.isSafeInteger(session.issuedAt)||!Number.isSafeInteger(session.expiresAt)||typeof session.nonce!=='string')return null;
  if(session.issuedAt>now||session.expiresAt<=now)return null;
  const lifetime=session.expiresAt-session.issuedAt;
  if(session.scope==='psychology'){
   if(now>=HANNAH_EXPIRES_AT||session.expiresAt>HANNAH_EXPIRES_AT||lifetime<=0||lifetime>SESSION_SECONDS*1000)return null;
  }else if((session.scope!==undefined&&session.scope!=='owner')||lifetime!==SESSION_SECONDS*1000)return null;
  return session;
 }catch{return null;}
}
export function safeReturnTo(value:unknown){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u0020]/.test(value))return '/';
 const parsed=new URL(value,'https://review.invalid');
 if(parsed.origin!=='https://review.invalid'||parsed.pathname==='/login'||parsed.pathname==='/login/'||parsed.pathname.startsWith('/api/auth/'))return '/';
 return parsed.pathname+parsed.search+parsed.hash;
}
export function sameOriginPost(request:Request){
 const origin=request.headers.get('origin');
 return request.headers.get('sec-fetch-site')!=='cross-site'&&origin===new URL(request.url).origin;
}
