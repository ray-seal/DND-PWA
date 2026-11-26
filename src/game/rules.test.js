const test = require("node:test");
const assert = require("node:assert/strict");
const rules = require("./rules");

const hero = {
  id:"hero-1", name:"Mira", level:3, xp:900, hp:20, maxHp:20, ac:15,
  abilities:{str:16,dex:14,con:14,int:10,wis:12,cha:8},
  proficiencies:["athletics","perception"],
  savingThrowProficiencies:["str"]
};
const fixed = value => () => value;

test("ability modifiers use floor((score - 10) / 2)", () => {
  assert.equal(rules.abilityModifier(8), -1);
  assert.equal(rules.abilityModifier(10), 0);
  assert.equal(rules.abilityModifier(17), 3);
});
test("level and proficiency follow XP thresholds", () => {
  assert.equal(rules.levelForXp(899), 2);
  assert.equal(rules.levelForXp(900), 3);
  assert.equal(rules.proficiencyBonus(5), 3);
});
test("skill checks apply ability modifier and proficiency exactly once", () => {
  const result = rules.skillCheck(hero, "athletics", {dc:15, randomInt:fixed(10)});
  assert.equal(result.modifier, 5);
  assert.equal(result.total, 15);
  assert.equal(result.success, true);
});
test("natural 20 is a critical hit and natural 1 misses", () => {
  assert.equal(rules.attackRoll(hero,"str",30,{randomInt:fixed(20)}).hit,true);
  assert.equal(rules.attackRoll(hero,"str",5,{randomInt:fixed(1)}).hit,false);
});
test("saving throws include proficiency only when proficient", () => {
  assert.equal(rules.savingThrow(hero,"str",{dc:15,randomInt:fixed(10)}).total,15);
  assert.equal(rules.savingThrow(hero,"dex",{dc:15,randomInt:fixed(10)}).total,12);
});
test("initiative uses dexterity modifier", () => {
  assert.equal(rules.initiative(hero,{randomInt:fixed(10)}).total,12);
});
test("XP awards advance levels but do not rewrite character identity", () => {
  const upgraded = rules.addExperience(hero,1800);
  assert.equal(upgraded.level,4);
  assert.equal(upgraded.name,"Mira");
  assert.equal(upgraded.levelsGained,1);
});
test("encounter budget responds to party level and size", () => {
  const one = rules.encounterBudget([hero],"balanced");
  const two = rules.encounterBudget([hero,{...hero,id:"hero-2",level:5}],"hard");
  assert.equal(one.targetBudget,75);
  assert.equal(two.targetBudget,300);
});
test("invalid character sheets are rejected", () => {
  assert.throws(()=>rules.validateCharacter({...hero,abilities:{str:0}}),/STR/);
});
