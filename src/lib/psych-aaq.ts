import rawStudies from '@/data/psych-aaq.json';
export const aaqLetters=['A','B','C','D','E','F'] as const;
export type AaqLetter=typeof aaqLetters[number];
export type AaqPart={letter:AaqLetter;label:string;maxPoints:number;prompt:string;model:string;criteria:string[];pitfall:string};
export type AaqStudy={id:string;title:string;topic:string;sourceType:string;introduction:string;participants:string;procedure:string;ethics:string;table:{headers:string[];rows:string[][]};resultsNote:string;parts:AaqPart[]};
export type AaqRecord={answers:Partial<Record<AaqLetter,string>>;scores:Partial<Record<AaqLetter,number>>;revealed:AaqLetter[];submitted:boolean};
export const aaqStudies=rawStudies as AaqStudy[];
export function emptyAaqRecord():AaqRecord{return {answers:{},scores:{},revealed:[],submitted:false};}
export function scoreAaq(record:AaqRecord){
 let points=0,scored=0;
 for(const letter of aaqLetters){const value=record.scores[letter],max=letter==='F'?2:1;if(typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=max){points+=value;scored++;}}
 return {points,scored,maxPoints:7};
}
export function nextRandomAaq(studies:readonly AaqStudy[],seen:readonly string[],currentId:string,random:()=>number=Math.random){
 if(!studies.length)return null;
 let pool=studies.filter(s=>!seen.includes(s.id));
 const newCycle=pool.length===0;
 if(newCycle){pool=studies.filter(s=>s.id!==currentId);if(!pool.length)pool=[...studies];}
 const chosen=pool[Math.floor(random()*pool.length)];
 return {id:chosen.id,seen:newCycle?[chosen.id]:[...new Set([...seen,chosen.id])],newCycle};
}
export function restoreAaqRecords(value:unknown):Record<string,AaqRecord>{
 const result:Record<string,AaqRecord>={};
 if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const study of aaqStudies){
  const raw=(value as Record<string,unknown>)[study.id];
  if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;
  const candidate=raw as Partial<AaqRecord>;
  const record=emptyAaqRecord();
  for(const letter of aaqLetters){
   const answer=candidate.answers?.[letter];if(typeof answer==='string')record.answers[letter]=answer;
   const score=candidate.scores?.[letter];if(typeof score==='number'&&Number.isInteger(score)&&score>=0&&score<=(letter==='F'?2:1))record.scores[letter]=score;
  }
  if(Array.isArray(candidate.revealed))record.revealed=aaqLetters.filter(l=>candidate.revealed!.includes(l));
  record.submitted=candidate.submitted===true;
  result[study.id]=record;
 }
 return result;
}
