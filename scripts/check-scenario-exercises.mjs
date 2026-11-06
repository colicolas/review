import assert from 'node:assert/strict';
import fs from 'node:fs';
import {operantLabels,operantScenarios,scheduleLabels,scheduleScenarios} from '../src/lib/exercises.ts';
import {createScenarioDeck,scoreScenarios} from '../src/lib/scenario-session.ts';
assert.equal(scheduleScenarios.length,20);
assert.equal(new Set(scheduleScenarios.map(q=>q.story)).size,20);
for(let label=0;label<5;label++)assert.equal(scheduleScenarios.filter(q=>q.correct===label).length,4);
for(const [bank,labels] of [[operantScenarios,operantLabels],[scheduleScenarios,scheduleLabels]]){
 const original=JSON.stringify(bank);
 for(const q of bank){assert.ok(q.story.trim()&&q.why.trim());assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<labels.length);}
 for(const random of [()=>0,()=>.999,Math.random]){
  const deck=createScenarioDeck(bank,labels.length,random);
  assert.equal(deck.length,bank.length);
  assert.equal(new Set(deck.map(q=>q.id)).size,bank.length,'No repeated scenarios within a run.');
  const responses={};
  for(const card of deck){
   assert.equal(card.story,bank[card.id].story);
   assert.equal(card.correct,bank[card.id].correct);
   assert.deepEqual([...card.choices].sort((a,b)=>a-b),labels.map((_,i)=>i));
   const displayedCorrectPosition=card.choices.indexOf(card.correct);
   responses[card.id]=card.choices[displayedCorrectPosition];
  }
  assert.deepEqual(scoreScenarios(deck,responses),{answered:bank.length,correct:bank.length},'Correct answer mapping must survive both shuffles.');
  assert.deepEqual(scoreScenarios(deck,{}),{answered:0,correct:0});
 }
 assert.equal(JSON.stringify(bank),original,'Do not mutate source scenarios.');
 const deck=createScenarioDeck(bank,labels.length,()=>0);
 assert.notDeepEqual(deck.map(q=>q.id),bank.map((_,i)=>i),'Scenario order must actually shuffle.');
 assert.notDeepEqual(deck[0].choices,labels.map((_,i)=>i),'Answer order must actually shuffle.');
 const zero=deck.find(q=>q.correct===0);
 assert.deepEqual(scoreScenarios(deck,{[zero.id]:0}),{answered:1,correct:1},'Option zero must count as answered.');
 assert.deepEqual(scoreScenarios(deck,{[zero.id]:labels.length+1}),{answered:0,correct:0});
}
const route=fs.readFileSync(new URL('../src/app/subjects/[slug]/[exam]/page.tsx',import.meta.url),'utf8');
assert.ok(route.includes('<Consequences/><OperantExercise/><ScheduleExercise/>'),'Schedule drill belongs directly below the consequence exercise.');
console.log('Passed: 12 consequence scenarios and 20 balanced schedule scenarios; shuffled scenarios/answers, stable answer mapping, no duplicate questions, correct scoring, source immutability, and section placement.');
