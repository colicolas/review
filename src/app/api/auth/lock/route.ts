import {NextRequest,NextResponse} from 'next/server';
import {AUTH_COOKIE,sameOriginPost} from '@/lib/auth';
export function POST(request:NextRequest){
 if(!sameOriginPost(request))return new NextResponse('Invalid request origin.',{status:403,headers:{'Cache-Control':'no-store'}});
 const response=NextResponse.redirect(new URL('/login/',request.url),{status:303,headers:{'Cache-Control':'private, no-store','Clear-Site-Data':'"cache"'}});
 response.cookies.set(AUTH_COOKIE,'',{httpOnly:true,secure:request.nextUrl.protocol==='https:',sameSite:'lax',path:'/',maxAge:0,expires:new Date(0)});
 return response;
}
