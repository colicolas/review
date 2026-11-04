'use client';
import {useEffect} from 'react';
import {createExpiryCheck} from '@/lib/session-expiry';
export default function SessionExpiry({remainingMs}:{remainingMs:number}){
 useEffect(()=>{
  const lock=createExpiryCheck(remainingMs,()=>{
   // Clear the cookie before navigating. A GET to /login could otherwise
   // bounce back to / while the server still considers that cookie valid.
   const form=document.createElement('form');
   form.method='post';
   form.action='/api/auth/lock/';
   form.hidden=true;
   document.body.appendChild(form);
   form.submit();
  });
  const timer=window.setTimeout(lock,Math.max(0,remainingMs));
  window.addEventListener('focus',lock);
  document.addEventListener('visibilitychange',lock);
  return()=>{
   window.clearTimeout(timer);
   window.removeEventListener('focus',lock);
   document.removeEventListener('visibilitychange',lock);
  };
 },[remainingMs]);
 return null;
}
