import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';

export const AUTH_COOKIE='review_session';
export const SESSION_SECONDS=60*60*48;
export type AuthConfig={password:string;secret:string};
export type Session={issuedAt:number;expiresAt:number;nonce:string};

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
export function createSession(config:AuthConfig,now=Date.now()){
 const session:Session={issuedAt:now,expiresAt:now+SESSION_SECONDS*1000,nonce:randomBytes(16).toString('base64url')};
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
  if(session.issuedAt>now||session.expiresAt<=now||session.expiresAt-session.issuedAt!==SESSION_SECONDS*1000)return null;
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
