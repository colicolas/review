import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {AUTH_COOKIE,PSYCHOLOGY_HOME,getAuthConfig,verifySession} from '@/lib/auth';
export async function requestSession(){
 const jar=await cookies();
 try{return verifySession(jar.get(AUTH_COOKIE)?.value,getAuthConfig());}catch{return null;}
}
export async function requireSubjectAccess(subject:string){
 const session=await requestSession();
 if(!session)redirect('/login/');
 if(session.scope==='psychology'&&subject!=='psychology')redirect(PSYCHOLOGY_HOME);
 return session.scope==='psychology';
}
