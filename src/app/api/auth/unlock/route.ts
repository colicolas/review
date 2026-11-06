import {NextRequest,NextResponse} from 'next/server';
import {AUTH_COOKIE,guestHome,createSession,getAuthConfig,passwordMatches,safeReturnTo,sameOriginPost,temporaryGuestScope} from '@/lib/auth';
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
 const now=Date.now();
 const validInput=typeof password==='string'&&password.length<=1024;
 const owner=validInput&&passwordMatches(password,config.password);
 const guest=!owner&&validInput?temporaryGuestScope(password,now):null;
 if(!owner&&!guest){
  const login=new URL('/login/',request.url);login.searchParams.set('error','1');login.searchParams.set('next',next);
  return NextResponse.redirect(login,{status:303,headers:{'Cache-Control':'private, no-store'}});
 }
 const {token,session}=createSession(config,now,guest||'owner');
 const response=NextResponse.redirect(new URL(guest?guestHome(guest):next,request.url),{status:303,headers:{'Cache-Control':'private, no-store'}});
 response.cookies.set(AUTH_COOKIE,token,{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:Math.floor((session.expiresAt-now)/1000),expires:new Date(session.expiresAt)});
 return response;
}
