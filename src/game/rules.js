const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const XP_THRESHOLDS = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
const PROFICIENCY_BY_LEVEL = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];

function assertInteger(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new RangeError(`${label} must be an integer from ${min} to ${max}.`);
}
function abilityModifier(score) {
  assertInteger(score, "Ability score", 1, 30);
  return Math.floor((score - 10) / 2);
}
function levelForXp(xp) {
  assertInteger(xp, "XP", 0, Number.MAX_SAFE_INTEGER);
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) if (xp >= XP_THRESHOLDS[i]) level = i + 1;
  return level;
}
function proficiencyBonus(level) {
  assertInteger(level, "Level", 1, 20);
  return PROFICIENCY_BY_LEVEL[level - 1];
}
function validateCharacter(character) {
  if (!character || typeof character !== "object") throw new TypeError("A character is required.");
  if (typeof character.id !== "string" || !character.id.trim()) throw new TypeError("Character id is required.");
  if (typeof character.name !== "string" || !character.name.trim()) throw new TypeError("Character name is required.");
  if (!character.abilities || typeof character.abilities !== "object") throw new TypeError("Character abilities are required.");
  for (const ability of ABILITIES) assertInteger(character.abilities[ability], ability.toUpperCase(), 1, 30);
  assertInteger(character.level, "Level", 1, 20);
  assertInteger(character.xp ?? 0, "XP", 0, Number.MAX_SAFE_INTEGER);
  assertInteger(character.hp, "Current HP", 0, 10000);
  assertInteger(character.maxHp, "Maximum HP", 1, 10000);
  if (character.hp > character.maxHp) throw new RangeError("Current HP cannot exceed maximum HP.");
  assertInteger(character.ac, "Armour Class", 1, 40);
  if (!Array.isArray(character.proficiencies)) throw new TypeError("Proficiencies must be an array.");
  return character;
}
function skillModifier(character, skill) {
  validateCharacter(character);
  const ability = SKILLS[skill];
  if (!ability) throw new RangeError(`Unknown skill: ${skill}`);
  const proficient = character.proficiencies.includes(skill);
  return abilityModifier(character.abilities[ability]) + (proficient ? proficiencyBonus(character.level) : 0);
}
const SKILLS = Object.freeze({
  acrobatics:"dex", animalHandling:"wis", arcana:"int", athletics:"str", deception:"cha",
  history:"int", insight:"wis", intimidation:"cha", investigation:"int", medicine:"wis",
  nature:"int", perception:"wis", performance:"cha", persuasion:"cha", religion:"int",
  sleightOfHand:"dex", stealth:"dex", survival:"wis"
});
function rollD20(randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min) {
  return randomInt(1, 20);
}
function rollD20Result(randomInt, { advantage = false, disadvantage = false } = {}) {
  const rolls = advantage === disadvantage ? [rollD20(randomInt)] : [rollD20(randomInt), rollD20(randomInt)];
  const die = advantage ? Math.max(...rolls) : disadvantage ? Math.min(...rolls) : rolls[0];
  return { die, rolls, mode: advantage === disadvantage ? "normal" : advantage ? "advantage" : "disadvantage" };
}
function abilityCheck(character, ability, options = {}) {
  const { proficient = false, dc, randomInt } = options;
  validateCharacter(character);
  if (!ABILITIES.includes(ability)) throw new RangeError(`Unknown ability: ${ability}`);
  const { die, rolls, mode } = rollD20Result(randomInt, options);
  const total = die + abilityModifier(character.abilities[ability]) + (proficient ? proficiencyBonus(character.level) : 0);
  return { kind:"ability_check", die, rolls, mode, modifier:abilityModifier(character.abilities[ability]), proficiency:proficient ? proficiencyBonus(character.level) : 0, total, dc:dc ?? null, success:dc == null ? null : total >= dc, critical:die === 20, fumble:die === 1 };
}
function skillCheck(character, skill, options = {}) {
  const { dc, randomInt } = options;
  const ability = SKILLS[skill];
  if (!ability) throw new RangeError(`Unknown skill: ${skill}`);
  const { die, rolls, mode } = rollD20Result(randomInt, options);
  const modifier = skillModifier(character, skill);
  const total = die + modifier;
  return { kind:"skill_check", skill, ability, die, rolls, mode, modifier, total, dc:dc ?? null, success:dc == null ? null : total >= dc, critical:die === 20, fumble:die === 1 };
}
function savingThrow(character, ability, options = {}) {
  const { dc, randomInt } = options;
  validateCharacter(character);
  if (!ABILITIES.includes(ability)) throw new RangeError(`Unknown ability: ${ability}`);
  const proficient = (character.savingThrowProficiencies || []).includes(ability);
  const { die, rolls, mode } = rollD20Result(randomInt, options);
  const modifier = abilityModifier(character.abilities[ability]) + (proficient ? proficiencyBonus(character.level) : 0);
  const total = die + modifier;
  return { kind:"saving_throw", ability, die, rolls, mode, modifier, total, dc:dc ?? null, success:dc == null ? null : total >= dc, critical:die === 20, fumble:die === 1 };
}
function attackRoll(character, ability, targetAc, options = {}) {
  const { randomInt, bonus = 0 } = options;
  validateCharacter(character);
  if (!ABILITIES.includes(ability)) throw new RangeError(`Unknown attack ability: ${ability}`);
  assertInteger(targetAc, "Target AC", 1, 40);
  const proficient = character.attackProficient !== false;
  const proficiency = proficient ? proficiencyBonus(character.level) : 0;
  const modifier = abilityModifier(character.abilities[ability]);
  const { die, rolls, mode } = rollD20Result(randomInt, options);
  const total = die + modifier + proficiency + bonus;
  const hit = die === 20 || (die !== 1 && total >= targetAc);
  return { kind:"attack", die, rolls, mode, ability, modifier, proficiency, bonus, total, targetAc, hit, critical:die === 20, fumble:die === 1 };
}
function initiative(character, options = {}) {
  validateCharacter(character);
  const { randomInt } = options;
  const { die, rolls, mode } = rollD20Result(randomInt, options);
  const modifier = abilityModifier(character.abilities.dex);
  return { kind:"initiative", die, rolls, mode, modifier, total:die + modifier };
}
function addExperience(character, amount) {
  validateCharacter(character);
  assertInteger(amount, "XP award", 0, 1000000);
  const previousLevel = levelForXp(character.xp || 0);
  const xp = (character.xp || 0) + amount;
  const level = levelForXp(xp);
  return { ...character, xp, level, levelsGained:level - previousLevel };
}
function encounterBudget(characters, difficulty = "balanced") {
  if (!Array.isArray(characters) || characters.length < 1) throw new TypeError("At least one character is required.");
  const multipliers = { easy:0.5, balanced:1, hard:1.5, deadly:2 };
  if (!(difficulty in multipliers)) throw new RangeError("Unknown encounter difficulty.");
  const levels = characters.map(c => { validateCharacter(c); return c.level; });
  const averageLevel = levels.reduce((a,b)=>a+b,0) / levels.length;
  const partyLevel = Math.max(1, Math.round(averageLevel));
  const base = 25 * partyLevel * characters.length;
  return { difficulty, partyLevel, averageLevel, partySize:characters.length, targetBudget:Math.round(base * multipliers[difficulty]), recommendedLevelRange:{min:Math.max(1,Math.floor(averageLevel)-1),max:Math.min(20,Math.ceil(averageLevel)+1)} };
}
module.exports = { ABILITIES, SKILLS, XP_THRESHOLDS, abilityModifier, levelForXp, proficiencyBonus, validateCharacter, skillModifier, abilityCheck, skillCheck, savingThrow, attackRoll, initiative, addExperience, encounterBudget };
