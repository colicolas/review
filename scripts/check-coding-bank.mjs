import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shuffleQuestions,checkFiveLines} from '../src/lib/coding-session.ts';
const questions=JSON.parse(fs.readFileSync(new URL('../src/data/jess-questions.json',import.meta.url),'utf8'));
assert.equal(questions.length,150);
assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.equal(new Set(questions.map(q=>JSON.stringify([q.prompt,q.code,q.lines]))).size,questions.length,'Each problem needs distinct content.');
const counts={};
for(const q of questions){
 counts[q.kind]=(counts[q.kind]||0)+1;
 assert.ok(q.prompt.trim()&&q.answer.trim());
 assert.ok(q.page>=1&&q.page<=4);
 if(q.kind==='Rewrite')assert.ok(q.solution?.trim(),'Missing rewrite: '+q.id);
 if(q.kind==='Find five'){
  assert.equal(Object.keys(q.errors).length,5);
  for(const [line,reason] of Object.entries(q.errors)){
   assert.ok(Number(line)>=1&&Number(line)<=q.lines.length);
   assert.ok(q.lines[Number(line)-1].trim());
   assert.ok(reason.trim());
  }
  const right=Object.keys(q.errors).map(Number);
  assert.deepEqual(checkFiveLines(right,q.errors),{hits:5,correct:true});
  assert.equal(checkFiveLines(right.slice(0,4),q.errors).correct,false);
  const validLine=q.lines.findIndex((_,i)=>!q.errors[String(i+1)])+1;
  assert.equal(checkFiveLines([...right.slice(0,4),validLine],q.errors).correct,false);
  assert.equal(checkFiveLines([...right.slice(0,4),right[0]],q.errors).correct,false);
  // These short excerpts intentionally do not add a sixth violation from the >10-line closing-comment rule.
  assert.ok(q.lines.length<=10);
 }
}
assert.deepEqual(counts,{Recall:50,Diagnose:40,Rewrite:30,Exceptions:20,'Find five':10});
const originalIds=questions.map(q=>q.id);
for(let i=0;i<10;i++){
 const shuffled=shuffleQuestions(questions);
 assert.deepEqual(shuffled.map(q=>q.id).sort(),[...originalIds].sort());
 assert.equal(new Set(shuffled.slice(0,20).map(q=>q.id)).size,20);
}
assert.deepEqual(questions.map(q=>q.id),originalIds,'Shuffle must not mutate the bank.');
console.log('Passed: 150 valid questions, all five-error keys and grading edge cases, complete shuffled decks, no session duplicates, no bank mutation.');
