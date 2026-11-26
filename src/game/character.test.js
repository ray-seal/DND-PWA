const test = require('node:test');
const assert = require('node:assert/strict');
const { createCharacter, characterSummary } = require('./character.js');

test('creates a valid persistent character sheet with derived stats', () => {
  const hero=createCharacter({name:'Mira',className:'Rogue',species:'Elf',level:3,abilities:{dex:16,con:12},proficiencies:['stealth']});
  assert.equal(hero.level,3); assert.equal(hero.proficiencyBonus,2);
  assert.equal(characterSummary(hero).abilities.dex.modifier,3); assert.ok(hero.maxHp>0);
});
test('clamps hit points to the sheet maximum', () => {
  const hero=createCharacter({name:'Mira',maxHp:10,hp:99});
  assert.equal(hero.hp,10);
});
