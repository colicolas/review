import rawQuestions from '@/data/psych-ap-mcq.json';
export type PsychQuestion={id:string;topic:string;skill:string;stem:string;options:string[];correct:number;explanation:string;trap?:string;source?:string;stimulus?:string};
export type SessionQuestion=PsychQuestion&{choices:{text:string;originalIndex:number}[]};
export const psychQuestions:PsychQuestion[]=rawQuestions;
export const openStaxSource={
 title:'Psychology 2e · Chapter 6 review questions',
 url:'https://openstax.org/books/psychology-2e/pages/6-review-questions',
 bookUrl:'https://openstax.org/books/psychology-2e/pages/1-introduction',
 authors:'Rose M. Spielman, William J. Jenkins, Marilyn D. Lovett',
 license:'https://creativecommons.org/licenses/by-nc-sa/4.0/',
};
function shuffle<T>(items:readonly T[],random:()=>number){
 const copy=[...items];
 for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
 return copy;
}
export function createMcqSession(questions:readonly PsychQuestion[],limit:number,random:()=>number=Math.random):SessionQuestion[]{
 return shuffle(questions,random).slice(0,limit).map(q=>({...q,choices:shuffle(q.options.map((text,originalIndex)=>({text,originalIndex})),random)}));
}
export function scoreMcq(questions:readonly PsychQuestion[],answers:Record<string,number>){
 let correct=0,answered=0;
 const missed:PsychQuestion[]=[];
 for(const q of questions){
  const answer=answers[q.id];
  if(!Number.isInteger(answer)||answer<0||answer>=q.options.length)continue;
  answered++;
  if(answer===q.correct)correct++;else missed.push(q);
 }
 return {correct,answered,missed};
}
export function mergeMcqMisses(previous:readonly string[],questions:readonly PsychQuestion[],answers:Record<string,number>){
 const result=new Set(previous);
 for(const q of questions){
  const answer=answers[q.id];
  if(!Number.isInteger(answer)||answer<0||answer>=q.options.length)continue;
  if(answer===q.correct)result.delete(q.id);else result.add(q.id);
 }
 return [...result];
}
