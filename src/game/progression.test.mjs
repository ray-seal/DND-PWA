import test from 'node:test';
import assert from 'node:assert/strict';
import {levelForProgression,progressSummary} from './progression.js';
test('detective career uses its own progression curve',()=>{assert.equal(levelForProgression(99,'detective'),1);assert.equal(levelForProgression(100,'detective'),2);assert.equal(levelForProgression(300,'dnd'),2)});
test('detective dossier reports progress to next rank',()=>{const p=progressSummary({xp:250,genre:'csi'});assert.equal(p.track,'detective');assert.equal(p.level,3);assert.equal(p.xpToNext,200)});
test('progression rejects negative or fractional XP',()=>{assert.throws(()=>levelForProgression(-1));assert.throws(()=>levelForProgression(1.5))});

test('horror has its own survival progression',()=>{assert.equal(levelForProgression(100,'horror'),2);assert.equal(levelForProgression(500,'horror'),4)});
test('fantasy uses fifth-edition XP thresholds',()=>{assert.equal(levelForProgression(299,'fantasy'),1);assert.equal(levelForProgression(300,'fantasy'),2);assert.equal(levelForProgression(900,'fantasy'),3)});
test('invalid XP is rejected',()=>{assert.throws(()=>levelForProgression(-1,'fantasy'),/non-negative/)});