import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {AUTH_COOKIE,guestHome,isGuestScope,getAuthConfig,verifySession} from '@/lib/auth';
export async function requestSession(){
 const jar=await cookies();
 try{return verifySession(jar.get(AUTH_COOKIE)?.value,getAuthConfig());}catch{return null;}
}
export async function requireSubjectAccess(subject:string){
 const session=await requestSession();
 if(!session)redirect('/login/');
 if(isGuestScope(session.scope)&&subject!==session.scope)redirect(guestHome(session.scope));
 return isGuestScope(session.scope)?session.scope:undefined;
}
