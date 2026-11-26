import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacter, characterSummary } from './character.js';

test('creates a valid persistent character sheet with derived stats', () => {
  const hero=createCharacter({name:'Mira',className:'Rogue',species:'Elf',level:3,abilities:{dex:16,con:12},proficiencies:['stealth']});
  assert.equal(hero.level,3);
  assert.equal(hero.proficiencyBonus,2);
  assert.equal(characterSummary(hero).abilities.dex.modifier,3);
  assert.ok(hero.maxHp>0);
});
test('clamps hit points to the sheet maximum', () => {
  const hero=createCharacter({name:'Mira',maxHp:10,hp:99});
  assert.equal(hero.hp,10);
});

test('rejects ability scores outside the 5e character creation range', () => {
  assert.throws(() => createCharacter({name:'Cheater',abilities:{str:99}}), /STR must be an integer from 3 to 20/);
  assert.throws(() => createCharacter({name:'Cheater',abilities:{dex:2}}), /DEX must be an integer from 3 to 20/);
});

test('accepts a character with a valid 20 ability score', () => {
  const hero=createCharacter({name:'Mira',abilities:{str:20}});
  assert.equal(hero.abilities.str,20);
});
