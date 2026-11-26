import test from 'node:test';
import assert from 'node:assert/strict';
import {startingStats,speciesAbilityScores,speciesBaseAbilityScores} from './dnd5e.js';

test('level-one class hit points use class hit die plus Constitution modifier',()=>{
 assert.equal(startingStats('Barbarian',{con:14}).maxHp,14);
 assert.equal(startingStats('Fighter',{con:14}).maxHp,12);
 assert.equal(startingStats('Wizard',{con:14}).maxHp,8);
});
test('armour class follows starting armour and class unarmoured rules',()=>{
 assert.equal(startingStats('Fighter',{dex:14}).armourClass,16);
 assert.equal(startingStats('Rogue',{dex:16}).armourClass,14);
 assert.equal(startingStats('Barbarian',{dex:14,con:16}).armourClass,15);
 assert.equal(startingStats('Monk',{dex:16,wis:14}).armourClass,15);
});
test('level one spell slots match 5e class progression',()=>{
 assert.equal(startingStats('Wizard',{}).spellSlots,2);
 assert.equal(startingStats('Bard',{}).spellSlots,2);
 assert.equal(startingStats('Warlock',{}).spellSlots,1);
 assert.equal(startingStats('Paladin',{}).spellSlots,0);
 assert.equal(startingStats('Ranger',{}).spellSlots,0);
});
test('species ability bonuses apply once and can be reversed for editing',()=>{
 const base={str:15,dex:14,con:13,int:12,wis:10,cha:8};
 const final=speciesAbilityScores('Tiefling',base);
 assert.deepEqual(final,{str:15,dex:14,con:13,int:13,wis:10,cha:10});
 assert.deepEqual(speciesBaseAbilityScores('Tiefling',final),base);
});
test('hit points increase with level using fixed average hit die progression',()=>{
 assert.equal(startingStats('Fighter',{con:2},2).maxHp,17);
});
