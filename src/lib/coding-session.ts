export function shuffleQuestions<T>(items:readonly T[]):T[]{
 const result=[...items];
 for(let i=result.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
}
export function checkFiveLines(selected:readonly number[],errors:Record<string,string|undefined>){
 const unique=new Set(selected);
 const hits=[...unique].filter(n=>errors[String(n)]!==undefined).length;
 return {hits,correct:selected.length===5&&unique.size===5&&hits===5};
}
