export type ChoiceScenario={story:string;correct:number;why:string};
export type ScenarioCard=ChoiceScenario&{id:number;choices:number[]};
function shuffled<T>(items:readonly T[],random:()=>number){
 const result=[...items];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
export function createScenarioDeck(scenarios:readonly ChoiceScenario[],labelCount:number,random:()=>number=Math.random):ScenarioCard[]{
 const choices=Array.from({length:labelCount},(_,i)=>i);
 return shuffled(scenarios.map((scenario,id)=>({...scenario,id,choices:shuffled(choices,random)})),random);
}
export function scoreScenarios(deck:readonly ScenarioCard[],answers:Record<number,number>){
 let answered=0,correct=0;
 for(const card of deck){const answer=answers[card.id];if(!Number.isInteger(answer)||!card.choices.includes(answer))continue;answered++;if(answer===card.correct)correct++;}
 return {answered,correct};
}
