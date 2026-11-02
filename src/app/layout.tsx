import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Review — Your school notebook',description:'A calm space for notes, diagrams, and practice before each exam.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
