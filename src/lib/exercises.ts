export const classicalLabels = ['Neutral stimulus (NS)', 'Unconditioned stimulus (US)', 'Unconditioned response (UR)', 'Conditioned stimulus (CS)', 'Conditioned response (CR)'];
export const classicalScenarios = [
 {title:'The lunch bell',story:'Before training, a bell does not make a dog salivate. Food naturally makes it salivate. After the bell repeatedly sounds just before food arrives, the dog salivates to the bell alone.',cue:'The bell',us:'Food',ur:'Salivation when food arrives',cr:'Salivation to the bell alone'},
 {title:'A puff of air',story:'A soft tone initially causes no blink. An air puff to the eye naturally causes blinking. After repeated tone–puff pairings, the tone alone causes a blink.',cue:'The soft tone',us:'The air puff to the eye',ur:'Blinking to the air puff',cr:'Blinking to the tone alone'},
 {title:'The clinic hallway',story:'A hallway smell initially causes no nausea. A medical treatment naturally causes nausea. After repeated visits pairing the smell with the treatment, the smell alone produces nausea.',cue:'The hallway smell',us:'The nausea-producing treatment',ur:'Nausea during treatment',cr:'Nausea from the hallway smell alone'},
 {title:'A camera flash',story:'A blue symbol initially causes no blink. A bright flash naturally makes a person blink. After the symbol repeatedly appears before the flash, the symbol alone elicits blinking.',cue:'The blue symbol',us:'The bright flash',ur:'Blinking to the bright flash',cr:'Blinking to the symbol alone'},
 {title:'The white rat',story:'A child initially shows no fear of a white rat. A sudden loud noise naturally causes fear. After repeated rat–noise pairings, seeing the rat alone causes fear.',cue:'The white rat',us:'The sudden loud noise',ur:'Fear in response to the loud noise',cr:'Fear at the sight of the rat alone'},
 {title:'A new ringtone',story:'A new ringtone initially causes no excitement. Playing with a favorite person naturally excites a puppy. After the ringtone repeatedly precedes playtime, the puppy becomes excited at the ringtone alone.',cue:'The new ringtone',us:'Play with the favorite person',ur:'Excitement during play',cr:'Excitement at the ringtone alone'},
 {title:'The lemon picture',story:'A geometric picture initially causes no salivation. Lemon juice naturally causes salivation. After repeated picture–juice pairings, viewing the picture alone makes a person salivate.',cue:'The geometric picture',us:'Lemon juice in the mouth',ur:'Salivation to lemon juice',cr:'Salivation while viewing the picture alone'},
 {title:'A warning light',story:'A small light initially causes no flinch. A sudden startling sound naturally causes flinching. After the light repeatedly precedes the sound, the light alone causes a flinch.',cue:'The small light',us:'The sudden startling sound',ur:'Flinching to the startling sound',cr:'Flinching to the light alone'},
];
export const operantLabels = ['Positive reinforcement','Negative reinforcement','Positive punishment','Negative punishment'];
export const operantScenarios = [
 {story:'After Maya volunteers an answer, her teacher praises her. Maya volunteers more often.',correct:0,why:'Praise is added, and volunteering increases.'},
 {story:'A loud seat-belt alarm stops when Eli buckles up. Eli becomes more likely to buckle up promptly.',correct:1,why:'The alarm is removed, and buckling increases.'},
 {story:'A coach assigns extra laps after late arrivals. The athlete arrives late less often.',correct:2,why:'Extra laps are added, and late arrivals decrease.'},
 {story:'A parent removes gaming privileges after insults. The child insults others less often.',correct:3,why:'Gaming privileges are removed, and insults decrease.'},
 {story:'A café gives a free pastry after customers buy ten drinks. Customers buy drinks more often.',correct:0,why:'A pastry is added, and drink purchases increase.'},
 {story:'Taking out the trash ends a persistent unpleasant smell. Jordan starts taking it out sooner and more often.',correct:1,why:'The unpleasant smell is removed, and taking out trash increases.'},
 {story:'A parking fine follows parking in a restricted space. The driver parks there less often.',correct:2,why:'A fine is imposed (added), and restricted parking decreases.'},
 {story:'A player loses earned game tokens after breaking a rule. Rule breaking decreases.',correct:3,why:'Earned tokens are removed, and rule breaking decreases.'},
 {story:'A dog receives a treat after sitting on command. Sitting on command increases.',correct:0,why:'Food is added, and sitting increases.'},
 {story:'A student can skip an unpleasant chore after completing homework on time. On-time homework increases.',correct:1,why:'An unpleasant requirement is avoided, and completing homework on time increases. Avoidance can be negative reinforcement.'},
 {story:'A device emits an unpleasant buzz whenever someone presses the wrong key. Wrong-key presses decrease.',correct:2,why:'An unpleasant buzz is added, and wrong-key presses decrease.'},
 {story:'A teen loses access to the family car after missing curfew. Missing curfew becomes less frequent.',correct:3,why:'Car access is removed, and missing curfew decreases.'},
];
