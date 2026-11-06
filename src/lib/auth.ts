import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';

export const AUTH_COOKIE='review_session';
export const SESSION_SECONDS=60*60*48;
export const PSYCHOLOGY_HOME='/subjects/psychology/2026-11-06-learning/';
export const HANNAH_EXPIRES_AT=Date.parse('2026-11-06T12:00:00-08:00');
export const JOYCE_EXPIRES_AT=Date.parse('2026-11-06T15:00:00-08:00');
export type GuestScope='psychology'|'english';
const temporaryCodeHash='fc881aa34d44660e1012dec26ccda0b469d6c8359e91dc674dab4c095b9fe832';
const guestAccess={
 psychology:{expiresAt:HANNAH_EXPIRES_AT,hash:temporaryCodeHash,home:PSYCHOLOGY_HOME,paths:['/subjects/psychology',PSYCHOLOGY_HOME.slice(0,-1),'/psychology-learning-notes.pdf']},
 english:{expiresAt:JOYCE_EXPIRES_AT,hash:'005195352c13e18429414c8b36a4047fdcfab8bb3a1aa1aa19d5ff26010c754d',home:'/subjects/english/',paths:['/subjects/english','/subjects/english/2026-11-04-the-stranger','/subjects/english/2026-11-06-the-stranger-ending']},
};
export function isGuestScope(scope:unknown):scope is GuestScope{return scope==='psychology'||scope==='english';}
export function guestHome(scope:GuestScope){return guestAccess[scope].home;}
export type AuthConfig={password:string;secret:string};
export type Session={issuedAt:number;expiresAt:number;nonce:string;scope?:'owner'|GuestScope};

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
export function temporaryGuestScope(input:string,now=Date.now()):GuestScope|null{
 const digest=createHash('sha256').update(input.trim().toLowerCase()).digest();
 for(const scope of ['psychology','english'] as const){const policy=guestAccess[scope];if(now<policy.expiresAt&&timingSafeEqual(digest,Buffer.from(policy.hash,'hex')))return scope;}
 return null;
}
export function temporaryPsychCodeMatches(input:string,now=Date.now()){return temporaryGuestScope(input,now)==='psychology';}
export function guestPathAllowed(pathname:string,scope:GuestScope='psychology'){
 let path;
 try{path=decodeURIComponent(pathname).replace(/\/$/,'')||'/';}catch{return false;}
 if(path.includes('\\')||path.split('/').includes('..'))return false;
 return guestAccess[scope].paths.includes(path)||path.startsWith('/_next/static/');
}
export function createSession(config:AuthConfig,now=Date.now(),scope:'owner'|GuestScope='owner'){
 const expiresAt=isGuestScope(scope)?Math.min(now+SESSION_SECONDS*1000,guestAccess[scope].expiresAt):now+SESSION_SECONDS*1000;
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
  if(isGuestScope(session.scope)){
   const deadline=guestAccess[session.scope].expiresAt;
   if(now>=deadline||session.expiresAt>deadline||lifetime<=0||lifetime>SESSION_SECONDS*1000)return null;
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
