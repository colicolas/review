import {NextRequest,NextResponse} from 'next/server';
import {AUTH_COOKIE,guestHome,isGuestScope,getAuthConfig,guestPathAllowed,safeReturnTo,verifySession} from '@/lib/auth';

export function proxy(request:NextRequest){
 const path=request.nextUrl.pathname.replace(/\/$/,'')||'/';
 if(path==='/login'||path==='/api/auth/unlock'||path==='/api/auth/lock')return NextResponse.next();
 let session=null;
 try{session=verifySession(request.cookies.get(AUTH_COOKIE)?.value,getAuthConfig());}catch{
  return new NextResponse('Password protection is not configured.',{status:503,headers:{'Cache-Control':'no-store'}});
 }
 if(!session){
  if(path.startsWith('/api/'))return NextResponse.json({error:'Sign in required.'},{status:401,headers:{'Cache-Control':'no-store'}});
  const login=new URL('/login/',request.url);
  login.searchParams.set('next',safeReturnTo(request.nextUrl.pathname+request.nextUrl.search));
  const response=NextResponse.redirect(login);
  response.headers.set('Cache-Control','private, no-store');
  return response;
 }
 if(isGuestScope(session.scope)){
  if(path==='/')return NextResponse.redirect(new URL(guestHome(session.scope),request.url),{headers:{'Cache-Control':'private, no-store'}});
  if(!guestPathAllowed(request.nextUrl.pathname,session.scope))return new NextResponse(`This temporary code only grants access to ${session.scope==='psychology'?'AP Psychology':'English Literature'}.`,{status:403,headers:{'Cache-Control':'private, no-store','Content-Type':'text/plain; charset=utf-8'}});
 }
 const response=NextResponse.next();
 response.headers.set('Cache-Control','private, no-store');
 return response;
}
// Includes PDFs, study-data chunks, RSC requests, and Next static assets.
export const config={matcher:['/:path*']};
