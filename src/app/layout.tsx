import type { Metadata } from 'next';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {AUTH_COOKIE,getAuthConfig,verifySession} from '@/lib/auth';
import SessionExpiry from '@/components/session-expiry';
import './globals.css';
export const metadata: Metadata = {title:'Review — Your school notebook',description:'A calm space for notes, diagrams, and practice before each exam.'};
export default async function RootLayout({children}:{children:React.ReactNode}) {
 const jar=await cookies();
 let session=null;
 try{session=verifySession(jar.get(AUTH_COOKIE)?.value,getAuthConfig());}catch{}
 if(!session)redirect('/login/');
 return <html lang="en"><body>{session&&<SessionExpiry remainingMs={Math.max(0,session.expiresAt-Date.now())}/>}{children}</body></html>
}
