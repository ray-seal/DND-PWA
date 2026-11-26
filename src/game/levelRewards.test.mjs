import test from 'node:test';
import assert from 'node:assert/strict';
import {levelRewards,spellSlotProgression} from './levelRewards.js';
test('fighter unlocks class features at the correct milestones',()=>{const r=levelRewards('fantasy','Fighter',1,5);assert.ok(r.some(x=>x.level===2&&x.title==='Action Surge'));assert.ok(r.some(x=>x.level===3&&x.title==='Martial Archetype'));assert.ok(r.some(x=>x.level===4&&x.type==='ability_improvement'));assert.ok(r.some(x=>x.level===5&&x.title==='Extra Attack'))});
test('detective promotion path unlocks leadership roles',()=>{const r=levelRewards('detective','Detective',1,5);assert.ok(r.some(x=>x.level===3&&x.title==='Experienced Detective Constable'));assert.ok(r.some(x=>x.level===5&&x.title==='Detective Sergeant'))});
test('horror survivor gains traits at milestones',()=>{const r=levelRewards('horror','Survivor',1,6);assert.ok(r.some(x=>x.level===2&&x.title==='Steady Nerves'));assert.ok(r.some(x=>x.level===6&&x.title==='Hard to Break'))});
test('spell slots scale for full caster classes',()=>{assert.deepEqual(spellSlotProgression('Wizard',1),[]);assert.deepEqual(spellSlotProgression('Wizard',5),[4,3,2]);assert.equal(spellSlotProgression('Fighter',5),null)});
