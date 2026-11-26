import test from 'node:test';
import assert from 'node:assert/strict';
import { rollAbilityScore, rollAbilityScores } from './abilityScores.js';

test('rolls four six-sided dice and drops exactly one lowest die', () => {
  const dice = [6, 4, 2, 5];
  const result = rollAbilityScore(() => dice.shift());
  assert.deepEqual(result.dice, [6, 4, 2, 5]);
  assert.equal(result.dropped, 2);
  assert.equal(result.score, 15);
});

test('ability scores always fall within the 5e 3 to 18 range', () => {
  assert.equal(rollAbilityScore(() => 1).score, 3);
  assert.equal(rollAbilityScore(() => 6).score, 18);
});

test('generates six independent ability scores', () => {
  const values = [1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 2, 2, 2, 2, 4, 4, 6, 6, 6, 6, 1, 1];
  const scores = rollAbilityScores(() => values.shift());
  assert.equal(scores.length, 6);
  assert.ok(scores.every(x => x.dice.length === 4 && x.score >= 3 && x.score <= 18));
});
