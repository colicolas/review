'use client';
import {useEffect,useState} from 'react';
import {createMcqSession,mergeMcqMisses,openStaxSource,scoreMcq,type PsychQuestion,type SessionQuestion} from '@/lib/psych-mcq';
const storageKey='psych-learning-ap-mcq-missed';
type Mode='practice'|'test';
function SourceCredit({question}:{question:PsychQuestion}){
 if(!question.source)return <p className="mcq-origin">Original AP-style practice</p>;
 return <p className="mcq-origin">Adapted from <a href={openStaxSource.url} target="_blank" rel="noreferrer">OpenStax, Q{question.source.split('-')[1]}</a>. Wording/options changed; explanation added. <a href={openStaxSource.license} target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>.</p>;
}
export default function PsychMcqPractice({questions:psychQuestions}:{questions:PsychQuestion[]}){
 const [topic,setTopic]=useState('All learning topics'),[size,setSize]=useState('20'),[mode,setMode]=useState<Mode>('practice'),[origin,setOrigin]=useState('all'),[onlyMissed,setOnlyMissed]=useState(false),[missed,setMissed]=useState<string[]>([]),[ready,setReady]=useState(false);
 const [deck,setDeck]=useState<SessionQuestion[]>([]),[index,setIndex]=useState(0),[answers,setAnswers]=useState<Record<string,number>>({}),[sessionMode,setSessionMode]=useState<Mode>('practice'),[finished,setFinished]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved)){const ids=new Set(psychQuestions.map(q=>q.id));setMissed(saved.filter((id):id is string=>typeof id==='string'&&ids.has(id)))}}catch{}setReady(true)},[]);
 const topics=[...new Set(psychQuestions.map(q=>q.topic))];
 const eligible=psychQuestions.filter(q=>(topic==='All learning topics'||q.topic===topic)&&(origin==='all'||(origin==='online'?!!q.source:!q.source))&&(!onlyMissed||missed.includes(q.id)));
 const q=deck[index],chosen=q?answers[q.id]:undefined;
 const graded=chosen!==undefined&&sessionMode==='practice';
 const score=scoreMcq(deck,answers);
 function saveMisses(next:string[]){setMissed(next);try{localStorage.setItem(storageKey,JSON.stringify(next))}catch{}}
 function start(){setDeck(createMcqSession(eligible,size==='All'?eligible.length:Number(size)));setAnswers({});setIndex(0);setSessionMode(mode);setFinished(false)}
 function choose(answer:number){
  if(!q||finished||(sessionMode==='practice'&&answers[q.id]!==undefined))return;
  const next={...answers,[q.id]:answer};setAnswers(next);
  if(sessionMode==='practice')saveMisses(mergeMcqMisses(missed,[q],next));
 }
 function finish(){
  if(!deck.length||score.answered!==deck.length)return;
  saveMisses(mergeMcqMisses(missed,deck,answers));setFinished(true);
 }
 function retryMisses(){
  if(!score.missed.length)return;
  setDeck(createMcqSession(score.missed,score.missed.length));setAnswers({});setIndex(0);setSessionMode('practice');setFinished(false);
 }
 return <div className="reading-practice mcq-practice"><div className="practice-settings mcq-settings"><label>Topic<select value={topic} onChange={e=>setTopic(e.target.value)}><option>All learning topics</option>{topics.map(t=><option key={t}>{t}</option>)}</select></label><label>Questions<select value={size} onChange={e=>setSize(e.target.value)}>{['10','20','40','All'].map(n=><option key={n}>{n}</option>)}</select></label><label>Feedback<select value={mode} onChange={e=>setMode(e.target.value as Mode)}><option value="practice">Practice · after each answer</option><option value="test">Test · after finishing</option></select></label><label>Question source<select value={origin} onChange={e=>setOrigin(e.target.value)}><option value="all">All questions</option><option value="online">OpenStax adaptations · 6</option><option value="original">Original AP-style · 94</option></select></label></div><div className="reading-start"><label><input type="checkbox" disabled={!ready} checked={onlyMissed} onChange={e=>setOnlyMissed(e.target.checked)}/> Only missed ({missed.length})</label><span>{eligible.length} available</span><button className="button" disabled={!eligible.length} onClick={start}>{deck.length?'New shuffled session':'Start shuffled session'} ↗</button></div>{!eligible.length&&<p className="exercise-help">No questions match these filters. Choose another topic or source, or turn off “Only missed.”</p>}
 {q&&!finished&&<div className="reading-card mcq-card"><div className="diagram-head"><span className="eyebrow">{q.skill} · {sessionMode==='practice'?'PRACTICE':'TEST'}</span><span>{index+1} / {deck.length}</span></div><div className="progress-track"><span style={{width:`${score.answered/deck.length*100}%`}}/></div>{q.stimulus&&<p className="question-context">{q.stimulus}</p>}<h3>{q.stem}</h3><div className="answers">{q.choices.map((choice,i)=><button key={choice.originalIndex} aria-pressed={chosen===choice.originalIndex} disabled={graded} onClick={()=>choose(choice.originalIndex)} className={graded?(choice.originalIndex===q.correct?'correct':choice.originalIndex===chosen?'incorrect':''):chosen===choice.originalIndex?'mcq-selected':''}><span>{String.fromCharCode(65+i)}</span>{choice.text}{graded&&choice.originalIndex===q.correct&&<b>✓</b>}</button>)}</div>{graded&&<div className="feedback" aria-live="polite"><b>{chosen===q.correct?'Correct.':`Correct answer: ${q.options[q.correct]}`}</b><p>{q.explanation}</p>{q.trap&&<p className="mcq-trap"><strong>Watch for:</strong> {q.trap}</p>}</div>}<SourceCredit question={q}/><div className="practice-controls"><button disabled={index===0} onClick={()=>setIndex(i=>i-1)}>← Previous</button><span>{sessionMode==='practice'?`${score.correct} correct / ${score.answered} answered`:`${score.answered} / ${deck.length} answered`}</span>{index===deck.length-1?<button disabled={score.answered!==deck.length} onClick={finish}>Finish {sessionMode==='test'?'test':'session'} →</button>:<button disabled={chosen===undefined} onClick={()=>setIndex(i=>i+1)}>Next →</button>}</div>{sessionMode==='test'&&<p className="source-note">You can change answers before finishing. Explanations appear afterward.</p>}</div>}
 {finished&&<div className="mcq-results" aria-live="polite"><div className="reading-results"><h3>{sessionMode==='test'?'Test':'Session'} complete</h3><p className="mcq-score">{score.correct} / {deck.length} <span>· {Math.round(score.correct/deck.length*100)}% correct</span></p><div className="mcq-result-actions">{score.missed.length>0&&<button className="button" onClick={retryMisses}>Practice these {score.missed.length} misses ↻</button>}<button className="text-button" disabled={!eligible.length} onClick={start}>New shuffled session</button></div></div><h3 className="mcq-review-title">Answer review</h3>{deck.map((item,i)=>{const answer=answers[item.id];return <details className="mcq-answer-review" key={item.id}><summary><span>{answer===item.correct?'✓':'×'}</span> {i+1}. {item.stem}</summary><div><p><b>Your answer:</b> {item.options[answer]}</p><p><b>Correct answer:</b> {item.options[item.correct]}</p><p>{item.explanation}</p>{item.trap&&<p><b>Watch for:</b> {item.trap}</p>}<SourceCredit question={item}/></div></details>})}</div>}
 <p className="mcq-attribution">OpenStax adaptations: <cite>Psychology 2e</cite>, {openStaxSource.authors}. <a href={openStaxSource.bookUrl} target="_blank" rel="noreferrer">Access for free at OpenStax</a>. Those adaptations use <a href={openStaxSource.license} target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>.</p>
 </div>;
}
