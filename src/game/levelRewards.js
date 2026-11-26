const DND_SPELL_SLOTS={
  Wizard:[[2,2,0,0,0,0,0,0,0],[3,3,0,0,0,0,0,0,0],[4,4,2,0,0,0,0,0,0],[5,4,3,0,0,0,0,0,0],[6,4,3,2,0,0,0,0,0],[7,4,3,3,1,0,0,0,0],[8,4,3,3,2,0,0,0,0],[9,4,3,3,3,1,0,0,0],[10,4,3,3,3,2,0,0,0],[11,4,3,3,3,2,1,0,0],[12,4,3,3,3,2,1,0,0],[13,4,3,3,3,2,1,1,0],[14,4,3,3,3,2,1,1,0],[15,4,3,3,3,2,1,1,1],[16,4,3,3,3,2,1,1,1],[17,4,3,3,3,2,1,1,1],[18,4,3,3,3,3,1,1,1],[19,4,3,3,3,3,2,1,1],[20,4,3,3,3,3,2,2,1]]
};
const DETECTIVE_RANKS=[{level:1,title:'Detective Constable',perk:'Foundational casework and scene procedure'},{level:3,title:'Experienced Detective Constable',perk:'Specialist interview technique'},{level:5,title:'Detective Sergeant',perk:'Lead a small investigative team'},{level:8,title:'Detective Inspector',perk:'Coordinate complex investigations'},{level:12,title:'Detective Chief Inspector',perk:'Oversee major crime operations'},{level:16,title:'Senior Investigating Officer',perk:'Command multi-agency investigations'}];
const HORROR_TRAITS=[{level:2,title:'Steady Nerves',description:'Once per chapter, recover composure after a frightening event.'},{level:4,title:'Pattern Recognition',description:'Notice recurring signs and environmental clues sooner.'},{level:6,title:'Hard to Break',description:'Once per chapter, resist a fear or stress consequence.'},{level:9,title:'Survivor Instinct',description:'Gain one extra opportunity to escape a lethal situation.'},{level:12,title:'Unshakeable',description:'Recover composure more effectively after major threats.'}];
const CLASS_FEATURES={
 Barbarian:{2:'Reckless Attack, Danger Sense',3:'Primal Path',5:'Extra Attack, Fast Movement',7:'Feral Instinct',9:'Brutal Critical'},
 Bard:{2:'Jack of All Trades, Song of Rest',3:'Bard College',5:'Font of Inspiration',6:'Countercharm, College feature',10:'Magical Secrets'},
 Cleric:{2:'Channel Divinity',3:'2nd-level spells',5:'Destroy Undead',6:'Domain feature',8:'Divine Strike or Potent Spellcasting'},
 Druid:{2:'Wild Shape improvement, Druid Circle',4:'Wild Shape improvement',5:'3rd-level spells',6:'Circle feature',10:'Circle feature'},
 Fighter:{2:'Action Surge',3:'Martial Archetype',5:'Extra Attack',7:'Archetype feature',9:'Indomitable',11:'Extra Attack (2)'},
 Monk:{2:'Ki, Unarmoured Movement',3:'Monastic Tradition, Deflect Missiles',5:'Extra Attack, Stunning Strike',6:'Ki-Empowered Strikes',10:'Purity of Body'},
 Paladin:{2:'Fighting Style, Divine Smite',3:'Sacred Oath',5:'Extra Attack',6:'Aura of Protection',10:'Aura of Courage'},
 Ranger:{2:'Fighting Style',3:'Ranger Archetype, Primeval Awareness',5:'Extra Attack',6:'Favoured Enemy improvement',10:'Hide in Plain Sight'},
 Rogue:{2:'Cunning Action',3:'Roguish Archetype',5:'Uncanny Dodge',7:'Evasion',11:'Reliable Talent'},
 Sorcerer:{2:'Font of Magic',3:'Metamagic',5:'3rd-level spells',6:'Sorcerous Origin feature',10:'Metamagic option'},
 Warlock:{2:'Eldritch Invocations',3:'Pact Boon',5:'3rd-level pact magic',6:'Otherworldly Patron feature',11:'Mystic Arcanum'},
 Wizard:{2:'Arcane Tradition',3:'2nd-level spells',5:'3rd-level spells',6:'Tradition feature',10:'Tradition feature'}
};
export function levelRewards(track,className,fromLevel,toLevel){
 const rewards=[];
 for(let level=fromLevel+1;level<=toLevel;level++){
  if(track==='fantasy'){
   const features=CLASS_FEATURES[className]||{};
   if(features[level])rewards.push({level,type:'class_feature',title:features[level]});
   if(level%4===0&&level<=19)rewards.push({level,type:'ability_improvement',title:'Ability Score Improvement or eligible feat',choices:['Increase one ability by 2','Increase two abilities by 1','Choose an eligible feat']});
   if(level===5)rewards.push({level,type:'proficiency',title:'Proficiency bonus increases to +3'});
   if(level===9)rewards.push({level,type:'proficiency',title:'Proficiency bonus increases to +4'});
   if(level===13)rewards.push({level,type:'proficiency',title:'Proficiency bonus increases to +5'});
   if(level===17)rewards.push({level,type:'proficiency',title:'Proficiency bonus increases to +6'});
  }else if(track==='detective'){
   const rank=[...DETECTIVE_RANKS].reverse().find(x=>x.level===level);
   if(rank)rewards.push({level,type:'promotion',title:rank.title,perk:rank.perk});
   else if(level%2===1)rewards.push({level,type:'specialism',title:'Choose an investigative specialism'});
  }else if(track==='horror'){
   const trait=HORROR_TRAITS.find(x=>x.level===level);
   if(trait)rewards.push({level,type:'survivor_trait',title:trait.title,description:trait.description});
   else if(level%3===0)rewards.push({level,type:'resilience',title:'Improve one survival strength'});
  }
 }
 return rewards;
}
export function spellSlotProgression(className,level){
 if(Number(level)<=1)return [];
 if(!['Wizard','Sorcerer','Bard','Cleric','Druid','Paladin','Ranger'].includes(className))return null;
 const full={Wizard:[2,3,4,4,4,4,4,4,4],Sorcerer:[2,3,4,4,4,4,4,4,4],Bard:[2,3,4,4,4,4,4,4,4],Cleric:[2,3,4,4,4,4,4,4,4],Druid:[2,3,4,4,4,4,4,4,4]};
 if(className==='Paladin'||className==='Ranger')return level<2?[]:[Math.floor(level/2)];
 return full[className].map((_,i)=>{const slotsByLevel={2:[2],3:[3],4:[4,2],5:[4,3],6:[4,3,2],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2],11:[4,3,3,3,2,1],12:[4,3,3,3,2,1],13:[4,3,3,3,2,1,1],14:[4,3,3,3,2,1,1],15:[4,3,3,3,2,1,1,1],16:[4,3,3,3,2,1,1,1],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,3,1,1,1,1],19:[4,3,3,3,3,2,1,1,1],20:[4,3,3,3,3,2,2,1,1]};return (slotsByLevel[level]||[])[i]||0});
}
