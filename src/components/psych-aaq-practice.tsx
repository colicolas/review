'use client';
import {useEffect,useState} from 'react';
import {aaqLetters,aaqStudies,emptyAaqRecord,nextRandomAaq,restoreAaqRecords,scoreAaq,type AaqLetter,type AaqRecord} from '@/lib/psych-aaq';
const storageKey='psych-learning-aaq-v1';
export default function PsychAaqPractice(){
 const [topic,setTopic]=useState('All learning topics');
 const [studyId,setStudyId]=useState(aaqStudies[0].id);
 const [seen,setSeen]=useState<string[]>([aaqStudies[0].id]);
 const [mode,setMode]=useState<'practice'|'test'>('practice');
 const [records,setRecords]=useState<Record<string,AaqRecord>>({});
 const [ready,setReady]=useState(false);
 const [storageUnavailable,setStorageUnavailable]=useState(false);
 useEffect(()=>{
  try{setRecords(restoreAaqRecords(JSON.parse(localStorage.getItem(storageKey)||'{}')));}catch{setStorageUnavailable(true);}
  setReady(true);
 },[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(storageKey,JSON.stringify(records));}catch{setStorageUnavailable(true);}},[ready,records]);
 const filtered=aaqStudies.filter(s=>topic==='All learning topics'||s.topic===topic);
 const study=filtered.find(s=>s.id===studyId)||filtered[0];
 const record=records[study.id]||emptyAaqRecord();
 const score=scoreAaq(record);
 const answered=study.parts.filter(p=>record.answers[p.letter]?.trim()).length;
 const topics=[...new Set(aaqStudies.map(s=>s.topic))];
 function updateRecord(transform:(previous:AaqRecord)=>AaqRecord){setRecords(previous=>({...previous,[study.id]:transform(previous[study.id]||emptyAaqRecord())}));}
 function selectStudy(id:string){setStudyId(id);setSeen(previous=>[...new Set([...previous,id])]);}
 function changeTopic(next:string){setTopic(next);const first=aaqStudies.find(s=>next==='All learning topics'||s.topic===next);if(first)selectStudy(first.id);}
 function randomStudy(){const next=nextRandomAaq(filtered,seen,study.id);if(next){setStudyId(next.id);setSeen(next.seen);}}
 function write(letter:AaqLetter,text:string){
  updateRecord(previous=>{const scores={...previous.scores};delete scores[letter];return {...previous,answers:{...previous.answers,[letter]:text},scores,submitted:false,revealed:previous.submitted?[...aaqLetters]:previous.revealed};});
 }
 function reveal(letter:AaqLetter){updateRecord(previous=>({...previous,revealed:[...new Set([...previous.revealed,letter])]}));}
 function mark(letter:AaqLetter,value:string){updateRecord(previous=>{const scores={...previous.scores};if(value==='')delete scores[letter];else scores[letter]=Number(value);return {...previous,scores};});}
 return <div className="aaq-practice">
  <div className="practice-settings aaq-settings">
   <label>Topic<select value={topic} onChange={e=>changeTopic(e.target.value)}><option>All learning topics</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label>
   <label>Feedback<select value={mode} onChange={e=>setMode(e.target.value as 'practice'|'test')}><option value="practice">Practice · reveal by part</option><option value="test">Test · reveal after submission</option></select></label>
   <label className="aaq-study-select">Study<select value={study.id} onChange={e=>selectStudy(e.target.value)}>{filtered.map(s=><option value={s.id} key={s.id}>{aaqStudies.indexOf(s)+1}. {s.title}</option>)}</select></label>
  </div>
  <div className="reading-start"><span>{filtered.length} AAQs in this selection</span><button className="button" onClick={randomStudy}>Shuffle to another AAQ ↗</button></div>
  <p className="source-note">{storageUnavailable?'Browser storage is unavailable; keep this tab open to retain your writing.':'Your responses and self-scores save in this browser. Switching studies keeps your drafts.'}</p>
  <div className="aaq-article" key={study.id}>
   <div className="diagram-head"><span className="eyebrow">STUDY {String(aaqStudies.indexOf(study)+1).padStart(2,'0')} · {study.topic}</span><span>6 parts / 7 points</span></div>
   <h3>{study.title}</h3>
   <p className="aaq-fiction-label">{study.sourceType}</p>
   <p>{study.introduction}</p>
   <h4>Participants</h4><p>{study.participants}</p>
   <h4>Procedure &amp; safeguards</h4><p>{study.procedure}</p><p>{study.ethics}</p>
   <h4>Results</h4>
   <div className="aaq-table"><table><caption className="sr-only">{study.title}: hypothetical study results</caption><thead><tr>{study.table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{study.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>
   <p className="source-note">{study.resultsNote}</p>
  </div>
  <p className="aaq-directions">Respond in complete sentences, labeled A–F. Use this source’s measurements, participants, and results.</p>
  <div className="aaq-parts">{study.parts.map(part=>{
   const visible=mode==='practice'?record.revealed.includes(part.letter)||record.submitted:record.submitted;
   const inputId=`${study.id}-${part.letter}`;
   return <section className="aaq-part" key={inputId}>
    <div className="aaq-part-heading"><span>{part.letter}</span><h4>{part.label}</h4><small>{part.maxPoints} {part.maxPoints===1?'point':'points'}</small></div>
    <label htmlFor={inputId}>{part.prompt}</label>
    <textarea id={inputId} rows={part.letter==='F'?6:4} value={record.answers[part.letter]||''} disabled={!ready} readOnly={mode==='test'&&record.submitted} onChange={e=>write(part.letter,e.target.value)} placeholder={`Write your Part ${part.letter} response…`}/>
    {mode==='practice'&&!visible&&<button className="text-button" disabled={!ready} onClick={()=>reveal(part.letter)}>Reveal scoring guide ↓</button>}
    {visible&&<div className="aaq-scoring-guide"><p className="eyebrow">MODEL RESPONSE</p><p>{part.model}</p><h5>What earns credit</h5><ul>{part.criteria.map(item=><li key={item}>{item}</li>)}</ul><p className="aaq-pitfall"><b>Avoid:</b> {part.pitfall}</p><label className="aaq-mark-label" htmlFor={`${inputId}-score`}>My self-score<select id={`${inputId}-score`} value={record.scores[part.letter]===undefined?'':String(record.scores[part.letter])} onChange={e=>mark(part.letter,e.target.value)}><option value="">Not scored</option>{Array.from({length:part.maxPoints+1},(_,i)=><option key={i} value={i}>{i} / {part.maxPoints}</option>)}</select></label></div>}
   </section>;
  })}</div>
  {mode==='test'&&!record.submitted&&<div className="aaq-submit"><p>{answered} / 6 parts written. Blank parts can still be submitted.</p><button className="button" disabled={!ready||answered===0} onClick={()=>updateRecord(previous=>({...previous,submitted:true}))}>Submit &amp; reveal all guides</button></div>}
  <div className="aaq-score" aria-live="polite"><span className="eyebrow">SELF-ASSESSED SCORE</span><strong>{score.points} / 7</strong><p>{score.scored} / 6 parts scored. Compare your writing with the criteria; these scores are not automatically assigned.</p></div>
  <p className="source-note">The model is one acceptable answer. Other accurate responses can earn credit. Edit a response in practice mode to clear its old self-score.</p>
 </div>;
}
