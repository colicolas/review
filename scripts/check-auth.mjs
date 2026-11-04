import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createExpiryCheck} from '../src/lib/session-expiry.ts';
import ts from 'typescript';
import {NextRequest} from 'next/server.js';
import {AUTH_COOKIE,SESSION_SECONDS,createSession,getAuthConfig,passwordMatches,safeReturnTo,verifySession} from '../src/lib/auth.ts';

const project=new URL('../',import.meta.url);
const authUrl=new URL('src/lib/auth.ts',project).href;
const nextUrl=new URL('node_modules/next/server.js',project).href;
async function loadRoute(path){
 const source=fs.readFileSync(new URL(path,project),'utf8').replaceAll("'@/lib/auth'",JSON.stringify(authUrl)).replaceAll("'next/server'",JSON.stringify(nextUrl));
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
 return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
}
process.env.REVIEW_PASSWORD='2255';
process.env.REVIEW_SESSION_SECRET='test-only-secret-not-used-in-production-123456789';
const config=getAuthConfig();
const now=Date.now();
const {token,session}=createSession(config,now);
assert.equal(SESSION_SECONDS,172800);
assert.equal(session.expiresAt-now,48*60*60*1000);
assert.ok(passwordMatches('2255',config.password));
assert.ok(!passwordMatches('wrong',config.password));
assert.ok(!passwordMatches('',config.password));
assert.ok(verifySession(token,config,now));
assert.ok(verifySession(token,config,session.expiresAt-1));
assert.equal(verifySession(token,config,session.expiresAt),null);
assert.equal(verifySession(token,{...config,password:'changed'},now),null);
assert.equal(verifySession(token,{...config,secret:'changed'},now),null);
const [payload,signature]=token.split('.');
const forged=Buffer.from(JSON.stringify({...session,expiresAt:session.expiresAt+1000})).toString('base64url')+'.'+signature;
assert.equal(verifySession(forged,config,now),null);
for(const bad of ['',undefined,'fake',token+'.extra',payload+'.fake',token+'=', 'a'.repeat(600)])assert.equal(verifySession(bad,config,now),null);
for(const path of ['https://evil.example','//evil.example','/\\evil.example','/login/','/api/auth/lock/','/\nevil'])assert.equal(safeReturnTo(path),'/');
assert.equal(safeReturnTo('/subjects/english/?mode=quiz#question-bank'),'/subjects/english/?mode=quiz#question-bank');

const {proxy}=await loadRoute('src/proxy.ts');
const unlock=await loadRoute('src/app/api/auth/unlock/route.ts');
const lock=await loadRoute('src/app/api/auth/lock/route.ts');
const login=await loadRoute('src/app/login/route.ts');
const origin='https://review.test';
for(const path of ['/','/subjects/english/2026-11-04-the-stranger/','/psychology-learning-notes.pdf','/jess-coding-standards-2026.pdf','/_next/static/chunks/study-bank.js','/subjects/english/?_rsc=abc']){
 const result=proxy(new NextRequest(origin+path));
 assert.equal(result.status,307,'Unauthenticated resource must redirect: '+path);
 assert.equal(new URL(result.headers.get('location')).pathname,'/login/');
 assert.match(result.headers.get('cache-control'),/no-store/);
 const authenticated=proxy(new NextRequest(origin+path,{headers:{cookie:AUTH_COOKIE+'='+token}}));
 assert.equal(authenticated.headers.get('x-middleware-next'),'1','Valid session must permit resource: '+path);
}
assert.equal(proxy(new NextRequest(origin+'/api/private/')).status,401);
assert.equal(proxy(new NextRequest(origin+'/',{headers:{cookie:AUTH_COOKIE+'=forged'}})).status,307);
assert.equal(proxy(new NextRequest(origin+'/login/')).headers.get('x-middleware-next'),'1');

function post(path,password,next='/',customOrigin=origin){return new NextRequest(origin+path,{method:'POST',headers:{origin:customOrigin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password,next})});}
const denied=await unlock.POST(post('/api/auth/unlock/','wrong'));
assert.equal(denied.status,303);
assert.equal(new URL(denied.headers.get('location')).searchParams.get('error'),'1');
assert.equal(denied.headers.get('set-cookie'),null);
const allowed=await unlock.POST(post('/api/auth/unlock/','2255','/subjects/english/'));
assert.equal(allowed.status,303);
assert.equal(new URL(allowed.headers.get('location')).pathname,'/subjects/english/');
const cookie=allowed.headers.get('set-cookie');
assert.ok(cookie?.includes('HttpOnly'));
assert.ok(cookie?.includes('Secure'));
assert.ok(cookie?.includes('SameSite=lax'));
assert.ok(cookie?.includes('Max-Age=172800'));
assert.ok(cookie?.includes('Path=/'));
const cookieToken=cookie.split(';')[0].slice(AUTH_COOKIE.length+1);
assert.ok(verifySession(cookieToken,config));
assert.equal(new URL((await unlock.POST(post('/api/auth/unlock/','2255','//evil.example'))).headers.get('location')).origin,origin);
assert.equal((await unlock.POST(post('/api/auth/unlock/','2255','/','https://evil.example'))).status,403);
const noOrigin=new NextRequest(origin+'/api/auth/unlock/',{method:'POST',body:new URLSearchParams({password:'2255'})});
assert.equal((await unlock.POST(noOrigin)).status,403);
const loginHtml=await login.GET(new NextRequest(origin+'/login/?error=1&next='+encodeURIComponent('/"><script>alert(1)</script>'))).text();
assert.ok(loginHtml.includes('Incorrect password.'));
assert.ok(!loginHtml.includes('<script>alert(1)</script>'));
assert.ok(!loginHtml.includes('2255'));
// Regression: visiting login with a still-valid cookie must not redirect to /.
const loggedInLogin=login.GET(new NextRequest(origin+'/login/?next=/',{headers:{cookie:AUTH_COOKIE+'='+token}}));
assert.equal(loggedInLogin.status,200);
assert.equal(loggedInLogin.headers.get('location'),null);
// Regression: a browser clock several days ahead must not immediately expire
// a new 48-hour session, and a burst of timer/focus events must expire it once.
let clientNow=now+7*24*60*60*1000;
let expirations=0;
const checkExpiry=createExpiryCheck(SESSION_SECONDS*1000,()=>{expirations++},()=>clientNow);
for(let i=0;i<100;i++)checkExpiry();
assert.equal(expirations,0);
clientNow+=SESSION_SECONDS*1000-1;
checkExpiry();
assert.equal(expirations,0);
clientNow++;
for(let i=0;i<100;i++)checkExpiry();
assert.equal(expirations,1);
const logout=lock.POST(post('/api/auth/lock/',''));
assert.equal(logout.status,303);
assert.ok(logout.headers.get('set-cookie')?.includes('Max-Age=0'));
assert.equal(lock.POST(post('/api/auth/lock/','','/','https://evil.example')).status,403);
delete process.env.REVIEW_SESSION_SECRET;
assert.equal(proxy(new NextRequest(origin+'/')).status,503);
assert.equal((await unlock.POST(post('/api/auth/unlock/','2255'))).status,503);
console.log('Passed: password acceptance/rejection, fixed 48-hour expiry, tamper rejection, password/secret rotation, protected pages/PDFs/chunks, secure cookie flags, same-origin POSTs, safe redirects, logout, fail-closed configuration, skewed browser clocks, one-shot expiry, and no login-to-home redirect loop.');
