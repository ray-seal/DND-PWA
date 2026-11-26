export function rollAbilityScore(randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min) {
  const dice = Array.from({ length: 4 }, () => randomInt(1, 6));
  const dropped = Math.min(...dice);
  return { dice, dropped, score: dice.reduce((sum, die) => sum + die, 0) - dropped };
}

export function rollAbilityScores(randomInt) {
  return Array.from({ length: 6 }, () => rollAbilityScore(randomInt));
}
