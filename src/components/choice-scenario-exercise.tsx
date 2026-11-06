'use client';
import {useEffect,useState} from 'react';
import {createScenarioDeck,scoreScenarios,type ChoiceScenario,type ScenarioCard} from '@/lib/scenario-session';
type Props={id:string;title:string;instructions:string;labels:readonly string[];scenarios:readonly ChoiceScenario[]};
export default function ChoiceScenarioExercise({id,title,instructions,labels,scenarios}:Props){
 const [deck,setDeck]=useState<ScenarioCard[]|null>(null);
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<number,number>>({});
 // Shuffle after hydration, then keep each card's order stable during the run.
 useEffect(()=>{setDeck(createScenarioDeck(scenarios,labels.length));setIndex(0);setAnswers({});},[scenarios,labels.length]);
 function restart(){setDeck(createScenarioDeck(scenarios,labels.length));setIndex(0);setAnswers({});}
 const scenario=deck?.[index];
 const chosen=scenario?answers[scenario.id]:undefined;
 const score=scoreScenarios(deck||[],answers);
 function choose(choice:number){if(!scenario||answers[scenario.id]!==undefined)return;setAnswers(previous=>({...previous,[scenario.id]:choice}));}
 return <div className="scenario-exercise" id={id}>
  <div className="diagram-head"><h3>{title}</h3><span>{scenario?`Scenario ${index+1} / ${scenarios.length}`:`${scenarios.length} scenarios`}</span></div>
  <p className="exercise-help">{instructions}</p>
  <p className="source-note">Scenarios and answer choices shuffle on each new run.</p>
  {scenario?<>
   <div className="scenario-story"><p>{scenario.story}</p></div>
   <div className="answers">{scenario.choices.map((choice,position)=><button key={choice} aria-pressed={chosen===choice} disabled={chosen!==undefined} onClick={()=>choose(choice)} className={chosen===undefined?'':choice===scenario.correct?'correct':choice===chosen?'incorrect':''}><span>{String.fromCharCode(65+position)}</span>{labels[choice]}{chosen!==undefined&&choice===scenario.correct&&<b>✓</b>}</button>)}</div>
   <div aria-live="polite">{chosen!==undefined&&<div className="feedback"><b>{chosen===scenario.correct?'Correct.':`Correct: ${labels[scenario.correct]}.`}</b><p>{scenario.why}</p></div>}</div>
   <div className="practice-controls"><button disabled={index===0} onClick={()=>setIndex(i=>i-1)}>← Previous</button><span>{score.correct} correct / {score.answered} answered</span><button disabled={index===scenarios.length-1} onClick={()=>setIndex(i=>i+1)}>Next →</button></div>
   {score.answered===scenarios.length&&<div className="quiz-complete" aria-live="polite"><p>All scenarios answered. {score.correct} / {scenarios.length} correct.</p></div>}
   <button className="text-button scenario-restart" onClick={restart}>Restart &amp; shuffle ↻</button>
  </>:<p className="exercise-help" role="status">Preparing shuffled scenarios…</p>}
 </div>;
}
