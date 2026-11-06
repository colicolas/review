import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'src/data',name),'utf8'));
const first=[...read('stranger-details.json'),...read('stranger-sentences.json')];
const ending=[...read('stranger-ending-details.json'),...read('stranger-ending-sentences.json')];
assert.equal(new Set([...first,...ending].map(q=>q.id)).size,first.length+ending.length,'Question IDs must not collide across quizzes.');
for(const [bank,chapters,min,max] of [[first,[1,2,3],46,66],[ending,[4,5],67,82]]){
 for(const q of bank){
  assert.ok(q.prompt.trim()&&q.answer.trim(),q.id);
  assert.ok(chapters.includes(q.chapter),q.id);
  assert.ok(q.page>=min&&q.page<=max,q.id);
  assert.ok(!/downloaded from|Z-Access|gateway to knowledge/i.test(q.prompt+' '+q.answer),'Book footer entered bank.');
 }
 assert.deepEqual([...new Set(bank.map(q=>q.chapter))],chapters);
}
assert.equal(read('stranger-ending-details.json').length,199);
assert.equal(read('stranger-ending-sentences.json').length,467);
assert.ok(read('stranger-ending-sentences.json').at(-1).prompt.includes('cries of hate'),'Final sentence missing.');
// Render the real shared component for both assignments. Resolve TypeScript and
// JSON in memory so no running dev server or test-only build output is needed.
const modules=new Map();
async function sourceUrl(file){
 if(modules.has(file))return modules.get(file);
 let output;
 if(file.endsWith('.json'))output='export default '+fs.readFileSync(file,'utf8');
 else{
  output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const imports=[...new Set([...output.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]))];
  for(const spec of imports){
   let url;
   if(spec.startsWith('@/')){
    const base=path.join(root,'src',spec.slice(2));
    const actual=[base,base+'.tsx',base+'.ts',base+'.json'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
    assert.ok(actual,'Unresolved source '+spec);
    url=await sourceUrl(actual);
   }else url=pathToFileURL(require.resolve(spec)).href;
   output=output.replaceAll('"'+spec+'"',JSON.stringify(url)).replaceAll("'"+spec+"'",JSON.stringify(url));
  }
 }
 const url='data:text/javascript;base64,'+Buffer.from(output).toString('base64');
 modules.set(file,url);return url;
}
const {default:Review}=await import(await sourceUrl(path.join(root,'src/components/stranger-review.tsx')));
const firstHtml=renderToStaticMarkup(React.createElement(Review));
const endHtml=renderToStaticMarkup(React.createElement(Review,{ending:true}));
assert.ok(firstHtml.includes('November 4, 2026')&&firstHtml.includes('Pages 63–97'));
assert.ok(endHtml.includes('November 6, 2026')&&endHtml.includes('Pages 98–end'));
for(const n of [4,5])assert.ok(endHtml.includes(`Part Two · ${n}</option>`));
for(const n of [1,2,3])assert.ok(!endHtml.includes(`Part Two · ${n}</option>`));
for(const n of [1,2,3])assert.ok(firstHtml.includes(`Part Two · ${n}</option>`));
assert.ok(endHtml.includes('Speakers &amp; references'));
assert.ok(firstHtml.includes('People &amp; testimony'));
assert.ok(endHtml.includes('199 available'));
const practiceSource=fs.readFileSync(path.join(root,'src/components/reading-practice.tsx'),'utf8');
assert.ok(practiceSource.includes('localStorage.getItem(storageKey)')&&practiceSource.includes('localStorage.setItem(storageKey,'));
const {shuffle}=await import(await sourceUrl(path.join(root,'src/components/reading-practice.tsx')));
const original=ending.map(q=>q.id);
const session=shuffle(ending).slice(0,40);
assert.equal(new Set(session.map(q=>q.id)).size,40);
assert.deepEqual(ending.map(q=>q.id),original);
console.log('Passed: both reading scopes, all 1,477 question IDs, final-sentence coverage, original/new review rendering, chapter filters, and shuffled sessions.');
