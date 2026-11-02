export const jessStandards=[
 {id:'comments',title:'Comments & documentation',page:'1',points:[
  'Every file needs a block header with the author, creation date, and a sufficiently detailed module description.',
  'Use /* … */ block comments with a leading * on every interior line. Align successive inline comments.',
  'Document a function or rule’s operation, limitations, and special conditions such as argument requirements.',
  'Similar rules may share a useful block comment. Quoted rule comments belong on the definition line; explain meaningful details rather than repeating the name or boilerplate.',
  'For a block longer than 10 lines, put an inline comment at its closing parenthesis that identifies the opening construct. At 10 lines or fewer, it is optional.',
 ]},
 {id:'naming',title:'Naming',page:'2–3',points:[
  'Ordinary functions, rules, and variables start with a lowercase letter. Names must express purpose; mixed case is allowed.',
  'Avoid underscores in ordinary names and class names except rare readability-improving cases. Class names start uppercase.',
  'Use ?i, ?j, and ?k generally as loop indices, with physics/engineering exceptions. Never use lowercase l or uppercase O alone; word-like names containing those letters are allowed.',
  'Jess accepting an identifier does not make it compliant: ordinary variable names must not begin with a digit.',
  'Constants use uppercase letters and readability-improving underscores. Choose local or global scope as appropriate; the PDF notes that globals persist through reset.',
 ]},
 {id:'values',title:'Special values & Java calls',page:'3',points:[
  'Define special values as named constants instead of embedding magic numbers.',
  'Exception: values used in rules that come from expert knowledge may appear directly if thoroughly documented.',
  'Always use call to invoke Java methods, for example (call Math random), so they are distinct from native Jess operations.',
 ]},
 {id:'formatting',title:'Formatting',page:'2–4',points:[
  'Use three spaces per indentation level, never indentation tabs.',
  'The opening parenthesis touches the construct name: (while, not ( while.',
  'A multiline construct’s final closing parenthesis belongs on its own line. An entirely one-line construct is the exception.',
  'Keep code displayable without wrapping; the PDF specifies no universal character count. Exception: exceptionally long static text bound to a string variable.',
  'Use spaces for readable conditions and loop statements. Bound logically related blocks with blank lines; every function and rule needs a blank line above and below.',
 ]},
 {id:'flow',title:'Flow control',page:'4',points:[
  'Do not use break. Use continue sparingly, only when it improves readability.',
  'A for-loop must run a predetermined fixed number of iterations. Do not modify its iterator inside the body or use for to imitate while.',
  'Normally use one parenthesized return as a function’s last executable line. Multiple returns may be allowed when they make the code easier to understand; very small functions have a clarity-dependent exception.',
  'Rules generally must not use return; special circumstances must be clearly documented.',
  'Use salience sparingly for justified UI ordering, forward-chained versus backward-chained counterparts, or important dependencies across rule groups—not arbitrary sequencing.',
 ]},
 {id:'organization',title:'File organization',page:'4',points:[
  'Keep similar constructs together. Group declarations, functions, and rules instead of interleaving their categories.',
  'Put scripting at the top or bottom of the file, never in the middle.',
 ]},
];
export const headerExample=`/*
* Author: Jordan Lee
* Created: 2026-11-02
* Asks yes/no habitat questions and eliminates candidate animals
* whose known habitats conflict with the supplied answers.
*/`;
