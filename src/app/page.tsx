import {redirect} from 'next/navigation';
import {requestSession} from '@/lib/server-access';
import {PSYCHOLOGY_HOME} from '@/lib/auth';
import Link from 'next/link';
import {Shell,Footer} from '@/components/notebook';
import {subjects} from '@/lib/content';
import {exams} from '@/lib/exams';
export default async function Home(){if((await requestSession())?.scope==='psychology')redirect(PSYCHOLOGY_HOME);return <Shell><div className="page-top"><span>Overview</span><span>2026 / 2027</span></div><div className="page-content overview"><header className="overview-header"><h1>Exam calendar</h1></header><section aria-label="November 2026 exams"><div className="calendar-month"><h2>November 2026</h2><span>{exams.length} exams</span></div><div className="calendar-list">{exams.map(e=>{const subject=subjects.find(s=>s.slug===e.subject)!;return <div className="next-exam" key={e.slug} style={{'--accent':subject.color,'--wash':subject.wash} as React.CSSProperties}><div className="next-title"><time className="date-block" dateTime={e.date}><strong>{e.day}</strong><span>{e.weekday}</span></time><div><p>{subject.name}</p><h2>{e.title}</h2><span>{e.subtitle}</span></div></div><Link className="button" href={`/subjects/${e.subject}/${e.slug}/`}>Open review <span>↗</span></Link></div>})}</div></section><Footer/></div></Shell>}
