export const DND_CLASS_RULES = Object.freeze({
 Barbarian:{hitDie:12, saves:['str','con'], armour:'unarmoured-barbarian', starterArmour:'Unarmoured', weapon:'Greataxe', slots:[0,0,0,0,0,0,0,0,0]},
 Bard:{hitDie:8,saves:['dex','cha'],armour:'light',starterArmour:'Leather armour',weapon:'Rapier',slots:[2,3,4,4,4,4,4,4,4]},
 Cleric:{hitDie:8,saves:['wis','cha'],armour:'medium',starterArmour:'Scale mail',weapon:'Mace',slots:[2,3,4,4,4,4,4,4,4]},
 Druid:{hitDie:8,saves:['int','wis'],armour:'medium',starterArmour:'Leather armour',weapon:'Scimitar',slots:[2,3,4,4,4,4,4,4,4]},
 Fighter:{hitDie:10,saves:['str','con'],armour:'heavy',starterArmour:'Chain mail',weapon:'Longsword',slots:[0,0,0,0,0,0,0,0,0]},
 Monk:{hitDie:8,saves:['str','dex'],armour:'unarmoured-monk',starterArmour:'Unarmoured',weapon:'Shortsword',slots:[0,0,0,0,0,0,0,0,0]},
 Paladin:{hitDie:10,saves:['wis','cha'],armour:'heavy',starterArmour:'Chain mail',weapon:'Longsword',slots:[0,0,0,3,3,3,3,3,3]},
 Ranger:{hitDie:10,saves:['str','dex'],armour:'medium',starterArmour:'Scale mail',weapon:'Longbow',slots:[0,0,0,3,3,3,3,3,3]},
 Rogue:{hitDie:8,saves:['dex','int'],armour:'light',starterArmour:'Leather armour',weapon:'Rapier',slots:[0,0,0,0,0,0,0,0,0]},
 Sorcerer:{hitDie:6,saves:['con','cha'],armour:'none',starterArmour:'Unarmoured',weapon:'Dagger',slots:[2,3,4,4,4,4,4,4,4]},
 Warlock:{hitDie:8,saves:['wis','cha'],armour:'light',starterArmour:'Leather armour',weapon:'Light crossbow',slots:[1,2,2,2,2,2,2,2,2]},
 Wizard:{hitDie:6,saves:['int','wis'],armour:'none',starterArmour:'Unarmoured',weapon:'Quarterstaff',slots:[2,3,4,4,4,4,4,4,4]}
});
const ARMOUR = {
 'Unarmoured':{type:'none',ac:10},
 'Leather armour':{type:'light',ac:11},
 'Studded leather':{type:'light',ac:12},
 'Hide armour':{type:'medium',ac:12},
 'Scale mail':{type:'medium',ac:14},
 'Chain shirt':{type:'medium',ac:13},
 'Breastplate':{type:'medium',ac:14},
 'Half plate':{type:'medium',ac:15},
 'Ring mail':{type:'heavy',ac:14},
 'Chain mail':{type:'heavy',ac:16},
 'Splint armour':{type:'heavy',ac:17},
 'Plate armour':{type:'heavy',ac:18}
};
export function abilityMod(score){return Math.floor((Number(score)-10)/2)}
const SPECIES_BONUSES = {Human:{str:1,dex:1,con:1,int:1,wis:1,cha:1},Elf:{dex:2},Dwarf:{con:2},Halfling:{dex:2},Dragonborn:{str:2,cha:1},Gnome:{int:2},'Half-Elf':{cha:2},'Half-Orc':{str:2,con:1},Tiefling:{int:1,cha:2},Other:{}};
export function speciesBaseAbilityScores(species,final){ const bonus=SPECIES_BONUSES[species]||{}; return Object.fromEntries(['str','dex','con','int','wis','cha'].map(k=>[k,Math.max(3,(Number(final?.[k])||10)-(bonus[k]||0))]));}\nexport function speciesAbilityScores(species,base){
 const bonus=SPECIES_BONUSES[species]||{};
 return Object.fromEntries(['str','dex','con','int','wis','cha'].map(k=>[k,Math.min(20,(Number(base?.[k])||10)+(bonus[k]||0))]));
}
export function startingStats(className,abilities,level=1,armourName){
 const rule=DND_CLASS_RULES[className]||DND_CLASS_RULES.Fighter;
 const safeLevel=Math.max(1,Math.min(20,Math.floor(Number(level)||1)));
 const con=abilityMod(abilities?.con??10),dex=abilityMod(abilities?.dex??10),wis=abilityMod(abilities?.wis??10);
 const hp=Math.max(1,rule.hitDie+con+(safeLevel-1)*(Math.ceil(rule.hitDie/2)+1+con));
 const armour=ARMOUR[armourName||rule.starterArmour]||ARMOUR[rule.starterArmour];
 let ac=armour.ac;
 if(armour.type==='light')ac+=dex;
 else if(armour.type==='medium')ac+=Math.min(2,dex);
 else if(armour.type==='none')ac+=dex;
 if(rule.armour==='unarmoured-barbarian'&&!armourName)ac=10+dex+con;
 if(rule.armour==='unarmoured-monk'&&!armourName)ac=10+dex+wis;
 return {level:safeLevel,hitDie:rule.hitDie,maxHp:hp,hp,armourClass:ac,armour:armourName||rule.starterArmour,weapon:rule.weapon,savingThrows:rule.saves,spellSlots:rule.slots[safeLevel-1]||0,spellSlotLevel:Math.min(9,Math.ceil(safeLevel/2)),proficiencyBonus:Math.ceil(safeLevel/4)+1};
}
export function classRules(className){return DND_CLASS_RULES[className]||DND_CLASS_RULES.Fighter}
