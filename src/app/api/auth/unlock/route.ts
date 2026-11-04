import {NextRequest,NextResponse} from 'next/server';
import {AUTH_COOKIE,SESSION_SECONDS,createSession,getAuthConfig,passwordMatches,safeReturnTo,sameOriginPost} from '@/lib/auth';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 if(!sameOriginPost(request))return new NextResponse('Invalid request origin.',{status:403,headers:{'Cache-Control':'no-store'}});
 if(Number(request.headers.get('content-length')||0)>4096)return new NextResponse('Request too large.',{status:413,headers:{'Cache-Control':'no-store'}});
 let config;
 try{config=getAuthConfig();}catch{return new NextResponse('Password protection is not configured.',{status:503,headers:{'Cache-Control':'no-store'}});}
 let form;
 try{form=await request.formData();}catch{return new NextResponse('Invalid form.',{status:400,headers:{'Cache-Control':'no-store'}});}
 const password=form.get('password');
 const next=safeReturnTo(form.get('next'));
 if(typeof password!=='string'||password.length>1024||!passwordMatches(password,config.password)){
  const login=new URL('/login/',request.url);login.searchParams.set('error','1');login.searchParams.set('next',next);
  return NextResponse.redirect(login,{status:303,headers:{'Cache-Control':'private, no-store'}});
 }
 const {token,session}=createSession(config);
 const response=NextResponse.redirect(new URL(next,request.url),{status:303,headers:{'Cache-Control':'private, no-store'}});
 response.cookies.set(AUTH_COOKIE,token,{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:SESSION_SECONDS,expires:new Date(session.expiresAt)});
 return response;
}
