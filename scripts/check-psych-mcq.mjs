import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const bank=JSON.parse(fs.readFileSync(new URL('src/data/psych-ap-mcq.json',root),'utf8'));
assert.equal(bank.length,100);
assert.equal(new Set(bank.map(q=>q.id)).size,100);
assert.equal(new Set(bank.map(q=>q.stem)).size,100);
assert.equal(new Set(bank.map(q=>q.topic)).size,7);
assert.deepEqual([...new Set(bank.map(q=>q.skill))].sort(),['Concept application','Data analysis','Research methods']);
for(const q of bank){
 assert.equal(q.options.length,4,q.id);
 assert.equal(new Set(q.options).size,4,q.id);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,q.id);
 assert.ok(q.stem.trim()&&q.explanation.trim(),q.id);
 for(const choice of q.options)assert.ok(choice.trim(),q.id);
}
const adaptations=bank.filter(q=>q.source);
assert.equal(adaptations.length,6);
assert.deepEqual(adaptations.map(q=>q.source).sort(),['openstax-11','openstax-12','openstax-13','openstax-5','openstax-7','openstax-9']);
const source=fs.readFileSync(new URL('src/lib/psych-mcq.ts',root),'utf8').replace("import rawQuestions from '@/data/psych-ap-mcq.json';",'const rawQuestions='+JSON.stringify(bank)+';');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const {createMcqSession,scoreMcq,mergeMcqMisses}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
const snapshot=JSON.stringify(bank);
for(const rng of [()=>0,()=>.999,Math.random]){
 const session=createMcqSession(bank,40,rng);
 assert.equal(session.length,40);
 assert.equal(new Set(session.map(q=>q.id)).size,40);
 const answers={};
 for(const q of session){
  assert.deepEqual(q.choices.map(c=>c.originalIndex).sort(),[0,1,2,3]);
  const right=q.choices.find(c=>c.originalIndex===q.correct);
  assert.equal(right.text,q.options[q.correct],'Correct answer must survive shuffling.');
  answers[q.id]=right.originalIndex;
 }
 assert.equal(scoreMcq(session,answers).correct,40);
}
assert.equal(JSON.stringify(bank),snapshot,'Session generation must not mutate the source bank.');
assert.equal(createMcqSession(bank,500).length,100);
assert.equal(createMcqSession([],20).length,0);
const first=bank.find(q=>q.correct===0),second=bank.find(q=>q.id!==first.id);
const answers={[first.id]:0,[second.id]:(second.correct+1)%4};
const score=scoreMcq([first,second],answers);
assert.equal(score.correct,1,'Option index zero must count as answered/correct.');
assert.equal(score.answered,2);
assert.deepEqual(score.missed.map(q=>q.id),[second.id]);
assert.equal(scoreMcq([first],{}).answered,0);
assert.equal(scoreMcq([first],{[first.id]:99}).answered,0);
assert.equal(scoreMcq([first],{other:0}).answered,0);
const saved=mergeMcqMisses(['earlier-session-miss',first.id],[first,second],answers);
assert.deepEqual(saved,['earlier-session-miss',second.id],'Corrected questions must leave missed set while other sessions are retained.');
assert.deepEqual(mergeMcqMisses(saved,[first],{}),saved,'Unanswered questions must not change history.');
const route=fs.readFileSync(new URL('src/app/subjects/[slug]/[exam]/page.tsx',root),'utf8');
assert.ok(route.indexOf('id="ap-mcq"')>route.indexOf('id="ready"'),'MCQ bank must be at the end of the review.');
assert.ok(route.includes('href="#ap-mcq"'),'Contents link missing.');
assert.ok(route.includes('ap-psychology-course-and-exam-description.pdf#page=158'));
assert.ok(route.includes('quizlet.com/798130693/'));
console.log('Passed: 100 unique MCQs; seven topics; explicit source attribution; valid answer keys; question/option shuffling; scoring including option A; missed-question history; end-of-review placement and source links.');
