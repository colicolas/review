import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=new URL('../',import.meta.url);
const studies=JSON.parse(fs.readFileSync(new URL('src/data/psych-aaq.json',root),'utf8'));
assert.equal(studies.length,20);
assert.equal(new Set(studies.map(s=>s.id)).size,20);
assert.equal(new Set(studies.map(s=>s.title)).size,20);
let count=0;
for(const study of studies){
 assert.match(study.sourceType,/fictional/,'Study must not be misrepresented as real research.');
 for(const field of ['introduction','participants','procedure','ethics','resultsNote'])assert.ok(study[field].trim(),study.id+' '+field);
 assert.ok(study.table.headers.length>=2&&study.table.rows.length>=1);
 for(const row of study.table.rows){assert.equal(row.length,study.table.headers.length);assert.ok(row.every(value=>value.trim()));}
 assert.deepEqual(study.parts.map(p=>p.letter),['A','B','C','D','E','F']);
 assert.deepEqual(study.parts.map(p=>p.maxPoints),[1,1,1,1,1,2]);
 for(const part of study.parts){
  count++;
  assert.ok(part.prompt.trim()&&part.model.trim()&&part.pitfall.trim());
  assert.ok(part.criteria.length>=1&&part.criteria.every(c=>c.trim()));
 }
}
assert.equal(count,120);
const source=fs.readFileSync(new URL('src/lib/psych-aaq.ts',root),'utf8').replace("import rawStudies from '@/data/psych-aaq.json';",'const rawStudies='+JSON.stringify(studies)+';');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const libraryUrl='data:text/javascript;base64,'+Buffer.from(outputText).toString('base64');
const {aaqLetters,emptyAaqRecord,scoreAaq,nextRandomAaq,restoreAaqRecords}=await import(libraryUrl);
const blank=emptyAaqRecord();
assert.deepEqual(scoreAaq(blank),{points:0,scored:0,maxPoints:7});
assert.deepEqual(scoreAaq({...blank,scores:{A:1,B:0,F:2}}),{points:3,scored:3,maxPoints:7},'Zero marks must count as scored; F permits two points.');
assert.deepEqual(scoreAaq({...blank,scores:{A:2,B:-1,C:.5,F:3}}),{points:0,scored:0,maxPoints:7});
assert.equal(scoreAaq({...blank,scores:Object.fromEntries(aaqLetters.map(l=>[l,l==='F'?2:1]))}).points,7);
let current=studies[0].id,seen=[current];
const visited=[current];
for(let i=1;i<20;i++){
 const next=nextRandomAaq(studies,seen,current,()=>.999);
 assert.ok(next&&!next.newCycle);
 assert.ok(!visited.includes(next.id),'Repeat before all studies were seen.');
 current=next.id;seen=next.seen;visited.push(current);
}
assert.equal(new Set(visited).size,20);
const restarted=nextRandomAaq(studies,seen,current,()=>0);
assert.equal(restarted.newCycle,true);
assert.notEqual(restarted.id,current,'Avoid immediate repeat at the next cycle.');
assert.equal(nextRandomAaq([],[],current),null);
assert.equal(nextRandomAaq([studies[0]],[studies[0].id],studies[0].id).id,studies[0].id);
const input={
 [studies[0].id]:{answers:{A:'An experiment.',F:'Specific evidence and reasoning.'},scores:{A:1,F:2},revealed:['A','F'],submitted:true},
 [studies[1].id]:{answers:{B:'A different saved draft.'},scores:{B:0,F:99},revealed:['B','not-a-part'],submitted:false},
 'unknown-study':{answers:{A:'Do not load me.'}},
};
const restored=restoreAaqRecords(JSON.parse(JSON.stringify(input)),studies);
assert.equal(Object.keys(restored).length,2);
assert.equal(restored[studies[0].id].answers.A,'An experiment.');
assert.equal(restored[studies[0].id].submitted,true);
assert.equal(scoreAaq(restored[studies[0].id]).points,3);
assert.equal(restored[studies[1].id].answers.B,'A different saved draft.');
assert.equal(restored[studies[1].id].scores.B,0);
assert.equal(restored[studies[1].id].scores.F,undefined);
assert.deepEqual(restored[studies[1].id].revealed,['B']);
for(const invalid of [null,[],42,'bad'])assert.deepEqual(restoreAaqRecords(invalid,studies),{});
const route=fs.readFileSync(new URL('src/app/subjects/[slug]/[exam]/page.tsx',root),'utf8');
assert.ok(route.indexOf('<PsychAaqSection/>')>route.indexOf('id="ap-mcq"'));
assert.ok(route.includes('href="#ap-aaq"'));
const require=createRequire(import.meta.url);
function componentUrl(relative,substitutions){
 const source=fs.readFileSync(new URL(relative,root),'utf8');
 let output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 for(const [specifier,url] of Object.entries(substitutions))output=output.replaceAll("'"+specifier+"'",JSON.stringify(url)).replaceAll('"'+specifier+'"',JSON.stringify(url));
 return 'data:text/javascript;base64,'+Buffer.from(output).toString('base64');
}
const shared={react:pathToFileURL(require.resolve('react')).href,'react/jsx-runtime':pathToFileURL(require.resolve('react/jsx-runtime')).href,'@/lib/psych-aaq':libraryUrl,'@/data/psych-aaq.json':'data:text/javascript;base64,'+Buffer.from('export default '+JSON.stringify(studies)).toString('base64')};
const practiceUrl=componentUrl('src/components/psych-aaq-practice.tsx',shared);
const sectionUrl=componentUrl('src/components/psych-aaq-section.tsx',{...shared,'@/components/psych-aaq-practice':practiceUrl});
const {default:Section}=await import(sectionUrl);
const html=renderToStaticMarkup(React.createElement(Section));
assert.ok(html.includes('AAQ guide &amp; practice'));
assert.ok(html.includes('20 practice AAQs'));
assert.equal((html.match(/<textarea /g)||[]).length,6,'The full six-part response form must render.');
assert.ok(html.includes(studies[0].title));
assert.ok(html.includes('25 minutes'));
assert.ok(!html.includes(studies[0].parts[0].model),'Do not reveal the scoring key before the learner requests it.');
assert.ok(html.includes('ap25-frq-psychology-set-2.pdf#page=3'));
console.log('Passed: 20 fictional studies, 120 prompts and keys, seven-point scoring, zero/partial scores, repeat-free randomization, draft restoration, malformed-data handling, section placement, and rendered six-part form with initially hidden guides.');
